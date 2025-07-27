import PomClient from "../PomClient.js";
import GameController from "../clientFunc/GameController.js";
import { MenuUIAlertView, MenuUIJson, MenuUIPage } from "../ui/MenuUIAlert.js";
import { langType } from "./langType.js";
import taskDaily_a from "./tasks/daily_a.js";
import taskDaily_b from "./tasks/daily_b.js";
import taskDaily_c from "./tasks/daily_c.js";
import taskDaily_x from "./tasks/daily_x.js";
import { PomTaskJSON } from './tasks/PomTask.js';
import { PomTasks, taskTranToNum } from "../../../dec/server/data/Task.js";
import getCharByNum, { PROGRESS_CHAR } from "./getCharByNum.js";
import taskProgress from "./tasks/taskProgress.js";
import plotLine from "./plotLine.js";



export default function menuTaskUI(ctrl: GameController): MenuUIJson<PomClient> {
    const lang = ctrl.getLang();
    let bagItems = ctrl.exPlayer.getBag().countAllItems();
    const ta = taskDaily_a(ctrl.client,lang),
        tb = taskDaily_b(ctrl.client,lang),
        tc = taskDaily_c(ctrl.client,lang),
        tx = taskDaily_x(ctrl.client,lang),
        pro = taskProgress(lang);
    return {
        "dailyTask": {
            "text": "dailyTask",
            "default": "0",
            "img": "textures/items/leaves_knife.png",
            "page": (client, ui) => {
                let arr: MenuUIPage<PomClient> = {};
                const daily = client.data.tasks!.daily;
                let taskIndex = 0
                let getTask = (index: number, taskJson: PomTaskJSON) => {
                    for (const i of daily.all[index]) {
                        let completed = daily.complete[index].includes(i);
                        let isOk = true;
                        let prog = 0;
                        let page: MenuUIAlertView<PomClient>[] = [
                            {
                                "type": "text_title",
                                "msg": taskJson.name + " " + taskJson.tasks[i].name
                            },
                            {
                                "type": "padding"
                            },
                            {
                                "type": "text",
                                "msg": lang.menuUIMsgBailan216
                            }
                        ]

                        for (let v of taskJson.tasks[i].rewards) {
                            page.push({
                                "type": "text",
                                "msg": "    " + v.name + " " + (v.count * client.getDifficulty().LevelFactor) + " " + v.unit
                            });
                        }

                        page.push({
                            "type": "padding"
                        });


                        for (let v of taskJson.tasks[i].conditions) {
                            let conn = "";
                            let haveNum: number = 0;
                            let textShow = "";
                            if (v.type === "break") {
                                haveNum = (daily.cache[v.typeId] ?? 0);
                                conn = lang.menuUIMsgBailan217;
                            } else if (v.type === "kill") {
                                haveNum = (daily.cache[v.typeId] ?? 0);
                                conn = lang.menuUIMsgBailan218;
                            } else if (v.type === "item") {
                                conn = lang.menuUIMsgBailan219;
                                haveNum = (bagItems.get(v.typeId) ?? 0);
                            }
                            if (haveNum < v.count) {
                                isOk = false;
                            }
                            let mprog = completed ? 1 : Math.min(1, haveNum / v.count);
                            prog += mprog / taskJson.tasks[i].conditions.length;
                            textShow = (haveNum >= v.count || completed ? "§a" : "§c") + (lang.menuUIMsgBailan220 + conn + " " + v.name + " " + (completed ? v.count : haveNum) + "/" + v.count + lang.menuUIMsgBailan221);
                            textShow += getCharByNum(mprog, 10, PROGRESS_CHAR);

                            page.push({
                                "type": "textWithBg",
                                "msg": textShow
                            });

                        }
                        if (isOk && !completed) {
                            page.push(
                                {
                                    "type": "padding"
                                },
                                {
                                    "type": "button",
                                    "msg": lang.menuUIMsgBailan222,
                                    "function": (client, ui) => {
                                        for (let v of taskJson.tasks[i].rewards) {
                                            if (v.type === "integral") {
                                                client.data.gameExperience += v.count * client.getDifficulty().LevelFactor;
                                            }
                                        }
                                        for (let v of taskJson.tasks[i].conditions) {
                                            if (v.type === "item") {
                                                let bag = client.exPlayer.getBag();
                                                bag.clearItem(v.typeId, v.count);
                                            }
                                        }
                                        bagItems = client.exPlayer.getBag().countAllItems();

                                        client.data.tasks?.daily.complete[index].push(i);
                                        client.cache.save();
                                        return true;
                                    }
                                })
                        }
                        arr[taskIndex] = {
                            "text": (completed ? "§a" : (isOk ? "§e" : "§c")) + taskJson.tasks[i].name + ": " + (completed ? lang.menuUIMsgBailan223 : Math.round(prog * 100) + "％"),
                            "page": page
                        }
                        taskIndex++;
                    }
                }
                getTask(0, ta);
                getTask(1, tb);
                getTask(2, tc);
                getTask(3, tx);


                return arr;
            }
        },
        "paperTask": {
            "text": "paperTask",
            "default": "1",
            "img": "textures/items/magic_scroll_blue.png",
            "page": (client, ui) => {
                let arr: MenuUIPage<PomClient> = {};
                let item = ctrl.exPlayer.getBag().itemOnMainHand;

                if (!item || item.getLore().length === 0) {
                    return {
                        "1": {
                            "text": lang.menuUIMsgBailan224,
                            "page": [
                                {
                                    "type": "text",
                                    "msg": lang.menuUIMsgBailan225
                                }
                            ]
                        }
                    }
                }
                let lor = item.getLore();
                let num = 0;
                for (let i of lor) {
                    num++;
                    let m: MenuUIAlertView<PomClient>[] = [];
                    arr[num] = {
                        "page": m,
                        "text": i
                    };
                    let x = taskTranToNum(i);
                    const index = PomTasks.findIndex(e => e.id === x);
                    if (index === -1) {
                        throw new Error("Can't find task " + taskTranToNum(i));

                    }
                    let task = PomTasks[index];

                    m.push(
                        {
                            "type": "text_title",
                            "msg": task.title()
                        },
                        {
                            "type": "padding"
                        },
                        {
                            "type": "text",
                            "msg": task.body()
                        },
                        {
                            "type": "button",
                            "msg": "text.dec:task_complete_button.name",
                            "function": (client, ui) => {
                                task.detect(client,lor);
                                return false;
                            }
                        });
                }
                return arr;
            }
        },
        "progressTask": {
            "text": "progressTask",
            "default": "main_pom_1",
            "img": "textures/items/experience_book.png",
            "page": (client, ui) => {
                let arr: MenuUIPage<PomClient> = {};
                const taskList = client.data.tasks!.progress;
                for (const i in pro) {
                    let task = pro[i];
                    let completed = taskList.complete.includes(i);
                    let isOk = true;
                    let prog = 0;
                    let page: MenuUIAlertView<PomClient>[] = [
                        {
                            "type": "text_title",
                            "msg": task.name
                        },
                        {
                            "type": "padding"
                        },
                        {
                            "type": "text",
                            "msg": lang.menuUIMsgBailan226
                        }
                    ]

                    for (let v of task.rewards) {
                        page.push({
                            "type": "text",
                            "msg": "    " + v.name + " " + (v.count * client.getDifficulty().LevelFactor) + " " + (v.unit)
                        });
                    }

                    page.push({
                        "type": "padding"
                    });


                    for (let v of task.conditions) {
                        let conn = "";
                        let haveNum: number = 0;
                        let textShow = "";
                        if (v.type === "boss") {
                            v.damage = v.damage ?? 1;
                            haveNum = (taskList.data[v.typeId] ?? 0);
                            conn = lang.menuUIMsgBailan227;

                            if (haveNum < v.damage) {
                                isOk = false;
                            }
                            let mprog = completed ? 1 : Math.min(1, haveNum / v.damage);
                            prog += mprog / task.conditions.length;
                            textShow = (haveNum >= v.damage || completed ? "§a" : "§c") + (lang.menuUIMsgBailan228 + conn + " " + v.name + " " + (completed ? v.damage : haveNum) + "/" + v.damage + lang.menuUIMsgBailan229);
                            textShow += getCharByNum(mprog, 10, PROGRESS_CHAR);
                        } else if (v.type === "boss_tag") {
                            v.tagName = v.tagName ?? "undefined";
                            haveNum = client.player.hasTag(v.tagName) ? 1 : 0;
                            conn = lang.menuUIMsgBailan230;

                            if (haveNum < 1) {
                                isOk = false;
                            }
                            let mprog = completed ? 1 : Math.min(1, haveNum / 1);
                            prog += mprog / task.conditions.length;
                            textShow = (haveNum >= 1 || completed ? "§a" : "§c") + (lang.menuUIMsgBailan231 + conn + " " + v.name + " " + (completed ? 1 : haveNum) + "/" + 1 + lang.menuUIMsgBailan232);
                            textShow += getCharByNum(mprog, 10, PROGRESS_CHAR);
                        }
                        page.push({
                            "type": "textWithBg",
                            "msg": textShow
                        });
                    }


                    if (isOk && !completed) {
                        page.push(
                            {
                                "type": "padding"
                            },
                            {
                                "type": "button",
                                "msg": lang.menuUIMsgBailan233,
                                "function": (client, ui) => {
                                    for (let v of task.rewards) {
                                        if (v.type === "integral") {
                                            client.data.gameExperience += v.count * client.getDifficulty().LevelFactor;
                                        }
                                    }
                                    // for (let v of task.conditions) {
                                    //     if (v.type === "item") {
                                    //         let bag = client.exPlayer.getBag();
                                    //         bag.clearItem(v.typeId, v.count);
                                    //     }
                                    // }
                                    bagItems = client.exPlayer.getBag().countAllItems();

                                    taskList.complete.push(i);
                                    client.cache.save();
                                    return true;
                                }
                            })
                    }
                    arr[i] = {
                        "text": (completed ? "§a" : (isOk ? "§e" : "§c")) + task.name + ": " + (completed ? lang.menuUIMsgBailan234 : Math.round(prog * 100) + "％"),
                        "page": page

                    }
                }

                return arr;
            }
        },
        "story": {
            "text": "story",
            "default": "0",
            "img": "textures/items/unknow_book.png",
            "page": (client, ui) => {
                let arr: MenuUIPage<PomClient> = {};
                for (let i = 0; i < 3; i++) {
                    let page: MenuUIAlertView<PomClient>[] = [
                        {
                            "type": "text_title",
                            "msg": "Part " + "I".repeat(i + 1)
                        },
                        {
                            "type": "padding"
                        }
                    ]

                    for (let j = 0; j < plotLine[i].length; j++) {
                        if (client.data.plotLine.part[i].includes(j)) page.push({
                            "type": "text",
                            "msg": plotLine[i][j]
                        });
                    }

                    arr[i + ""] = {
                        "text": "Part " + "I".repeat(i + 1),
                        "page": page
                    };
                }
                return arr;
            }
        }
    }
}