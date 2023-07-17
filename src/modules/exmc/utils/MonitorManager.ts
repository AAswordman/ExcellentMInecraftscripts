import ExErrorQueue from "../server/ExErrorQueue.js";

export default class MonitorManager<T extends Array<any>> {
    mixer: ((...args: T) => void)[];
    constructor() {
        this.mixer = [];
    }
    addMonitor(monitor: (...args: T) => void) {
        this.mixer.push(monitor);
        return monitor;
    }
    removeMonitor(monitor: (...args: T) => void) {
        let index = this.mixer.indexOf(monitor);
        if (index === -1) return;
        this.mixer.splice(index, 1);
    }
    hasMonitor(monitor: (...args: T) => void) {
        let index = this.mixer.indexOf(monitor);
        return index !== -1;
    }


    trigger(...args: T) {
        for (let e of this.mixer) {
            try {
                e(...args);
            } catch (err) {
                ExErrorQueue.throwError(err);
            }
        }
    }
}