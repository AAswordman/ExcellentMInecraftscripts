import ExGameServer from "../ExGameServer.js";
import ExEntity from "./ExEntity.js";
import { Entity, EntityHurtEvent } from '@minecraft/server';
import ExEntityEvents from "./ExEntityEvents.js";
import { eventDecoratorDispose, eventDecoratorFactory, registerEvent } from "../events/EventDecoratorFactory.js";
import ExGameConfig from "../ExGameConfig.js";
import DisposeAble from "../../interface/DisposeAble.js";

export default class ExEntityController implements DisposeAble {
    server!: ExGameServer;
    private _entity: Entity;
    public get entity(): Entity {
        return this._entity;
    }
    public set entity(value: Entity) {
        this._entity = value;
    }
    private _exEntity!: ExEntity;
    public get exEntity(): ExEntity {
        return this._exEntity;
    }
    public set exEntity(value: ExEntity) {
        this._exEntity = value;
    }
    _events!: ExEntityEvents;
    public constructor(e: Entity, server: ExGameServer) {
        this._entity = e;
        this.server = server;
        this._events = new ExEntityEvents(this);
        this.init(server);
        this.onSpawn();
        eventDecoratorFactory(this.getEvents(), this);
    }
    init(server: ExGameServer) {
        this.exEntity = ExEntity.getInstance(this.entity);
    }

    onSpawn() {
    }
    onDestroy() {
        this.dispose();
    }
    dispose() {
        eventDecoratorDispose(this.getEvents(), this);
    }
    getEvents() {
        return this._events;
    }

    onDespawn() {
        this.onDestroy();
    }
    @registerEvent<ExEntityController>("onHurt", (ctrl, e) => ctrl.exEntity.getHealth() <= 0)
    onKilled(e: EntityHurtEvent) {
        this.onDestroy();
    }
}