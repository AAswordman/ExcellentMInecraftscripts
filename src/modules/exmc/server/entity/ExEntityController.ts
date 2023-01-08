import ExGameServer from "../ExGameServer.js";
import ExEntity from "./ExEntity.js";
import { Entity, EntityHurtEvent } from '@minecraft/server';
import ExEntityEvents from "./ExEntityEvents.js";
import { eventDecoratorFactory, registerEvent } from "../events/EventDecoratorFactory.js";
import ExGameConfig from "../ExGameConfig.js";

export default class ExEntityController extends ExEntity{


    server: ExGameServer;
    private _events: ExEntityEvents;
    constructor(e:Entity,server:ExGameServer){
        super(e);
        this.server = server;
        this._events = new ExEntityEvents(this);
        this.onSpawn();

        eventDecoratorFactory(this.getEvents(), this);
    }
    onSpawn() {
        
    }
    onDespawn() {
        
    }
    getEvents(){
        return this._events;
    }

    @registerEvent<ExEntityController>("onHurt",(ctrl,e) => ctrl.getHealth() <= 0)
    private onKilled(e:EntityHurtEvent){
        
    }
}