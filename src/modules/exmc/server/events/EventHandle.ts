import { Entity } from '@minecraft/server';
import ExGameServer from '../ExGameServer.js';
import DisposeAble from '../../interface/DisposeAble.js';

export default class EventHandle {
    private listeners!: EventListenerSettings;
    server!: ExGameServer;
    constructor() {
    }
    setEventLiseners(e: EventListenerSettings) {
        this.listeners = e;
    }
    init(s:ExGameServer) {
        this.server = s;
        for (let k in this.listeners) {
            this.monitorMap[k] = new Map();
        }
        for (let k in this.monitorMap) {
            let p = this.listeners[k];
            let registerName = k;
            if (p.name) {
                registerName = p.name;
            }
            p.pattern(registerName, k);
        }
    }
    monitorMap: { [event: string]: Map<Entity, ((...args: any[]) => void)[]> } = {

    }

    subscribe(entity: Entity, name: string, callback: (...arg: any[]) => void) {
        let e = this.monitorMap[name];
        if (!e.has(entity)) {
            e.set(entity, []);
        }

        e.get(entity)?.push(callback);

    }

    unsubscribe(entity: Entity, name: string, callback: (...arg: any[]) => void) {
        let e = this.monitorMap[name];
        let arr = e.get(entity);
        if (arr) {
            arr.splice(arr.findIndex((v) => v === callback), 1);
        }
    }

    unsubscribeAll(e: Entity) {
        for (let m in this.monitorMap) {
            this.monitorMap[m].delete(e);
        }
    }

    registerToServerByEntity = (registerName: string, k: string) => {
        this.server.getEvents().register(registerName, (e: any) => {
            const name = this.listeners[k].filter?.name;
            if (name) {
                let player = e[name];
                let fArr = this.monitorMap[k].get(player);
                if (fArr) {
                    fArr.forEach((f) => {
                        f(e);
                    });
                }
            }
        });
    }

    registerToServerByServerEvent = (registerName: string, k: string) => {
        this.server.getEvents().register(registerName, (e: any) => {
            for (let [key, value] of this.monitorMap[k]) {
                value.forEach((f) => {
                    f(e);
                });
            }
        });
    }
}


export interface EventListenerSettings {
    [x: string]: EventListenerSetting;
}
export interface EventListener {
    subscribe: (callback: (arg: any) => void) => void;
    unsubscribe: (callback: (arg: any) => void) => void;
}
export type EventListeners<T extends EventListenerSettings> = {
    [P in keyof T]-?: EventListener;
};
export interface EventListenerSetting {
    pattern: (registerName: string, key: string) => void;
    name?: string;
    filter?: EventFilter;
}
export interface EventFilter {
    name?: string;
}