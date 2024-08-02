import ExConfig from '../ExConfig.js';
import ExGameClient from "./ExGameClient.js";
import ExGameServer from "./ExGameServer.js";

import { ScriptEventCommandMessageAfterEvent, system } from "@minecraft/server";
import "../../reflect-metadata/Reflect.js";
import ExSystem from "../utils/ExSystem.js";
import MonitorManager from "../utils/MonitorManager.js";
import { TickEvent } from "./events/events.js";
import ExErrorQueue from "./ExErrorQueue.js";

export default class ExGame {
    static idRunSeq = 0;
    static nowTick = 0;
    static tickDelayTriggers = new Map<number, [number, () => void][]>();
    static idToTrigger = new Map<number, number>();
    static intevalTask = new Map<number, [number, () => void][]>();
    static idToIntevalTrigger = new Map<number, number>();
    static tickDelayMax = 2300000000;
    static {
        const func = () => {
            this.nowTick = (this.nowTick + 1) % this.tickDelayMax;
            let list = this.tickDelayTriggers.get(this.nowTick);
            if (list) {
                for (let [id, func] of list) {
                    try {
                        func();
                    } catch (err) {
                        ExErrorQueue.throwError(err);
                    }
                    this.idToTrigger.delete(id);
                }
            }
            this.tickDelayTriggers.delete(this.nowTick);

            for (let [time, list] of this.intevalTask.entries()) {
                if (this.nowTick % time === 0) {
                    list.forEach(e => {
                        try {
                            if(this.idToIntevalTrigger.has(e[0])) e[1]();
                        } catch (err) {
                            ExErrorQueue.throwError(err);
                        }
                    })
                }
            }
        }
        system.runInterval(() => {
            func();
        }, 1);
    }


    static clearRun(runId: number): void {
        if (this.idToTrigger.has(runId)) {
            let time = this.idToTrigger.get(runId)!;
            let list = this.tickDelayTriggers.get(time);
            if (list) {
                list.splice(list.findIndex(e => e[0] == runId), 1);
            }
            this.idToTrigger.delete(runId);
        }else if(this.idToIntevalTrigger.has(runId)){
            let time = this.idToIntevalTrigger.get(runId)!;
            let list = this.intevalTask.get(time);
            if (list) {
                list.splice(list.findIndex(e => e[0] == runId), 1);
            }
            this.idToIntevalTrigger.delete(runId);
        }
    }


    static runInterval(callback: () => void, tickDelay?: number): number {
        tickDelay = Math.round(Math.max(1, tickDelay ?? 1));

        this.idRunSeq = (1 + this.idRunSeq) % this.tickDelayMax;
        const willId = this.idRunSeq;
        this.idToIntevalTrigger.set(willId, tickDelay);
        if (!this.intevalTask.has(tickDelay)) {
            this.intevalTask.set(tickDelay, [])
        }
        this.intevalTask.get(tickDelay)?.push([this.idRunSeq, callback]);

        return willId;
    }


    static runTimeout(callback: () => void, tickDelay?: number): number {
        tickDelay = Math.round(Math.max(1, tickDelay ?? 1));
        this.idRunSeq = (1 + this.idRunSeq) % this.tickDelayMax;
        let tar = this.nowTick + tickDelay
        this.idToTrigger.set(this.idRunSeq, tar);
        if (!this.tickDelayTriggers.has(tar)) {
            this.tickDelayTriggers.set(tar, [])
        }
        this.tickDelayTriggers.get(tar)?.push([this.idRunSeq, callback]);

        return this.idRunSeq;
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

    
    static beforeTickMonitor = new MonitorManager<[TickEvent]>();
    static tickMonitor = new MonitorManager<[TickEvent]>();
    static longTickMonitor = new MonitorManager<[TickEvent]>();
    static scriptEventReceive = new MonitorManager<[ScriptEventCommandMessageAfterEvent]>();
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
            this.beforeTickMonitor.trigger(event);
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

    static {
        system.afterEvents.scriptEventReceive.subscribe(e => {
            ExGame.scriptEventReceive.trigger(e);
        });
    }

    static serverMap = new Map<typeof ExGameServer, ExGameServer>;
    static runJob(r: () => Generator<void, void, void>) {
        system.runJob(r())
    }
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
}

export function receiveMessage(exportName: string) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata("exportName", exportName, target, propertyName);
    }
}