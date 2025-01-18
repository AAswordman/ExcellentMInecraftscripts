import ExGameServer from "../ExGameServer.js";
import ExEntity from "./ExEntity.js";
import { Entity, EntityDieAfterEvent, EntityHurtAfterEvent, EntityLoadAfterEvent, EntityRemoveAfterEvent } from '@minecraft/server';
import ExEntityEvents from "./ExEntityEvents.js";
import DisposeAble from "../../interface/DisposeAble.js";
import SetTimeOutSupport from "../../interface/SetTimeOutSupport.js";
import { eventDecoratorFactory, registerEvent } from "../events/eventDecoratorFactory.js";
import { ExEventNames, ExOtherEventNames, TickEvent } from "../events/events.js";
import { falseIfError } from "../../utils/tool.js";
import ExEntityPool from "./ExEntityPool.js";
import ExContext from "../ExContext.js";
/**
 * 控制实体的控制器类。
 * @implements {DisposeAble}
 * @implements {SetTimeOutSupport}
 */
export default class ExEntityController extends ExContext
    implements DisposeAble, SetTimeOutSupport {

    server!: ExGameServer;
    private _id: string;
    getId() {
        return this._id;
    }

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

    getEvents() {
        return this._events;
    }
    public constructor(e: Entity, server: ExGameServer, spawn:boolean) {
        super();
        this._entity = e;
        this.server = server;
        this._events = new ExEntityEvents(this);
        this._id = e.id;
        this._init(server);
        this.onAppear(spawn);
        this.onMemoryLoad();
        eventDecoratorFactory(this.getEvents(), this);
    }
    protected _init(server: ExGameServer) {
        this.exEntity = ExEntity.getInstance(this.entity);
    }

    get isLoaded() {
        return !this.interrupt;
    }

    @registerEvent<ExEntityController>(
        ExEventNames.afterEntityRemove,
        (ctrl, e: EntityRemoveAfterEvent) => {
            return e.removedEntityId === ctrl.getId();
        }
    )
    onMemoryRemove() {
        console.warn("remove " + this._entity.typeId);
        this.stopContext();
    }

    @registerEvent<ExEntityController>(ExEventNames.afterEntityLoad)
    onMemoryLoad() {
        console.warn("load " + this._entity.typeId);
        this.startContext();
    }

    @registerEvent<ExEntityController>(ExEventNames.afterEntityDie)
    public destroyTrigger() {
        if (!this._isDestroyed) {
            this._isDestroyed = true;
            this.onDestroy();
        }
    }
    onAppear(spawn: boolean) {

    }
    onDestroy() {
        this.dispose();
    }
    private _isDestroyed = false;
    dispose() {
        console.warn("dispose " + this._entity.typeId);
        this.getEvents().cancelAll();
        if (!this.interrupt) this.onMemoryRemove();
        ExEntityPool.pool.delete(this.getId());
    }

    private _isKilled: boolean = false;
    @registerEvent<ExEntityController>(
        ExOtherEventNames.afterOnHurt,
        (ctrl, e) => ctrl.exEntity.health <= 0 && !ctrl._isKilled
    )
    onKilled(e: EntityHurtAfterEvent) {
        this._isKilled = true;
    }
}