import ExGameServer from "../ExGameServer.js";
import ExEntity from "./ExEntity.js";
import { Entity, EntityHurtEvent, System, TickEvent, world, system } from '@minecraft/server';
import ExEntityEvents from "./ExEntityEvents.js";
import { eventDecoratorFactory, registerEvent } from "../events/EventDecoratorFactory.js";
import ExGameConfig from "../ExGameConfig.js";
import DisposeAble from "../../interface/DisposeAble.js";
import SetTimeOutSupport from "../../interface/SetTimeOutSupport.js";

export default class ExEntityController implements DisposeAble,SetTimeOutSupport {
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
        console.warn("track "+e.typeId);
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

    @registerEvent<ExEntityController>("onLongTick", (ctrl, e: TickEvent) => {
        if (e.currentTick % 4 === 0) {
            try {
                let dim = ctrl.entity.dimension;
                return dim === undefined;
            } catch (o) {
                return true;
            }
        }
        return false;
    })
    onDestroy() {
        this.dispose();
    }
    dispose() {
        this.getEvents().cancelAll();
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