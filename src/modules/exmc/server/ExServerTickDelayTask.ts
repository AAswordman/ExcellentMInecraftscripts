import TickDelayTask from '../utils/TickDelayTask.js';
import ExContext from './ExGameObject.js';
import ExGame from "./ExGame.js";

export default class ExServerTickDelayTask implements TickDelayTask {
    func?: () => void;
    getDelay() {
        return this.time;
    }
    public id: undefined | number;
    looper: () => void;
    time: number = 20;
    constructor(public context: ExContext, looper: () => void) {
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
            this.func = undefined;
            this.looper();
        }
        this.id = this.context.runTimeoutByTick(() => this?.func?.(), this.time);
        return this;
    }
    start() {
        if (this.isStarted()) return this;
        this.func = () => {
            if(this.context.interrupt) return;
            this.looper();
        }
        this.id = this.context.runIntervalByTick(() => {
            this?.func?.()
        }, this.time);
        return this;
    }

    stop() {
        if (!this.func) return this;
        if (!this.id) throw new Error("error id is required");
        this.context.clearRun(this.id);

        this.func = undefined;
        return this;

    }
    dispose(): void {
        this.stop();
    }
}