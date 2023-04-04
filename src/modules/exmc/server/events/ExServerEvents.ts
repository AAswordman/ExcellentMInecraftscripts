import { world, Events, TickEvent, system } from '@minecraft/server';
import ExEventManager from "../../interface/ExEventManager.js";
import ExGameServer from "../ExGameServer.js";
import ExGameConfig from '../ExGameConfig.js';
import ExErrorQueue from '../ExErrorQueue.js';
import ExGame from '../ExGame.js';

export default class ExServerEvents implements ExEventManager {
    public events: Events;
    private _server: ExGameServer;
    public exEvents = {
        "tick": {
            subscribe: (callback: (arg: TickEvent) => void) => {
                this._subscribe("tick", callback);
            },
            unsubscribe: (callback: (arg: TickEvent) => void) => {
                this._unsubscribe("tick", callback)
            },
            pattern: () => {
                ExGame.tickMonitor.addMonitor((e) => {
                    ExServerEvents.monitorMap.get("tick")?.forEach((fun) => {
                        fun(e);
                    })
                });
            }
        },
        "onLongTick": {
            subscribe: (callback: (arg: TickEvent) => void) => {
                this._subscribe("onLongTick", callback);
            },
            unsubscribe: (callback: (arg: TickEvent) => void) => {
                this._unsubscribe("onLongTick", callback)
            },
            pattern: () => {
                ExGame.longTickMonitor.addMonitor((e) => {
                    ExServerEvents.monitorMap.get("onLongTick")?.forEach((fun) => {
                        fun(e);
                    })
                });
            }
        }

    };
    static monitorMap = new Map<string, ((arg: any) => void)[]>;

    static init: boolean = false;
    _subscribe(name: string, callback: (arg: any) => void) {
        let e = ExServerEvents.monitorMap.get(name);
        if (e === undefined) {
            e = [];
            ExServerEvents.monitorMap.set(name, e);
        }
        e.push(callback);

    }

    _unsubscribe(name: string, callback: (arg: any) => void) {
        let arr = ExServerEvents.monitorMap.get(name) ?? [];

        arr.splice(arr.findIndex((v, i) => {
            if (v === callback) return true;
        }), 1);
    }

    constructor(server: ExGameServer) {
        this._server = server;
        this.events = world.events;

        if (!ExServerEvents.init) {
            ExServerEvents.init = true;
            for (let i in this.exEvents) {
                (<any>this.exEvents)[i].pattern();
            }
        }

    }
    cancelAll(): void {
        throw new Error('Method not implemented.');
    }

    register(name: string, fun: (arg: any) => void) {
        let func: (arg: any) => void = fun;
        if (name in this.events) {
            return (<any>this.events)[name].subscribe(func);
        } else if (name in this.exEvents) {
            return (<any>this.exEvents)[name].subscribe(func);
        }

        console.warn("No event registered for name " + name);
    }


    cancel(name: string, fun: (arg: any) => void) {
        if (name in this.events) {
            return (<any>this.events)[name].unsubscribe(fun);
        } else if (name in this.exEvents) {
            return (<any>this.exEvents)[name].unsubscribe(fun);
        }
    }
}