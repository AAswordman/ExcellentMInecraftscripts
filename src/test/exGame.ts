
class System {
    run: (() => void)[] = [];
    runInterval(func: () => void, tickInterval?: number) {
        this.run.push(func);
    }
}

const system = new System();
class ExGame {
    static idRunSeq = 0;
    static nowTick = 0;
    static tickDelayTriggers = new Map<number, [number, () => void][]>();
    static idToTrigger = new Map<number, number>();
    static intevalTask = new Map<number, [number, () => void][]>();
    static idToIntevalTrigger = new Map<number, number>();
    static tickDelayMax = 2300000000;
    static {
        const func = () => {
            this.nowTick = (this.nowTick + 1) % this.tickDelayMax;
            let list = this.tickDelayTriggers.get(this.nowTick);
            if (list) {
                for (let [id, func] of list) {
                    try {
                        func();
                    } catch (err) {
                    }
                    this.idToTrigger.delete(id);
                }
            }
            this.tickDelayTriggers.delete(this.nowTick);

            for (let [time, list] of this.intevalTask.entries()) {
                if (this.nowTick % time === 0) {
                    list.forEach(e => {
                        try {
                            if (this.idToIntevalTrigger.has(e[0])) e[1]();
                        } catch (err) {
                        }
                    })
                }
            }
        }
        system.runInterval(() => {
            func();
        }, 1);
    }


    static clearRun(runId: number): void {
        if (this.idToTrigger.has(runId)) {
            let time = this.idToTrigger.get(runId)!;
            let list = this.tickDelayTriggers.get(time);
            if (list) {
                list.splice(list.findIndex(e => e[0] == runId), 1);
            }
            this.idToTrigger.delete(runId);
        } else if (this.idToIntevalTrigger.has(runId)) {
            let time = this.idToIntevalTrigger.get(runId)!;
            let list = this.intevalTask.get(time);
            if (list) {
                list.splice(list.findIndex(e => e[0] == runId), 1);
            }
            this.idToIntevalTrigger.delete(runId);
        }
    }


    static runInterval(callback: () => void, tickDelay?: number): number {
        tickDelay = Math.max(1, tickDelay ?? 1);

        this.idRunSeq = (1 + this.idRunSeq) % this.tickDelayMax;
        const willId = this.idRunSeq;
        this.idToIntevalTrigger.set(willId, tickDelay);
        if (!this.intevalTask.has(tickDelay)) {
            this.intevalTask.set(tickDelay, [])
        }
        this.intevalTask.get(tickDelay)?.push([this.idRunSeq, callback]);

        return willId;
    }


    static runTimeout(callback: () => void, tickDelay?: number): number {
        tickDelay = Math.max(1, tickDelay ?? 1);
        this.idRunSeq = (1 + this.idRunSeq) % this.tickDelayMax;
        let tar = this.nowTick + tickDelay
        this.idToTrigger.set(this.idRunSeq, tar);
        if (!this.tickDelayTriggers.has(tar)) {
            this.tickDelayTriggers.set(tar, [])
        }
        this.tickDelayTriggers.get(tar)?.push([this.idRunSeq, callback]);

        return this.idRunSeq;
    }
}




let i = 0;
let id = 0;
while (i < 100) {
    system.run.forEach(e => e())
    i++;

    if (i === 10) {
        id = ExGame.runInterval(() => {
            console.log("runInterval");
        }, 3);
        ExGame.runInterval(() => {
            console.log("run2");
        }, 8);
    }
    if (i === 20) {
        ExGame.runTimeout(() => {
            console.log("runTimeout");
        }, 1);
        ExGame.runTimeout(() => {
            console.log("runTimeout");
        }, 2);
        ExGame.runTimeout(() => {
            ExGame.clearRun(id);
            ExGame.runTimeout(() => {
                console.log("runTimeout999");
            }, 50);
        }, 3);
        ExGame.runTimeout(() => {
            console.log("runTimeout");
        }, 5);
    }
}