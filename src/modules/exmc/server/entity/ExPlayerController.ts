import ExGameServer from "../ExGameServer.js";
import ExEntity from "./ExEntity.js";
import { Entity, EntityHurtEvent, Player } from '@minecraft/server';
import ExEntityEvents from "./ExEntityEvents.js";
import { eventDecoratorDispose, eventDecoratorFactory, registerEvent } from "../events/EventDecoratorFactory.js";
import ExGameConfig from "../ExGameConfig.js";
import DisposeAble from "../../interface/DisposeAble.js";
import ExPlayer from './ExPlayer.js';
import ExEntityController from "./ExEntityController.js";
import applyMixins from "../../utils/applyMixins.js";

export default class ExPlayerController extends ExPlayer implements DisposeAble,ExEntityController {
    server!: ExGameServer;
    _events!: ExEntityEvents;
    public constructor(e: Player, server: ExGameServer) {
        super(e);
        this.init(server);
    }
    [Symbol.hasInstance](obj:any){
        return obj instanceof ExPlayerController || obj instanceof ExEntityController;
    }

    init(server: ExGameServer): void {
        throw new Error("Method not implemented.");
    }
    onSpawn(): void {
        throw new Error("Method not implemented.");
    }
    onDestroy(): void {
        throw new Error("Method not implemented.");
    }
    dispose(): void {
        throw new Error("Method not implemented.");
    }
    getEvents(): ExEntityEvents {
        throw new Error("Method not implemented.");
    }
    onDespawn(): void {
        throw new Error("Method not implemented.");
    }
    onKilled(e: EntityHurtEvent): void {
        throw new Error("Method not implemented.");
    }
    // init!:(server: ExGameServer) => void;
    // onSpawn!:() => void;
    // onDestroy!:() => void;
    // getEvents!:() => ExEntityEvents;
    // onDespawn!:() => void;
    // onKilled!:(e: EntityHurtEvent) => void;
    // dispose!:() => void;
}

applyMixins(ExPlayerController,[ExEntityController]);