import ExContext from "../interface/ExContext.js";
import SetTimeOutSupport from "../interface/SetTimeOutSupport.js";
import ExGame from "./ExGame.js";

export default class ExGameObject extends ExContext implements SetTimeOutSupport {
    constructor(parrent: ExContext) {
        super();
        this.interrupt = false;
        this.parent = parrent;
    }
    override parent!: ExContext;
    override interrupt: boolean;

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
        return this.parent.clearRun(runId);
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
                this.parent.clearRun(id);
                fun();
            }
        };
        return id = this.parent.runIntervalByTick(method);
    }
    override runTimeoutByTick(fun: () => void, timeout: number) {
        let time = 0;
        let id = 0;
        let method = () => {
            if (this.interrupt) return;
            time += 1;
            if (time > timeout) {
                this.parent.clearRun(id);
                fun();
            }
        };
        return id = this.parent.runIntervalByTick(method);
    }

    override runIntervalByTick(fun: () => void, timeout = 1): number {
        let id = 0;
        let method = () => {
            if (this.interrupt) return;
            fun();
        };
        return id = this.parent.runIntervalByTick(method,timeout);
    }

    stopContext() {
        this._waitCode = [];
        this.interrupt = true;
    }
    startContext() {
        this.interrupt = false;
        this._waitCode.forEach(async ([p, res]) => {
            p(res);
        });
        this._waitCode = [];
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
}


