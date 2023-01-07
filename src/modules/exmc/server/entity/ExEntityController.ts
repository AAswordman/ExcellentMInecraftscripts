import ExGameServer from "../ExGameServer.js";
import ExEntity from "./ExEntity.js";
import { Entity } from '@minecraft/server';
import ExEntityEvents from "./ExEntityEvents.js";

export default class ExEntityController extends ExEntity{
    server: ExGameServer;
    private _events: ExEntityEvents;
    constructor(e:Entity,server:ExGameServer){
        super(e);
        this.server = server;
        this._events = new ExEntityEvents(this);
    }
    getEvents(){
        return this._events;
    }
}