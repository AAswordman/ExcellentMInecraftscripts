import ExGameClient from "./ExGameClient.js";
import ExDimension from "./ExDimension.js";
import { world, MinecraftDimensionTypes, PlayerJoinEvent, Player, TickEvent, PlayerLeaveEvent, system, EntityCreateEvent } from "@minecraft/server";
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

import "../../reflect-metadata/Reflect.js"
import format from '../utils/format.js';
import { eventDecoratorFactory, registerEvent } from "./events/EventDecoratorFactory.js";


export default class ExGameServer implements SetTimeOutSupport {
    clients;
    clients_nameMap;
    _events;
    entityControllers: Map<string, typeof ExEntityController> = new Map();

    constructor(config: ExConfig) {
        ExGameConfig.config = config;

        if (!config.watchDog) {
            system.events.beforeWatchdogTerminate.subscribe((e) => {
                e.cancel = true;
            });
        }

        this.clients = new Map<string, ExGameClient>();
        this.clients_nameMap = new Map<string, ExGameClient>();
        ExGameConfig.console = initConsole(ExGameConfig);

        this._events = new ExServerEvents(this);

        ExErrorQueue.init(this);
        ExTickQueue.init(this);
        ExCommand.init(this);
        ExClientEvents.init(this);
        ExEntityEvents.init(this);

        eventDecoratorFactory(this.getEvents(), this);
    }

    addEntityController(id: string, ec: typeof ExEntityController) {
        this.entityControllers.set(id, ec);
    }

    @registerEvent("entityCreate")
    onEntitySpawn(e:EntityCreateEvent){
        const entityConstructor = this.entityControllers.get(e.entity.typeId);
        if(entityConstructor){
            new (entityConstructor)(e.entity,this);
        }
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

    @registerEvent("playerJoin")
    onClientJoin(event: PlayerJoinEvent) {
        let player = event.player;
        let id = UUID.randomUUID();
        let client = this.newClient(id, player);
        this.clients.set(id, client);
        this.clients_nameMap.set(player.name, client);
    }

    @registerEvent("playerLeave")
    onClientLeave(event: PlayerLeaveEvent) {
        let client = this.findClientByName(event.playerName);
        if (client === undefined) {
            ExGameConfig.console.error(event.playerName + "client is not exists");
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
                this.getEvents().events.tick.unsubscribe(method);
                fun();
            }
        };
        this.getEvents().events.tick.subscribe(method);
    }
}
