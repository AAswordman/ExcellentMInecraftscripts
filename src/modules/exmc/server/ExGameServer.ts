import ExGameClient from "./ExGameClient.js";
import ExDimension from "./ExDimension.js";
import { world,  PlayerJoinAfterEvent, Player, PlayerLeaveAfterEvent, system, RawMessage, EntitySpawnAfterEvent, Entity, Dimension, PlayerSpawnAfterEvent, EntityLoadAfterEvent, PlayerLeaveBeforeEvent } from "@minecraft/server";
import ExGameConfig from "./ExGameConfig.js";
import ExServerEvents from "./events/ExServerEvents.js";
import UUID from "../utils/UUID.js";
import ExErrorQueue from './ExErrorQueue.js';
import SetTimeOutSupport from "../interface/SetTimeOutSupport.js";
import ExConfig from '../ExConfig.js';
import ExCommand from './env/ExCommand.js';
import ExClientEvents from "./events/ExClientEvents.js";
import ExEntityController from './entity/ExEntityController.js';
import ExEntityEvents from "./entity/ExEntityEvents.js";
import "../../reflect-metadata/Reflect.js";
import { eventDecoratorFactory, registerEvent } from "./events/eventDecoratorFactory.js";
import notUtillTask from "../utils/notUtillTask.js";
import ExMusic from "./env/ExMusic.js";
import { ExEventNames, TickEvent } from "./events/events.js";
import { falseIfError } from "../utils/tool.js";
import ExSystem from "../utils/ExSystem.js";
import Vector3 from "../utils/math/Vector3.js";
import DynamicPropertyManager from "../interface/DynamicPropertyManager.js";
import ExEntityPool from "./entity/ExEntityPool.js";
import ExContext from "./ExGameObject.js";
import ExGame from "./ExGame.js";
import { MinecraftDimensionTypes } from "../../vanilla-data/lib/index.js";

export default class ExGameServer extends ExContext implements SetTimeOutSupport {
    clients;
    clients_nameMap;
    _events;
    entityControllers: Map<string, typeof ExEntityController> = new Map();
    static dimensionMap = new Map<string, Dimension>();
    static isInitialized: boolean;

    constructor(config: ExConfig) {
        super(config.gameContext);
        this.clients = new Map<string, ExGameClient>();
        this.clients_nameMap = new Map<string, ExGameClient>();

        this._events = new ExServerEvents(this);
        if (!ExGameServer.isInitialized) {
            ExGameServer.isInitialized = true;
            ExGameConfig.config = config;

            ExGameServer.dimensionMap.set(MinecraftDimensionTypes.Nether, world.getDimension(MinecraftDimensionTypes.Nether));
            ExGameServer.dimensionMap.set(MinecraftDimensionTypes.Overworld, world.getDimension(MinecraftDimensionTypes.Overworld));
            ExGameServer.dimensionMap.set(MinecraftDimensionTypes.TheEnd, world.getDimension(MinecraftDimensionTypes.TheEnd));

            if (!config.watchDog) {
                system.beforeEvents.watchdogTerminate.subscribe((e) => {
                    e.cancel = true;
                });
            }
            ExErrorQueue.init();
            ExCommand.init(this);
            ExClientEvents.init(this);
            ExEntityEvents.init(this);
        }

        this.run(() => {

            for (const p of world.getAllPlayers()) {
                if (!this.playerIsInSet.has(p.name)) {
                    this.onClientJoin({
                        "playerId": p.id,
                        "playerName": p.name
                    });
                }
            }
    
            for(const e of this.getDimension(MinecraftDimensionTypes.Overworld).getEntities()){
                this._onEntityLoad({
                    entity: e
                });
            }
            for(const e of this.getDimension(MinecraftDimensionTypes.Nether).getEntities()){
                this._onEntityLoad({
                    entity: e
                });
            }
            for(const e of this.getDimension(MinecraftDimensionTypes.TheEnd).getEntities()){
                this._onEntityLoad({
                    entity: e
                });
            }
        });
        // for (const c of this.getClients()) {
        //     if (!c.isLoaded) {
        //         c.onLoad();
        //         c.isLoaded = true;
        //     }
        // }
        eventDecoratorFactory(this.getEvents(), this);
    }

