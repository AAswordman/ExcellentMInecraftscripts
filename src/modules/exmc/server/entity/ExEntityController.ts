import ExGameServer from "../ExGameServer.js";
import ExEntity from "./ExEntity.js";
import { Entity, EntityDieAfterEvent, EntityHurtAfterEvent, EntityLoadAfterEvent, EntityRemoveAfterEvent, EntityRemoveBeforeEvent } from '@minecraft/server';
import ExEntityEvents from "./ExEntityEvents.js";
import DisposeAble from "../../interface/DisposeAble.js";
import SetTimeOutSupport from "../../interface/SetTimeOutSupport.js";
import { eventDecoratorFactory, registerEvent } from "../events/eventDecoratorFactory.js";
import { ExEventNames, ExOtherEventNames, TickEvent } from "../events/events.js";
import { falseIfError } from "../../utils/tool.js";
import ExEntityPool from "./ExEntityPool.js";
import ExContext from "../ExGameObject.js";
import { ignorn } from "../ExErrorQueue.js";
/**
 * 控制实体的控制器类。
 * @implements {DisposeAble}
 * @implements {SetTimeOutSupport}
 */
export default class ExEntityController extends ExContext
    implements DisposeAble, SetTimeOutSupport {

    server!: ExGameServer;
    private _id: string;
    private _typeId: string;
    getTypeId() {
        return this._typeId;
    }
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
    public constructor(e: Entity, server: ExGameServer, spawn: boolean) {
        super(server);
        this._entity = e;
        this.server = server;
        this._events = new ExEntityEvents(this);
        this._id = e.id;
        this._typeId = e.typeId;
        this._init(server);
        eventDecoratorFactory(this.getEvents(), this);
        this.onAppear(spawn);
    }
    protected _init(server: ExGameServer) {
        this.exEntity = ExEntity.getInstance(this.entity);
    }

    get isLoaded() {
        return !this.interrupt;
    }

    @registerEvent<ExEntityController>(ExEventNames.beforeEntityRemove)
    onMemoryRemove() {
        if (this.isLoaded) {
            console.info(this._entity.typeId);
            this.stopContext();
            this.getEvents().stopContext();
        } else {
            return;
        }
    }

    @registerEvent<ExEntityController>(ExEventNames.afterEntityLoad)
    onMemoryLoad() {
        if (!this.isLoaded) {
            console.info(this._entity.typeId);
            this.startContext();
            this.getEvents().startContext();
        } else {
            return;
        }
    }

    onAppear(spawn: boolean) {

    }


    public destroyTrigger() {
        if (!this._isDestroyed) {
            this._isDestroyed = true;
            this.entity.remove();
            this.onDestroy();
        }
    }
    
    onDestroy() {
        this.dispose();
    }
    private _isDestroyed = false;
    override dispose() {
        super.dispose();
        console.info(this._entity.typeId);
        this.getEvents().cancelAll();
        if (this.isLoaded) this.onMemoryRemove();
        ExEntityPool.pool.delete(this.entity);
    }

    isKilled: boolean = false;

    @registerEvent<ExEntityController>(ExEventNames.afterEntityDie)
    onKilled(e: EntityDieAfterEvent) {
        if(this.isKilled) return;
        this.isKilled = true;
        console.info(this._entity.typeId);
        if (!this._isDestroyed) {
            this._isDestroyed = true;
            this.onDestroy();
        }
    }
}