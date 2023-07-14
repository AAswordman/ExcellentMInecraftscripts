import ExGameServer from "./ExGameServer.js";
import ExConfig from '../ExConfig.js';
import ExGameClient from "./ExGameClient.js";

import "../../reflect-metadata/Reflect.js"
import ExSystem from "../utils/ExSystem.js";
import { system } from "@minecraft/server";
import ExServerEvents from "./events/ExServerEvents.js";
import MonitorManager from "../utils/MonitorManager.js";
import { TickEvent } from "./events/events.js";
import ExErrorQueue from "./ExErrorQueue.js";

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
            tickNum = (tickNum + 1) % 72000;
            this.tickMonitor.trigger(event);
        }
        ExGame.runInterval(fun, 1);
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
            tickNum = (tickNum + 1) % 72000;
            this.longTickMonitor.trigger(event);
        }
        ExGame.runInterval(fun, 5);
    }
    static serverMap = new Map<typeof ExGameServer, ExGameServer>;
    static createServer(serverCons: typeof ExGameServer, config: ExConfig) {
        let server = new serverCons(config);
        this.serverMap.set(serverCons, server);
    }
    static postMessageBetweenServer() {

    }
    static postMessageBetweenClient<T extends ExGameClient>(client: T, s: typeof ExGameServer, exportName: string, args: any[]) {
        ExGame.run(() => {
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
        });
    }
    static thread() {

    }

    static clearRun(runId: number): void {
        system.clearRun(runId);
    }

    static run(callback: () => void): number {
        return system.run(() => {
            try {
                callback();
            } catch (err) {
                ExErrorQueue.reportError(err);
                throw err;
            }
        });
    }

    static runInterval(callback: () => void, tickInterval?: number): number {
        return system.runInterval(() => {
            try {
                callback();
            } catch (err) {
                ExErrorQueue.reportError(err);
                throw err;
            }
        }, tickInterval);
    }

    static runTimeout(callback: () => void, tickDelay?: number): number {
        return system.runTimeout(() => {
            try {
                callback();
            } catch (err) {
                ExErrorQueue.reportError(err);
                throw err;
            }
        }, tickDelay);
    }
}

export function receiveMessage(exportName: string) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata("exportName", exportName, target, propertyName);
    }
}