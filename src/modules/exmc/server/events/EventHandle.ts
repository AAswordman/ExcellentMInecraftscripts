import { Entity } from '@minecraft/server';
import ExGameServer from '../ExGameServer.js';
import DisposeAble from '../../interface/DisposeAble.js';

export default class EventHandle<T> {
    private listeners!: EventListenerSettings<T>;
    server!: ExGameServer;
    constructor() {
    }
    setEventLiseners(e: EventListenerSettings<T>) {
        this.listeners = e;
    }
    init(s: ExGameServer) {
        this.server = s;
        for (let k in this.listeners) {
            this.monitorMap[k] = new Map();
        }
        for (let k in this.monitorMap) {
            let p:EventListenerSetting = (<any>this.listeners)[k];
            let registerName = k;
            if (p.name) {
                registerName = p.name;
            }
            p.pattern(registerName, k);
        }
    }
    monitorMap: { [event: string]: Map<Entity, ((args: unknown) => void)[]> } = {

    }

    subscribe(entity: Entity, name: string, callback: (args: unknown) => void) {
        let e = this.monitorMap[name];
        if (!e.has(entity)) {
            e.set(entity, []);
        }

        e.get(entity)?.push(callback);

    }

    unsubscribe(entity: Entity, name: string, callback: (args: unknown) => void) {
        let e = this.monitorMap[name];
        let arr = e.get(entity);
        if (arr) {
            let index = arr.indexOf(callback);
            if (index !== -1)
                arr.splice(index, 1);
        }
    }

    unsubscribeAll(e: Entity) {
        for (let m in this.monitorMap) {
            this.monitorMap[m].delete(e);
        }
    }

    registerToServerByEntity = (registerName: string, k: string) => {
        this.server.getEvents().register(registerName, (e: any) => {
            const name = (this.listeners as any)[k].filter?.name;
            if (name) {
                let player;
                for(let k of name.split(".")){
                    player = player ? player[k] : e[k];
                }
                
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


export type EventListenerSettings<T> = {
    [P in keyof T]-?: EventListenerSetting;
}
export interface EventListenerSetting {
    pattern: (registerName: string, key: string) => void;
    name?: string;
    filter?: EventFilter;
}
export interface EventListener {
    subscribe: (callback: (arg: any) => void) => void;
    unsubscribe: (callback: (arg: any) => void) => void;
}
export type EventListeners = {
    [x:string]: EventListener;
};
export interface EventFilter {
    name?: string;
}