import DisposeAble from "../interface/DisposeAble.js";
import ExSystem from "./ExSystem.js";
import TickDelayTask from "./TickDelayTask.js";

export default class ExTimeLine implements DisposeAble {
    protected timer: TickDelayTask;
    protected arr: [number, (line:ExTimeLine) => void][] = [];
    protected startTime?: number;
    constructor(tasks: ExTimeLineTask) {
        for (let k in tasks) {
            this.arr.push([parseFloat(k), tasks[k]])
        }
        this.arr.sort((a, b) => a[0] - b[0]);
        this.timer = ExSystem.tickTask(() => {
            if(this.arr.length === 0){
                this.stop();
                return;
            }
            if(this.getTime()-this.startTime! > this.arr[0][0]*1000){
                this.arr.shift()![1](this);
            }
            this.tickMap.forEach((v,k) => {
                v[1]((this.getTime()-this.startTime!)/1000,(this.getTime()-v[0])/1000);
            });
        }).delay(1);
    }
    protected tickMap: Map<string, [number,(nowTime:number,pastTime:number) => void]> = new Map();
    registerTick(path: string, task: (nowTime:number,pastTime:number) => void) {
        this.tickMap.set(path,[this.getTime(),task]);
    }
    cancelTick(path: string) {
        this.tickMap.delete(path);
    }
    getTime() {
        return new Date().getTime();
    }
    start() {
        this.startTime = this.getTime();
        this.timer.start();
        return this;
    }
    dispose(): void {
        this.stop();
    }
    stop() {
        this.timer.stop();
    }
}
export interface ExTimeLineTask {
    [key: string]: (line:ExTimeLine) => void;
}