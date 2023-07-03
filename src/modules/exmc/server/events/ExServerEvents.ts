import { world, system, AfterEvents, BeforeEvents } from '@minecraft/server';
import ExEventManager from "../../interface/ExEventManager.js";
import ExGameServer from "../ExGameServer.js";
import ExGameConfig from '../ExGameConfig.js';
import ExErrorQueue from '../ExErrorQueue.js';
import ExGame from '../ExGame.js';
import { ExOtherEventNames, Merge, TickEvent } from './events.js';

//顶层事件分发
export default class ExServerEvents implements ExEventManager {

    public events: Merge<{ [K in keyof AfterEvents as `after${Capitalize<K>}`]: AfterEvents[K] },
        { [K in keyof BeforeEvents as `before${Capitalize<K>}`]: BeforeEvents[K] }>;
    private _server: ExGameServer;
    public exEvents = {
        [ExOtherEventNames.tick]: {
            subscribe: (callback: (arg: TickEvent) => void) => {
                this._subscribe(ExOtherEventNames.tick, callback);
            },
            unsubscribe: (callback: (arg: TickEvent) => void) => {
                this._unsubscribe(ExOtherEventNames.tick, callback)
            },
            pattern: () => {
                ExGame.tickMonitor.addMonitor((e) => {
                    ExServerEvents.monitorMap.get(ExOtherEventNames.tick)?.forEach((fun) => {
                        fun(e);
                    })
                });
            }
        },
        [ExOtherEventNames.onLongTick]: {
            subscribe: (callback: (arg: TickEvent) => void) => {
                this._subscribe(ExOtherEventNames.onLongTick, callback);
            },
            unsubscribe: (callback: (arg: TickEvent) => void) => {
                this._unsubscribe(ExOtherEventNames.onLongTick, callback)
            },
            pattern: () => {
                ExGame.longTickMonitor.addMonitor((e) => {
                    ExServerEvents.monitorMap.get(ExOtherEventNames.onLongTick)?.forEach((fun) => {
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

    static interceptor = new Map<any, any>();

    constructor(server: ExGameServer) {
        this._server = server;

        this.events = {} as any;
        for (let k in world.afterEvents) {
            const v = world.afterEvents[k as keyof AfterEvents];
            (this.events as any)[`after${k[0].toUpperCase()}${k.slice(1)}`] = {
                subscribe: (a: (arg: any) => void) => {
                    if (!ExServerEvents.interceptor.has(a)) {
                        ExServerEvents.interceptor.set(a, (e: any) => {
                            try {
                                a(e);
                            } catch (err) {
                                ExErrorQueue.reportError(err);
                                throw err;
                            }
                        });
                    }
                    return v.subscribe(ExServerEvents.interceptor.get(a));
                },
                unsubscribe: (a: (arg: any) => void) => {
                    if (!ExServerEvents.interceptor.has(a)) {
                        return;
                    }
                    const f = ExServerEvents.interceptor.get(a);
                    ExServerEvents.interceptor.delete(a);
                    return v.unsubscribe(f);
                }
            };
        }
        for (let k in world.beforeEvents) {
            const v = world.beforeEvents[k as keyof BeforeEvents];
            (this.events as any)[`before${k[0].toUpperCase()}${k.slice(1)}`] = {
                subscribe: (a: (arg: any) => void) => {
                    if (!ExServerEvents.interceptor.has(a)) {
                        ExServerEvents.interceptor.set(a, (e: any) => {
                            try {
                                a(e);
                            } catch (err) {
                                ExErrorQueue.reportError(err);
                                throw err;
                            }
                        });
                    }
                    return v.subscribe(ExServerEvents.interceptor.get(a));
                },
                unsubscribe: (a: (arg: any) => void) => {
                    if (!ExServerEvents.interceptor.has(a)) {
                        return;
                    }
                    const f = ExServerEvents.interceptor.get(a);
                    ExServerEvents.interceptor.delete(a);
                    return v.unsubscribe(f);
                }
            };
        }

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