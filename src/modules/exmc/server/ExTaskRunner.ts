import ExSystem from "../utils/ExSystem.js";
import TickDelayTask from "../utils/TickDelayTask.js";

export default class ExTaskRunner {
    tasks!: Generator;
    private tick?: TickDelayTask;
    step() {
        this.tasks.next();
    }
    isOver() {
        return this.tasks.next().done;
    }
    start(delay: number, steps: number) {
        let resolve: (value: unknown) => void, reject;
        const pro = new Promise((rs, rj) => {
            resolve = rs;
        });
        this.tick = ExSystem.tickTask(() => {
            for (let i = 0; i < steps; i++)
                this.step();
            if (this.isOver()) {
                this.tick!.stop();
                resolve(1);
            }
        }).delay(delay);
        this.tick.start();
        return pro;
    }
    run(r: () => Generator) {
        this.tasks = r();
    }

}