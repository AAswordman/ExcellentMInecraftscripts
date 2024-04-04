
import ExEventManager from "../interface/ExEventManager.js";
import SetTimeOutSupport from "../interface/SetTimeOutSupport.js";
import { TickEvent } from "../server/events/events.js";
import Random from "./Random.js";

export default class TimeLoopTask {
    timeOut: ExEventManager;
    func ?: (e: TickEvent) => void;
    getDelay() {
        return this.targetDelay;
    }

    looper: () => void;
    targetDelay: number = 1000;
    constructor(timeOut: ExEventManager, looper: () => void) {
        this.timeOut = timeOut;
        this.looper = looper;
    }
    delay(time: number) {
        this.targetDelay = time;
        return this;
    }
    isStarted(): boolean {
        return this.func !== undefined;
    }
    startOnce() {
        if(this.isStarted()) return;
        this.times = 0;
        this.func = (e: TickEvent) => {
            this.times += e.deltaTime*1000;
            if (this.times >= this.targetDelay) {
                this.stop();
                this.looper();
            }
        }
        this.timeOut.register("tick", this.func);
    }
    private times = 0;
    start() {
        if(this.isStarted()) return;
        this.times = 0;
        this.func = (e: TickEvent) => {
            this.times += e.deltaTime*1000;
            if (this.times >= this.targetDelay) {
                this.looper();
                this.times = 0;
            }
        }
        this.timeOut.register("tick", this.func);
    }
    trigger(){
        if(this.isStarted()) this.times = Random.MAX_VALUE;
    }
    stop() {
        if(!this.func) return;
        this.timeOut.cancel("tick", this.func);
        this.func = undefined;
    }
}