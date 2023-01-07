import ExGameServer from "../ExGameServer.js";
import ExEntity from "./ExEntity.js";
import { Entity } from '@minecraft/server';

export default class ExEntityController extends ExEntity{
    server: ExGameServer;
    constructor(e:Entity,server:ExGameServer){
        super(e);
        this.server = server;
    }
}