    say(msg: string | { rawtext: RawMessage[] }) {
        world.sendMessage(msg);
    }

    addEntityController(id: string, ec: typeof ExEntityController) {
        this.entityControllers.set(id, ec);
    }
    getDefaultSpawnLocation() {
        return new Vector3(world.getDefaultSpawnLocation());
    }
    getDynamicPropertyManager(): DynamicPropertyManager {
        return world;
    }

    @registerEvent(ExEventNames.afterEntityLoad)
    _onEntityLoad(e: EntityLoadAfterEvent) {
        if (!e.entity.isValid) return;
        let id;
        try { id = e.entity.typeId } catch (e) { return; }
        const entityConstructor = this.entityControllers.get(e.entity.typeId);
        if (entityConstructor) {
            if (!ExEntityPool.pool.has(e.entity)) {
                ExEntityPool.pool.set(e.entity, new (entityConstructor)(e.entity, this, false));
            }
        }
    }

    @registerEvent(ExEventNames.afterEntitySpawn)
    _onEntitySpawn(e: EntitySpawnAfterEvent) {
        if (!e.entity.isValid) return;
        let id;
        try { id = e.entity.typeId } catch (e) { return; }
        const entityConstructor = this.entityControllers.get(e.entity.typeId);
        if (entityConstructor) {
            ExEntityPool.pool.set(e.entity, new (entityConstructor)(e.entity, this, true));
        }
    }


    createEntityController<T extends ExEntityController>(e: Entity, ec: new (e: Entity, server: ExGameServer, spawn: boolean) => (T)) {
        return new ec(e, this,false);
    }

    getDimension(dimensionId: string) {
        return ExGameServer.dimensionMap.get(dimensionId)!;
    }
    getExDimension(dimensionId: string | Dimension) {
        return ExDimension.getInstance(dimensionId instanceof Dimension ? dimensionId : this.getDimension(dimensionId));
    }

    getEvents() {
        return this._events;
    }

    private static musicMap = new Map<string, ExMusic>();
    getMusic(id: string) {
        return new ExMusic(this, id);

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
            if (ExSystem.getId(k[1].player) === ExSystem.getId(player)) {
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
                if (this.findClientByPlayer(player)) return;
                let id = UUID.randomUUID();
                let client = this.newClient(id, player);
                this.clients.set(id, client);
                this.clients_nameMap.set(player.name, client);
            });
    }

    // @registerEvent(ExEventNames.afterPlayerSpawn, (obj: ExGameServer, e: PlayerSpawnAfterEvent) => e.initialSpawn)
    // onClientLoad(e: PlayerSpawnAfterEvent) {
    //     let c = this.findClientByPlayer(e.player);
    //     if (c && !c.isLoaded) {
    //         c.onLoad();
    //         c.isLoaded = true;
    //     } else {
    //         ExGameConfig.console.error("can't load client: " + e.player.nameTag);
    //     }
    // }


    @registerEvent(ExEventNames.beforePlayerLeave)
    onClientLeave(event: PlayerLeaveBeforeEvent) {
        const playerName = event.player.name;
        if(!this.playerIsInSet.has(playerName)) return;
        this.playerIsInSet.delete(playerName);
        console.info("Player " + playerName + " leave");
        let client = this.findClientByName(playerName);
        if (client === undefined) {
            console.warn(playerName + " client is not exists");
            return;
        }
        client.onLeave();
        this.clients.delete(client.clientId);
        this.clients_nameMap.delete(playerName);

    }

    newClient(id: string, player: Player): ExGameClient {
        return new ExGameClient(this, id, player);
    }
}
