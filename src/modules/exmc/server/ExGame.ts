import ExConfig from '../ExConfig.js';
import ExGameClient from "./ExGameClient.js";
import ExGameServer from "./ExGameServer.js";

import { Player, ScriptEventCommandMessageAfterEvent, system, world } from "@minecraft/server";
import "../../reflect-metadata/Reflect.js";
import ExSystem from "../utils/ExSystem.js";
import MonitorManager from "../utils/MonitorManager.js";
import { TickEvent } from "./events/events.js";
import ExErrorQueue from "./ExErrorQueue.js";
import ExContext from '../interface/ExContext.js';

export default class ExGame {

    private static idRunSeq = 0;
    public static nowTick = 0;
    private static tickDelayTriggers = new Map<number, [number, () => void][]>();
    private static idToTrigger = new Map<number, number>();
    private static intevalTask = new Map<number, [number, () => void][]>();
    private static idToIntevalTrigger = new Map<number, number>();
    private static tickDelayMax = 2300000000;
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
                            if (this.idToIntevalTrigger.has(e[0])) e[1]();
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


    static _clearRun(runId: number): void {
        if (this.idToTrigger.has(runId)) {
            let time = this.idToTrigger.get(runId)!;
            let list = this.tickDelayTriggers.get(time);
            if (list) {
                list.splice(list.findIndex(e => e[0] == runId), 1);
            }
            this.idToTrigger.delete(runId);
        } else if (this.idToIntevalTrigger.has(runId)) {
            let time = this.idToIntevalTrigger.get(runId)!;
            let list = this.intevalTask.get(time);
            if (list) {
                list.splice(list.findIndex(e => e[0] == runId), 1);
            }
            this.idToIntevalTrigger.delete(runId);
        }
    }


    static _runInterval(callback: () => void, tickDelay?: number): number {
        tickDelay = Math.floor(Math.max(1, tickDelay ?? 1));

        this.idRunSeq = (1 + this.idRunSeq) % this.tickDelayMax;
        const willId = this.idRunSeq;
        this.idToIntevalTrigger.set(willId, tickDelay);
        if (!this.intevalTask.has(tickDelay)) {
            this.intevalTask.set(tickDelay, [])
        }
        this.intevalTask.get(tickDelay)?.push([this.idRunSeq, callback]);

        return willId;
    }


    static _runTimeout(callback: () => void, tickDelay?: number): number {
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

    static _run(callback: () => void): number {
        return system.run(() => {
            try {
                callback();
            } catch (err) {
                ExErrorQueue.reportError(err);
                throw err;
            }
        });
    }

    static gamerules = world.gameRules;
    static _sleep(tickDelay: number): Promise<void> {
        return system.waitTicks(tickDelay);
    }

    static beforeTickMonitor = new MonitorManager<TickEvent>();
    static tickMonitor = new MonitorManager<TickEvent>();
    static longTickMonitor = new MonitorManager<TickEvent>();
    static scriptEventReceive = new MonitorManager<ScriptEventCommandMessageAfterEvent>();
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
        ExGame._runInterval(fun, 1);
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
        ExGame._runInterval(fun, 5);
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
    static register(arg0: string, event: (context: any) => void, config: ExConfig) {
        event(config.gameContext);
    }
    static postMessageBetweenServer() {

    }
    static postMessageBetweenClient<T extends ExGameClient>(client: T | Player, s: typeof ExGameServer, exportName: string, args: any[]) {
        ExGame._run(() => {
            let server = this.serverMap.get(s);
            if (!server) return;
            let finder = server.findClientByPlayer(client instanceof Player ? client : client.player);
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

export const gameContext = new (class extends ExContext {
    override interrupt = true;
    override parent = undefined;
    override tickMonitor: MonitorManager<TickEvent, void> = ExGame.tickMonitor;
    override beforeTickMonitor: MonitorManager<TickEvent, void> = ExGame.beforeTickMonitor;
    override longTickMonitor: MonitorManager<TickEvent, void> = ExGame.longTickMonitor;
    override sleep(timeout: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            ExGame._runTimeout(() => {
                resolve();
            }, timeout);
        });
    }
    override sleepByTick(timeout: number): Promise<void> {
        return ExGame._sleep(timeout);
    }
    override run(func: () => void): void {
        ExGame._run(func);
    }
    override runTimeout(fun: () => void, timeout: number): number {
        return this.runTimeoutByTick(fun, timeout / 1000 * 20);
    }
    override runTimeoutByTick(fun: () => void, timeout: number): number {
        return ExGame._runTimeout(fun, timeout);
    }
    override runIntervalByTick(fun: () => void, timeout: number): number {
        return ExGame._runInterval(fun, timeout);
    }
    override clearRun(runId: number): void {
        ExGame._clearRun(runId);
    }
    override stopContext(): void {
        throw new Error('Top Layer Context Dont support');
    }
    override startContext(): void {
        throw new Error('Top Layer Context Dont support');
    }
    override waitContext<T>(promise: Promise<T>): Promise<T> {
        throw new Error('Top Layer Context Dont support');
    }
})();