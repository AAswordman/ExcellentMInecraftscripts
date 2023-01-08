import ExGameServer from "../ExGameServer.js";
import ExEntity from "./ExEntity.js";
import { Entity, EntityHurtEvent } from '@minecraft/server';
import ExEntityEvents from "./ExEntityEvents.js";
import { eventDecoratorDispose, eventDecoratorFactory, registerEvent } from "../events/EventDecoratorFactory.js";
import ExGameConfig from "../ExGameConfig.js";
import DisposeAble from "../../interface/DisposeAble.js";

export default class ExEntityController extends ExEntity implements DisposeAble {
    server!: ExGameServer;
    _events!: ExEntityEvents;
    public constructor(e: Entity, server: ExGameServer) {
        super(e);
        this.init(server);
    }
    init(server: ExGameServer) {
        this.server = server;
        this._events = new ExEntityEvents(this);

        this.onSpawn();

        eventDecoratorFactory(this.getEvents(), this);
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
    @registerEvent<ExEntityController>("onHurt", (ctrl, e) => ctrl.getHealth() <= 0)
    onKilled(e: EntityHurtEvent) {
        this.onDestroy();
    }
}