import { system } from '@minecraft/server';
import ExEventManager from "../interface/ExEventManager.js";
import SetTimeOutSupport from "../interface/SetTimeOutSupport.js";
import TickDelayTask from '../utils/TickDelayTask.js';

export default class ExServerTickDelayTask implements TickDelayTask {
    func?: () => void;
    getDelay() {
        return this.time;
    }
    id: undefined | number;
    looper: () => void;
    time: number = 20;
    constructor(looper: () => void) {
        this.looper = looper;
    }
    delay(time: number) {
        if (this.isStarted()) throw new Error('TickDelayTask already started');
        this.time = time;
        return this;
    }
    isStarted(): boolean {
        return this.func !== undefined;
    }
    startOnce() {
        if (this.isStarted()) return;
        this.func = () => {
            this.looper();
        }
        this.id = system.runTimeout(this!.func, this.time);
    }
    start() {
        if (this.isStarted()) return;
        this.func = () => {
            this.looper();
        }

        this.id = system.runInterval(this!.func, this.time);
    }

    stop() {
        if (!this.func) return;
        if (!this.id) throw new Error("error id is required");
        
        system.clearRun(this.id);
        this.func = undefined;
    }
}