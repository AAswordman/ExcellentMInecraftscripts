import SetTimeOutSupport from "../interface/SetTimeOutSupport.js";
import ExGame from "./ExGame.js";

export default class ExContext implements SetTimeOutSupport {
    constructor() {
        this.interrupt = false;
    }
    interrupt: boolean;

    setTimeout(fun: () => void, timeout: number) {
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
                ExGame.clearRun(id);
                fun();
            }
        };
        return id = ExGame.runInterval(method);
    }
    setTimeoutByTick(fun: () => void, timeout: number) {
        let time = 0;
        let id = 0;
        let method = () => {
            if (this.interrupt) return;
            time += 1;
            if (time > timeout) {
                ExGame.clearRun(id);
                fun();
            }
        };
        return id = ExGame.runInterval(method);
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
                if (this.interrupt) {
                    resolve(res);
                } else {
                    this._waitCode.push([resolve, res]);
                }
            }, onrejectionhandled => {
                this._waitCode.push([reject, onrejectionhandled]);
            })
        });
    }
    c<T>(promise: Promise<T>) {
        return this.waitContext(promise);
    }

    static async wait(context: ExContext) {
        await context.waitContext(new Promise((resolve) => resolve(undefined)));
    }
}