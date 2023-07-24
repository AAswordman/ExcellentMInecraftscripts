import ExGameClient from "./ExGameClient.js";
import ExDimension from "./ExDimension.js";
import { world, MinecraftDimensionTypes, PlayerJoinAfterEvent, Player, PlayerLeaveAfterEvent, system, RawMessage, EntitySpawnAfterEvent, Entity } from "@minecraft/server";
import ExGameConfig from "./ExGameConfig.js";
import initConsole from "../utils/Console.js";
import ExServerEvents from "./events/ExServerEvents.js";
import UUID from "../utils/UUID.js";
import ExErrorQueue from './ExErrorQueue.js';
import SetTimeOutSupport from "../interface/SetTimeOutSupport.js";
import ExConfig from '../ExConfig.js';
import ExTickQueue from "./ExTickQueue.js";
import ExCommand from './env/ExCommand.js';
import ExClientEvents from "./events/ExClientEvents.js";
import ExEntityController from './entity/ExEntityController.js';
import ExEntityEvents from "./entity/ExEntityEvents.js";
import "../../reflect-metadata/Reflect.js";
import { eventDecoratorFactory, registerEvent } from "./events/eventDecoratorFactory.js";
import notUtillTask from "../utils/notUtillTask.js";
import ExSound from "./env/ExSound.js";
import { ExEventNames, TickEvent } from "./events/events.js";
import { falseIfError } from "../utils/tool.js";


export default class ExGameServer implements SetTimeOutSupport {
    clients;
    clients_nameMap;
    _events;
    entityControllers: Map<string, typeof ExEntityController> = new Map();
    static isInitialized: boolean;

    constructor(config: ExConfig) {
        this.clients = new Map<string, ExGameClient>();
        this.clients_nameMap = new Map<string, ExGameClient>();

        this._events = new ExServerEvents(this);
        if (!ExGameServer.isInitialized) {
            ExGameServer.isInitialized = true;
            ExGameConfig.config = config;

            if (!config.watchDog) {
                system.beforeEvents.watchdogTerminate.subscribe((e) => {
                    e.cancel = true;
                });
            }
            ExGameConfig.console = initConsole(ExGameConfig);
            ExErrorQueue.init();
            ExTickQueue.init(this);
            ExCommand.init(this);
            ExClientEvents.init(this);
            ExEntityEvents.init(this);
        }
        for (const p of world.getAllPlayers()) {
            if (!this.playerIsInSet.has(p.name)) {
                this.onClientJoin({
                    "playerId": p.id,
                    "playerName": p.name
                });
            }
        }
        eventDecoratorFactory(this.getEvents(), this);
    }

    say(msg: string | { rawtext: RawMessage[] }) {
        world.sendMessage(msg);
    }

    addEntityController(id: string, ec: typeof ExEntityController) {
        this.entityControllers.set(id, ec);
    }

    @registerEvent(ExEventNames.afterEntitySpawn)
    onEntitySpawn(e: EntitySpawnAfterEvent) {
        if(!falseIfError(() => (e.entity.typeId))) return;
        let id;
        try { id = e.entity.typeId } catch (e) { return; }
        const entityConstructor = this.entityControllers.get(e.entity.typeId);
        if (entityConstructor) {
            new (entityConstructor)(e.entity, this);
        }
    }

    createEntityController<T extends ExEntityController>(e: Entity, ec: new (e: Entity, server: ExGameServer) => (T)) {
        return new ec(e, this);
    }

    getDimension(dimensionId: string) {
        return world.getDimension(dimensionId);
    }
    getExDimension(dimensionId: string) {
        return ExDimension.getInstance(this.getDimension(dimensionId));
    }

    getEvents() {
        return this._events;
    }

    private static musicMap = new Map<string, ExSound>();
    getSound(id: string, t: string) {
        if (ExGameServer.musicMap.has(id)) {
            return ExGameServer.musicMap.get(id)!;
        } else {
            let m = new ExSound(this, id, t);
            ExGameServer.musicMap.set(id, m);
            return m;
        }
    }



    getClients() {
        return this.clients.values();
    }
    getPlayers() {
        let players = [];
        for (let k of this.clients) {
            players.push(k[1].player);
        }
        return players;
    }
    getExPlayers() {
        let players = [];
        for (let k of this.clients) {
            players.push(k[1].exPlayer);
        }
        return players;
    }
    // getPlayers(){
    //     return 
    // }

    findClientByName(playerName: string) {
        return this.clients_nameMap.get(playerName);
    }

    findClientByPlayer(player: Player) {
        for (let k of this.clients) {
            if (k[1].player == player) {
                return k[1];
            }
        }
        return undefined;
    }

    private playerIsInSet = new Set<string>();

    @registerEvent(ExEventNames.afterPlayerJoin)
    onClientJoin(event: PlayerJoinAfterEvent) {
        const playerName = event.playerName;
        this.playerIsInSet.add(playerName);

        notUtillTask(this, () => {
            return world.getAllPlayers().findIndex(p => p.name === playerName) !== -1;
        },
            () => {
                let player = world.getAllPlayers().find(e => e.name === playerName);
                if (!player) throw new Error(`Player ${playerName} not found`);
                let id = UUID.randomUUID();
                let client = this.newClient(id, player);
                this.clients.set(id, client);
                this.clients_nameMap.set(player.name, client);
            });
    }

    @registerEvent(ExEventNames.afterPlayerLeave)
    onClientLeave(event: PlayerLeaveAfterEvent) {
        this.playerIsInSet.delete(event.playerName);

        let client = this.findClientByName(event.playerName);
        if (client === undefined) {
            ExGameConfig.console.error(event.playerName + " client is not exists");
            return;
        }
        client.onLeave();
        this.clients.delete(client.clientId);
        this.clients_nameMap.delete(event.playerName);

    }

    newClient(id: string, player: Player): ExGameClient {
        return new ExGameClient(this, id, player);
    }

    setTimeout(fun: () => void, timeout: number) {
        let time = 0;
        let method = (e: TickEvent) => {
            time += e.deltaTime * 1000;
            if (time > timeout) {
                this.getEvents().exEvents.tick.unsubscribe(method);
                fun();
            }
        };
        this.getEvents().exEvents.tick.subscribe(method);
    }
}
