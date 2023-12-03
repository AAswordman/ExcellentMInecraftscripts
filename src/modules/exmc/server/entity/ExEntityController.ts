import ExGameServer from "../ExGameServer.js";
import ExEntity from "./ExEntity.js";
import { Entity, EntityHurtAfterEvent, EntityRemoveAfterEvent } from '@minecraft/server';
import ExEntityEvents from "./ExEntityEvents.js";
import DisposeAble from "../../interface/DisposeAble.js";
import SetTimeOutSupport from "../../interface/SetTimeOutSupport.js";
import { eventDecoratorFactory, registerEvent } from "../events/eventDecoratorFactory.js";
import { ExEventNames, ExOtherEventNames, TickEvent } from "../events/events.js";

export default class ExEntityController implements DisposeAble, SetTimeOutSupport {
    server!: ExGameServer;
    private _entity: Entity;
    private _isKilled: boolean = false;
    private _id: string;
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
        this._id = e.id;
        this.init(server);
        this.onSpawn();
        eventDecoratorFactory(this.getEvents(), this);
        // console.warn("track " + e.typeId);
    }
    getId(){
        return this._id;
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
    init(server: ExGameServer) {
        this.exEntity = ExEntity.getInstance(this.entity);
    }

    onSpawn() {
    }

    @registerEvent<ExEntityController>(ExEventNames.afterEntityRemove, (ctrl, e: EntityRemoveAfterEvent) => {
        return e.removedEntityId === ctrl.getId();
    })
    public destroyTrigger() {
        if (!this.isDestroyed) {
            this.isDestroyed = true;
            this.onDestroy();
        }
    }
    onDestroy() {
        this.dispose();
    }

    isDestroyed = false;
    dispose() {
        this.getEvents().cancelAll();
    }
    getEvents() {
        return this._events;
    }

    onDespawn() {
        this.onDestroy();
    }
    @registerEvent<ExEntityController>(ExOtherEventNames.afterOnHurt, (ctrl, e) => ctrl.exEntity.health <= 0 && !ctrl._isKilled)
    onKilled(e: EntityHurtAfterEvent) {
        this._isKilled = true;
    }
}