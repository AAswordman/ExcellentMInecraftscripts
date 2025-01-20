import CallBackListener from "../interface/CallBackListener.js";
import ExErrorQueue from "../server/ExErrorQueue.js";
import BidirectionalMap from "./BidirectionalMap.js";

export default class MonitorManager<T, R = void>
    implements CallBackListener<T, R> {
    mixer: ((args: T) => R)[];
    idMap = new BidirectionalMap<number, ((args: T) => R)>();
    static id = 0;

    constructor() {
        this.mixer = [];
    }
    subscribe(callback: (arg1: T) => R): (arg1: T) => R {
        this.addMonitor(callback);
        return callback;
    }

    unsubscribe(callback: (arg1: T) => R): (arg1: T) => R {
        this.removeMonitor(callback);
        return callback;
    }

    addMonitor(monitor: (args: T) => R) {
        this.mixer.push(monitor);
        this.idMap.set(MonitorManager.id++, monitor);
        return monitor;
    }
    removeId(id: number) {
        if (!this.idMap.has(id)) return;
        this.removeMonitor(this.idMap.get(id)!);
    }
    removeMonitor(monitor: (args: T) => R) {
        let index = this.mixer.indexOf(monitor);
        if (index === -1) return;
        this.mixer.splice(index, 1);
        this.idMap.delete(monitor);
    }
    hasMonitor(monitor: (args: T) => R) {
        let index = this.mixer.indexOf(monitor);
        return index !== -1;
    }


    trigger(args: T) {
        for (let e of this.mixer) {
            try {
                e(args);
            } catch (err) {
                ExErrorQueue.throwError(err);
            }
        }
    }

    get length() {
        return this.mixer.length;
    }

    *[Symbol.iterator]() {
        for (let e of this.mixer) {
            yield e;
        }
    }
    forEach(arg0: (f: ((args: T) => R)) => void) {
        for (let e of this.mixer) {
            try {
                arg0(e);
            } catch (err) {
                ExErrorQueue.throwError(err);
            }
        }
    }
}