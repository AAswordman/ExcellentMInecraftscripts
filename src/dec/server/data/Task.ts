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
    ]),
    new DecTask("013", 751, [
        "execute if entity @s[hasitem={item=dec:chocolates,quantity=8..}] if entity @s[hasitem={item=dec:long_bread,quantity=16..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:long_bread 0 16",
        "execute if entity @s[tag=task_complete] run clear @s dec:chocolates 0 8"
    ]),
    new DecTask("014", 68, [
        "execute if entity @s[hasitem={item=iron_sword}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s paper 0 1"
    ]),
    new DecTask("015", 142, [
        "execute if entity @s[hasitem={item=yellow_flower,quantity=14..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s yellow_flower 0 14"
    ]),
    new DecTask("016", 471, [
        "execute if entity @s[hasitem={item=log,data=0,quantity=64..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s log 0 64"
    ]),
    new DecTask("017", 512, [
        "execute if entity @s[hasitem={item=snow,quantity=12..}] if entity @s[hasitem={item=water_bucket}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s snow 0 12",
        "execute if entity @s[tag=task_complete] run clear @s water_bucket 0 1"
    ]),
    new DecTask("018", 224, [
        "execute if entity @s[hasitem={item=dec:candy,quantity=3..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:candy 0 3"
    ]),
    new DecTask("019", 375, [
        "execute if entity @s[hasitem={item=dec:rice_wine,quantity=16..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:rice_wine 0 16"
    ]),
    new DecTask("020", 1213, [
        "execute if entity @s[hasitem={item=netherite_scrap,quantity=4..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s netherite_scrap 0 4"
    ]),
    new DecTask("021", 742, [
        "execute if entity @s[hasitem={item=dec:ice_ingot}] if entity @s[hasitem={item=iron_ingot,quantity=35..}] if entity @s[hasitem={item=gold_ingot,quantity=62..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:ice_ingot 0 1",
        "execute if entity @s[tag=task_complete] run clear @s iron_ingot 0 35",
        "execute if entity @s[tag=task_complete] run clear @s gold_ingot 0 62"
    ]),
    new DecTask("022", 941, [
        "execute if entity @s[hasitem={item=dec:stream_stone,quantity=31..}] if entity @s[hasitem={item=amethyst_shard,quantity=42..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:stream_stone 0 31",
        "execute if entity @s[tag=task_complete] run clear @s amethyst_shard 0 42"
    ]),
    new DecTask("023", 421, [
        "execute if entity @s[hasitem={item=dec:ice_ingot}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:ice_ingot 0 1"
    ]),
    new DecTask("024", 761, [
        "execute if entity @s[hasitem={item=dec:coral_ingot,quantity=4..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:coral_ingot 0 4"
    ]),
    new DecTask("025", 761, [
        "execute if entity @s[hasitem={item=dec:stream_stone,quantity=14..}] if entity @s[hasitem={item=prismarine_shard,quantity=34..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:stream_stone 0 14",
        "execute if entity @s[tag=task_complete] run clear @s prismarine_shard 0 34",
    ]),
    new DecTask("026", 1231, [
        "execute if entity @s[hasitem={item=dec:ghost_ingot,quantity=2..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:ghost_ingot 0 2"
    ]),
    new DecTask("027", 541, [
        "execute if entity @s[hasitem={item=dec:pure_ingot}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:pure_ingot 0 1"
    ]),
    new DecTask("028", 1342, [
        "execute if entity @s[hasitem={item=dec:steel_ingot,quantity=41..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:steel_ingot 0 41"
    ]),
    new DecTask("029", 1433, [
        "execute if entity @s[hasitem={item=dec:star_debris,quantity=2..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:star_debris 0 2"
    ]),
    new DecTask("030", 978, [
        "execute if entity @s[hasitem={item=dec:echo_shard,quantity=2..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:echo_shard 0 2"
    ]),
    new DecTask("031", 134, [
        "execute if entity @s[hasitem={item=dec:stream_stone,quantity=13..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:stream_stone 0 13"
    ]),
    new DecTask("032", 134, [
        "execute if entity @s[hasitem={item=dec:stream_stone,quantity=32..}] if entity @s[hasitem={item=lapis_lazuli,quantity=26..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:stream_stone 0 32",
        "execute if entity @s[tag=task_complete] run clear @s lapis_lazuli 0 26"
    ]),
    new DecTask("033", 432, [
        "execute if entity @s[hasitem={item=dec:stream_stone,quantity=21..}] if entity @s[hasitem={item=lapis_lazuli,quantity=42..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:stream_stone 0 21",
        "execute if entity @s[tag=task_complete] run clear @s lapis_lazuli 0 42"
    ]),
    new DecTask("034", 331, [
        "execute if entity @s[hasitem={item=dec:stream_stone,quantity=14..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:stream_stone 0 14"
    ]),
    new DecTask("035", 451, [
        "execute if entity @s[hasitem={item=dec:stream_stone,quantity=31..}] if entity @s[hasitem={item=lapis_lazuli,quantity=42..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:stream_stone 0 31",
        "execute if entity @s[tag=task_complete] run clear @s lapis_lazuli 0 42"
    ]),
    new DecTask("036", 433, [
        "execute if entity @s[hasitem={item=dec:stream_stone,quantity=34..}] if entity @s[hasitem={item=lapis_lazuli,quantity=13..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:stream_stone 0 34",
        "execute if entity @s[tag=task_complete] run clear @s lapis_lazuli 0 13"
    ]),
    new DecTask("037", 264, [
        "execute if entity @s[hasitem={item=dec:stream_stone,quantity=21..}] if entity @s[hasitem={item=lapis_lazuli,quantity=41..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:stream_stone 0 21",
        "execute if entity @s[tag=task_complete] run clear @s lapis_lazuli 0 41"
    ]),
    new DecTask("038", 612, [
        "execute if entity @s[hasitem={item=dec:stream_stone,quantity=31..}] if entity @s[hasitem={item=lapis_lazuli,quantity=44..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:stream_stone 0 31",
        "execute if entity @s[tag=task_complete] run clear @s lapis_lazuli 0 44"
    ]),
    new DecTask("039", 951, [
        "execute if entity @s[hasitem={item=dec:stream_stone,quantity=71..}] if entity @s[hasitem={item=lapis_lazuli,quantity=42..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:stream_stone 0 71",
        "execute if entity @s[tag=task_complete] run clear @s lapis_lazuli 0 42"
    ]),
    new DecTask("040", 541, [
        "execute if entity @s[hasitem={item=dec:stream_stone,quantity=31..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:stream_stone 0 31"
    ]),
    new DecTask("041", 845, [
        "execute if entity @s[hasitem={item=dec:stream_stone,quantity=72..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:stream_stone 0 72"
    ]),
    new DecTask("042", 421, [
        "execute if entity @s[hasitem={item=log,quantity=64..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s log -1 64"
    ]),
    new DecTask("043", 562, [
        "execute if entity @s[hasitem={item=log,quantity=73..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s log -1 73"
    ]),
    new DecTask("044", 741, [
        "execute if entity @s[hasitem={item=log,quantity=134..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s log -1 134"
    ]),
    new DecTask("045", 854, [
        "execute if entity @s[hasitem={item=dec:rice,quantity=85..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:rice 0 85"
    ]),
    new DecTask("046", 951, [
        "execute if entity @s[hasitem={item=dec:soybean,quantity=75..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:soybean 0 75"
    ]),
    new DecTask("047", 1034, [
        "execute if entity @s[hasitem={item=dec:leek,quantity=76..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:leek 0 76"
    ]),
    new DecTask("048", 1045, [
        "execute if entity @s[hasitem={item=dec:bracken,quantity=73..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:bracken 0 73"
    ]),
    new DecTask("049", 1641, [
        "execute if entity @s[hasitem={item=dec:houttuynia,quantity=93..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:houttuynia 0 93"
    ]),
    new DecTask("050", 1241, [
        "execute if entity @s[hasitem={item=dec:fritillary,quantity=64..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:fritillary 0 64"
    ]),
    new DecTask("051", 1541, [
        "execute if entity @s[hasitem={item=dec:brizarre_chilli,quantity=95..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:brizarre_chilli 0 95"
    ]),
    new DecTask("052", 375, [
        "execute if entity @s[hasitem={item=dec:a_bowl_of_rice,quantity=4..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:a_bowl_of_rice 0 4"
    ]),
    new DecTask("053", 498, [
        "execute if entity @s[hasitem={item=dec:potato_rice,quantity=4..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:potato_rice 0 4"
    ]),
    new DecTask("054", 783, [
        "execute if entity @s[hasitem={item=dec:rice_wine,quantity=17..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:rice_wine 0 17"
    ]),
    new DecTask("055", 273, [
        "execute if entity @s[hasitem={item=dec:cooked_brain,quantity=27..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:cooked_brain 0 27"
    ]),
    new DecTask("056", 751, [
        "execute if entity @s[hasitem={item=dec:sea_urchin,quantity=4..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:sea_urchin 0 4"
    ]),
    new DecTask("057", 482, [
        "execute if entity @s[hasitem={item=dec:shell,quantity=3..}] run tag @s add task_complete",
        "execute if entity @s[tag=task_complete] run clear @s dec:shell 0 3"
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
