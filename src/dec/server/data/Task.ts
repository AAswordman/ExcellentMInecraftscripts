import { Player, ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import ExPlayer from "../../../modules/exmc/server/entity/ExPlayer.js";
import DecClient from "../DecClient.js";

export class DecTask {
    id: string;
    commands?: string[];
    conditions?: ((ep: ExPlayer) => boolean);
    respond?: ((ep: ExPlayer) => void);
    constructor(id: string, xp_change: number | string, condition: ((ep: ExPlayer) => boolean), respond: ((ep: ExPlayer) => void))
    constructor(id: string, xp_change: number | string, condition: string[], respond?: string[])
    constructor(id: string, xp_change: number | string, condition: string[] | ((ep: ExPlayer) => boolean), respond?: string[] | ((ep: ExPlayer) => void)) {
        this.id = id;
        if (condition instanceof Array) {
            this.commands = condition;
            if (respond && respond instanceof Array) {
                this.commands = this.commands.concat(respond);
            } else {
                this.commands.push(
                    "tellraw @s[tag=task_complete] { \"rawtext\" : [ { \"translate\" : \"text.dec:task_" + id + "_complete.name\" } ] }",
                    "tellraw @s[tag=!task_complete] { \"rawtext\" : [ { \"translate\" : \"text.dec:task_fail.name\" } ] }",
                    "loot give @s[tag=task_complete] loot \"tasks/" + id + "\"",
                    "xp @s[tag=task_complete] " + xp_change.toString(),
                    "replaceitem entity @s[tag=task_complete] slot.weapon.mainhand 0 air",
                    "tag @s remove task_complete"
                );
            }
        } else if (respond && !(respond instanceof Array)) {
            this.conditions = condition;
            this.respond = respond;
        }
    }
    title() {
        let title = "text.dec:task_" + this.id + "_title.name";
        return title;
    }
    body() {
        let body = "text.dec:task_" + this.id + "_body.name";
        return body;
    }
    detect(ep: ExPlayer) {
        if (this.commands) {
            ep.command.run(this.commands);
        }
        if (this.conditions && this.respond) {
            if (this.conditions(ep)) {
                this.respond(ep);
            }
        }
    }
}

//tag给符合条件加task_complete
export let DecTasks = [
    new DecTask("000", 1213, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:lava_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:lava_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:lava_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:lava_boots}] run tag @s add task_complete",
    ]),
    new DecTask("001", 1321, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:frozen_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:frozen_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:frozen_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:frozen_boots}] run tag @s add task_complete",
    ]),
    new DecTask("002", 1422, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:rupert_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:rupert_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:rupert_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:rupert_boots}] run tag @s add task_complete",
    ]),
    new DecTask("003", 961, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:amethyst_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:amethyst_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:amethyst_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:amethyst_boots}] run tag @s add task_complete",
    ]),
    new DecTask("004", 381, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:copper_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:copper_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:copper_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:copper_boots}] run tag @s add task_complete",
    ]),
    new DecTask("005", 1623, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:crying_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:crying_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:crying_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:crying_boots}] run tag @s add task_complete",
    ]),
    new DecTask("006", 1724, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:emerald_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:emerald_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:emerald_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:emerald_boots}] run tag @s add task_complete",
    ]),
    new DecTask("007", 2310, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:everlasting_winter_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:everlasting_winter_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:everlasting_winter_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:everlasting_winter_boots}] run tag @s add task_complete",
    ]),
    new DecTask("008", 945, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:knight_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=iron_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=iron_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=iron_boots}] run tag @s add task_complete",
    ]),
    new DecTask("009", 423, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:witch_hat}] run tag @s add task_complete",
    ]),
    new DecTask("010", 72, [
        "execute if entity @s[hasitem={item=paper}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s paper 0 1"
    ]),
    new DecTask("011", 71, [
        "tag @s add task_complete"
    ]),
    new DecTask("012", 0, [
        "tag @s add task_complete"
    ])
]

export let PomTasks = DecTasks.concat([
    //new DecTask("500", 100, (ep) => true,(ep) => ep.damage(100))
]);

const task_arr = ["Ao", "Jf", "Sk", "Ch", "Om", "Bs", "Hd", "Oa", "Gx", "Xe"];
export function taskTranToNum(t: string) {
    return t.split(" ").map(e => task_arr.indexOf(e)).join('');
}

export function numTranToTask(n: string) {
    return n.split('').map(e => task_arr[parseInt(e)]).join(" ");
}

export function taskUi(p: DecClient, i: ItemStack) {
    let ui = new ActionFormData();
    ui = ui.title("text.dec:task_choose_title.name")
    ui = ui.body("text.dec:task_choose_body.name")
    let lor = i.getLore()
    lor.forEach(l => {
        ui = ui.button(l)
    })
    ui.show(p.player).then(s => {
        if (s.selection != undefined) {
            let ch_t = lor[s.selection]
            let ch_n = taskTranToNum(ch_t)
            //p.runCommandAsync("say "+ch_n)
            taskUiChoose(p, ch_n);
        }
    })
}
export function taskUiChoose(p: DecClient, id: string) {
    let ui_ch = new ActionFormData().button("text.dec:task_complete_button.name");
    const index = DecTasks.findIndex(t => t.id === id);
    if (index === -1) {
        return;
    }
    ui_ch.title(DecTasks[index].title())
        .body(DecTasks[index].body())
        .show(p.player).then(s => {
            if (s.selection == 0) {
                DecTasks[index].detect(p.exPlayer);
            }
        });
}
