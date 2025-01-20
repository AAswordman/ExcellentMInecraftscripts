import ExGameServer from "../ExGameServer.js";
import ExEntity from "./ExEntity.js";
import { Entity, Player } from '@minecraft/server';
import ExEntityEvents from "./ExEntityEvents.js";
import { eventDecoratorFactory, registerEvent } from "../events/eventDecoratorFactory.js";
import ExGameConfig from "../ExGameConfig.js";
import DisposeAble from "../../interface/DisposeAble.js";
import ExPlayer from './ExPlayer.js';
import ExEntityController from "./ExEntityController.js";
import applyMixins from "../../utils/applyMixins.js";

import "../../../reflect-metadata/Reflect.js";

export default class ExPlayerController extends ExEntityController {
    public constructor(e: Player, server: ExGameServer, spawn: boolean) {
        super(e, server,spawn);
        this._init(server);
    }
    protected override _init(server: ExGameServer): void {
        this.exEntity = ExPlayer.getInstance(this.entity);
    }
    override get entity(): Player {
        return this.entity;
    }
    override set entity(e:Player) {
        this.entity = e;
    }
    override get exEntity(): ExPlayer {
        return this.exEntity;
    }
    override set exEntity(e:ExPlayer) {
        this.exEntity = e;
    }
}
