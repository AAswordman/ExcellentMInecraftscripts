import SetTimeOutSupport from "./SetTimeOutSupport.js";

export default abstract class ExContext implements SetTimeOutSupport {
    constructor() {}
    abstract interrupt: boolean;
    abstract parent?: ExContext;

    abstract sleep(timeout: number): Promise<void>;
    abstract sleepByTick(timeout: number): Promise<void>;
    abstract run(func: () => void): void;

    abstract runTimeout(fun: () => void, timeout: number): number;
    abstract runTimeoutByTick(fun: () => void, timeout: number): number;
    // abstract runInterval(fun: () => void, timeout: number): number;
    abstract runIntervalByTick(fun: () => void, timeout?: number): number;

    abstract clearRun(runId:number): void;

    

    abstract stopContext(): void;
    abstract startContext(): void;
    abstract waitContext<T>(promise: Promise<T>): Promise<T>;
    c<T>(promise: Promise<T>){
        return this.waitContext(promise);
    }
    static async wait(context: ExContext) {
        await context.waitContext(new Promise((resolve) => resolve(undefined)));
    }
}


