import menuTaskUI from "../data/menuTaskUI.js";
import GameController from "./GameController.js";
import MenuUIAlert from '../ui/MenuUIAlert.js';
import taskDaily_a from '../data/tasks/daily_a.js';
import taskDaily_x from "../data/tasks/daily_x.js";
import taskDaily_c from "../data/tasks/daily_c.js";
import taskDaily_b from "../data/tasks/daily_b.js";
import ExEntity from '../../../modules/exmc/server/entity/ExEntity.js';
import ExGameConfig from "../../../modules/exmc/server/ExGameConfig.js";
import MathUtil from "../../../modules/exmc/utils/math/MathUtil.js";

export default class PomTaskSystem extends GameController {
    progressTaskFinish(name: string, damage: number) {
        this.data.tasks!.progress.data[name] = damage;
    }

    recordDailyArray = new Set<string>();
    recordProgressArray = new Set<string>();

    show(page?: string, subpage?: string) {
        let ui = new MenuUIAlert(this.client, menuTaskUI(this));
        if (!page || !subpage) {
            page = "dailyTask";
            subpage = ui.getJSON()[page].default;
        }
        ui.showPage(page, subpage);
    }

    onJoin(): void {
        let date = new Date();
        let nDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        console.warn(nDate);

        let getInt = (arr: any[]) => {
            return Math.floor(arr.length * Math.random());
        }
        let ta = taskDaily_a(this.client, this.getLang()).tasks;
        let tb = taskDaily_b(this.client, this.getLang()).tasks;
        let tc = taskDaily_c(this.client, this.getLang()).tasks;
        let tx = taskDaily_x(this.client, this.getLang()).tasks;

        
        if (this.data.tasks.daily.date !== nDate) {
            let g = this.client.magicSystem.getExperienceCanUpGradeTo();
            this.data.tasks.daily.all = [
                new Array(MathUtil.clamp(Math.round(-0.08 * g + 4), 0, 4)).fill(1).map(e => getInt(ta)),
                new Array(MathUtil.clamp(Math.round(-Math.abs(0.05 * (g - 30)) + 3), 0, 4)).fill(1).map(e => getInt(tb)),
                new Array(MathUtil.clamp(Math.round(-Math.abs(0.08 * (g - 60)) + 4), 0, 4)).fill(1).map(e => getInt(tc)),
                new Array(MathUtil.clamp(Math.round(-Math.abs(0.08 * (g - 90)) + 4), 0, 4)).fill(1).map(e => getInt(tx))
            ];

            
            this.data.tasks.daily.complete = [[], [], [], []];
            this.data.tasks.daily.cache = {};
            this.data.tasks.daily.date = nDate;
        }

        const list = [ta, tb, tc, tx];
        this.data.tasks.daily.all.forEach((arr, index) => {
            for (let ti of arr) {
                const t = list[index][ti];
                for (let v of t.conditions) {
                    if (v.type === "break" || v.type === "kill") {
                        this.recordDailyArray.add(v.typeId);
                    }
                }
            }
        })

        this.getEvents().exEvents.afterPlayerBreakBlock.subscribe(e => {
            // ExGameConfig.console.log(e.brokenBlockPermutation.type.id);
            if (!this.data.tasks) return;
            if (this.recordDailyArray.has(e.brokenBlockPermutation.type.id)) {
                this.data.tasks.daily.cache[e.brokenBlockPermutation.type.id] = 1 + (this.data.tasks.daily.cache[e.brokenBlockPermutation.type.id] ?? 0);
            } else {
                if (this.recordDailyArray.has("log") && e.brokenBlockPermutation.hasTag("log")) {
                    this.data.tasks.daily.cache["log"] = 1 + (this.data.tasks.daily.cache["log"] ?? 0);
                }
            }
        });
        this.getEvents().exEvents.afterPlayerHitEntity.subscribe(e => {
            if (!this.data.tasks) return;
            if (this.recordDailyArray.has(e.hurtEntity.typeId)) {
                if (ExEntity.getInstance(e.hurtEntity).health <= 0) {
                    this.data.tasks.daily.cache[e.hurtEntity.typeId] = 1 + (this.data.tasks.daily.cache[e.hurtEntity.typeId] ?? 0);
                }
            }
            // if (this.recordProgressArray.has(e.hurtEntity.typeId)) {
            //     if (ExEntity.getInstance(e.hurtEntity).getHealth() < 0) {
            //         this.data.tasks.progress.data[e.hurtEntity.typeId] = 1 + (this.data.tasks.progress.data[e.hurtEntity.typeId] ?? 0);
            //     }
            // }
        });
    }

    onLoad(): void {

    }

    onLeave(): void {

    }

}