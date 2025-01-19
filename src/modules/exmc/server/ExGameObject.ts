import DisposeAble from "../interface/DisposeAble.js";
import ExContext from "../interface/ExContext.js";
import SetTimeOutSupport from "../interface/SetTimeOutSupport.js";
import MonitorManager from "../utils/MonitorManager.js";
import { TickEvent } from "./events/events.js";
import ExGame from "./ExGame.js";

export default class ExGameObject extends ExContext implements SetTimeOutSupport, DisposeAble {
    tickMonitorListener: (args: TickEvent) => void;
    beforeTickMonitorListener: (args: TickEvent) => void;
    longTickMonitorListener: (args: TickEvent) => void;
    constructor(parrent: ExContext) {
        super();
        this.interrupt = false;
        this.parent = parrent;

        this.tickMonitorListener = this.parent.tickMonitor.addMonitor((arg: TickEvent) => {
            if (this.interrupt) return;
            this.tickMonitor.trigger(arg);
        });
        this.beforeTickMonitorListener = this.parent.beforeTickMonitor.addMonitor((arg: TickEvent) => {
            if (this.interrupt) return;
            this.beforeTickMonitor.trigger(arg);
        });
        this.longTickMonitorListener = this.parent.longTickMonitor.addMonitor((arg: TickEvent) => {
            if (this.interrupt) return;
            this.longTickMonitor.trigger(arg);
        });
        
    }
    override parent!: ExContext;
    override interrupt: boolean;

    override tickMonitor: MonitorManager<TickEvent, void> = new MonitorManager();
    override longTickMonitor: MonitorManager<TickEvent, void> = new MonitorManager();
    override beforeTickMonitor: MonitorManager<TickEvent, void> = new MonitorManager();

    override sleep(timeout: number) {
        return new Promise<void>((resolve, reject) => {
            this.runTimeout(() => {
                resolve();
            }, timeout);
        });
    }
    override sleepByTick(timeout: number) {
        return new Promise<void>((resolve, reject) => {
            this.runTimeoutByTick(() => {
                resolve();
            }, timeout);
        });
    }

    override clearRun(runId: number): void {
        this.tickMonitor.removeId(runId);
        this.longTickMonitor.removeId(runId);
        this.beforeTickMonitor.removeId(runId);
        // console.warn("clear run:"+runId+"/"+JSON.stringify(Array.from(this.tickMonitor.idMap.keys())));
    }

    override run(func: () => void) {
        return this.parent.run(async () => {
            await ExContext.wait(this);
            func();
        });
    }

    override runTimeout(fun: () => void, timeout: number) {
        let time = 0;
        let id = 0;
        let nowDate = Date.now();
        let method = () => {
            let now = Date.now();
            let deltaTime = now - nowDate;
            nowDate = now;
            if (this.interrupt) return;
            time += deltaTime;
            if (time > timeout) {
                this.clearRun(id);
                fun();
            }
        };
        return id = this.runIntervalByTick(method);
    }
    override runTimeoutByTick(fun: () => void, timeout: number) {
        let time = 0;
        let id = 0;
        let method = () => {
            if (this.interrupt) return;
            time += 1;
            if (time > timeout) {
                this.clearRun(id);
                fun();
            }
        };
        return id = this.runIntervalByTick(method);
    }

    override runIntervalByTick(fun: () => void, timeout = 1): number {
        let id = 0;
        timeout = Math.max(1, Math.floor(timeout));
        let method = () => {
            if (this.interrupt || ExGame.nowTick % timeout != 0) return;
            fun();
        };
        this.tickMonitor.addMonitor(method);
        // console.warn("create runIntervalByTick");

        id = this.tickMonitor.idMap.get(method)!;
        return id;
    }

    stopContext() {
        this._waitCode = [];
        this.interrupt = true;
        this.parent.tickMonitor.removeMonitor(this.tickMonitorListener);
        this.parent.tickMonitor.removeMonitor(this.beforeTickMonitorListener);
        this.parent.tickMonitor.removeMonitor(this.longTickMonitorListener);
    }
    startContext() {
        this.interrupt = false;
        this._waitCode.forEach(async ([p, res]) => {
            p(res);
        });
        this._waitCode = [];
        this.parent.tickMonitor.addMonitor(this.tickMonitorListener);
        this.parent.tickMonitor.addMonitor(this.beforeTickMonitorListener);
        this.parent.tickMonitor.addMonitor(this.longTickMonitorListener);
    }
    private _waitCode: [(value: any) => void, unknown][] = [];
    waitContext<T>(promise: Promise<T>) {
        return new Promise<T>((resolve, reject) => {
            promise.then(res => {
                if (!this.interrupt) {
                    resolve(res);
                } else {
                    this._waitCode.push([resolve, res]);
                }
            }, onrejectionhandled => {
                this._waitCode.push([reject, onrejectionhandled]);
            })
        });
    }
    dispose(): void {
        this.stopContext();
    }
}