import ExGameServer from "./ExGameServer.js";
import ExConfig from '../ExConfig.js';
import ExGameClient from "./ExGameClient.js";

import "../../reflect-metadata/Reflect.js"
import ExSystem from "../utils/ExSystem.js";

export default class ExGame {
    static serverMap = new Map<typeof ExGameServer, ExGameServer>;
    static createServer(serverCons: typeof ExGameServer, config: ExConfig) {
        let server = new serverCons(config);
        this.serverMap.set(serverCons, server);
    }
    static postMessageBetweenServer() {
        
    }
    static postMessageBetweenClient<T extends ExGameClient>(client: T, s: typeof ExGameServer, exportName: string, args: any[]) {
        let server = this.serverMap.get(s);
        if (!server) return;
        let finder = server.findClientByPlayer(client.player);
        if (!finder) return;
        for (let k of ExSystem.keys(finder)) {
            let data = Reflect.getMetadata("exportName", finder, k);
            if (data === exportName) {
                Reflect.get(finder, k).apply(finder,args);
            }
        }
    }
}

export function receiveMessage(exportName: string) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata("exportName", exportName, target, propertyName);
    }
}