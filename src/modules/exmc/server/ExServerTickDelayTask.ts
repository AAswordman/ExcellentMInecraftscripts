
import ExEventManager from "../interface/ExEventManager.js";
import SetTimeOutSupport from "../interface/SetTimeOutSupport.js";
import TickDelayTask from '../utils/TickDelayTask.js';
import ExGame from "./ExGame.js";

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
        if (this.isStarted()) return this;
        this.func = () => {
            this.looper();
            this.func = undefined;
        }
        this.id = ExGame.runTimeout(() => this?.func?.(), this.time);
        return this;
    }
    start() {
        if (this.isStarted()) return this;
        this.func = () => {
            this.looper();
        }

        this.id = ExGame.runInterval(() => this?.func?.(), this.time);
        return this;

    }

    stop() {
        if (!this.func) return this;
        if (!this.id) throw new Error("error id is required");

        ExGame.clearRun(this.id);
        this.func = undefined;
        return this;

    }
    dispose(): void {
        this.stop();
    }
}