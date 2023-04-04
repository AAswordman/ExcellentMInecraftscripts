import ExGameServer from "./ExGameServer.js";
import ExConfig from '../ExConfig.js';
import ExGameClient from "./ExGameClient.js";

import "../../reflect-metadata/Reflect.js"
import ExSystem from "../utils/ExSystem.js";
import { TickEvent, system } from "@minecraft/server";
import ExServerEvents from "./events/ExServerEvents.js";
import MonitorManager from "../utils/MonitorManager.js";

export default class ExGame {
    static tickMonitor = new MonitorManager<[TickEvent]>();
    static longTickMonitor = new MonitorManager<[TickEvent]>();
    static {
        let tickNum = 0,
            tickTime = 0;
        const fun = () => {
            const n = Date.now();
            let event: TickEvent = {
                currentTick: tickNum,
                deltaTime: (n - tickTime) / 1000
            };
            tickTime = n;
            tickNum += 1;
            this.tickMonitor.trigger(event);
        }
        system.runInterval(fun, 1);
    }
    static {
        let tickNum = 0,
            tickTime = 0;
        const fun = () => {
            const n = Date.now();
            let event: TickEvent = {
                currentTick: tickNum,
                deltaTime: (n - tickTime) / 1000
            };
            tickTime = n;
            tickNum += 1;
            this.longTickMonitor.trigger(event);
        }
        system.runInterval(fun, 5);
    }
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
                Reflect.get(finder, k).apply(finder, args);
            }
        }
    }
    static thread() {

    }
}

export function receiveMessage(exportName: string) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata("exportName", exportName, target, propertyName);
    }
}