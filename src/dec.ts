import { world, MinecraftEffectTypes, Dimension, Entity, Player, EntityInventoryComponent, ItemStack } from '@minecraft/server';
import { ActionFormData } from "@minecraft/server-ui";

class Task {
    id: string
    commands: Array<string>
    constructor(id: string, xp_change: number | string, commands: Array<string>) {
        this.id = id
        this.commands = commands
        this.commands.push(
            "tellraw @s[tag=task_complete] { \"rawtext\" : [ { \"translate\" : \"text.dec:task_" + id + "_complete.name\" } ] }",
            "tellraw @s[tag=!task_complete] { \"rawtext\" : [ { \"translate\" : \"text.dec:task_fail.name\" } ] }",
            "loot give @s[tag=task_complete] loot \"tasks/" + id + "\"",
            "xp @s[tag=task_complete] " + xp_change.toString,
            "replaceitem entity @s[tag=task_complete] slot.weapon.mainhand 0 air",
            "tag @s remove task_complete"
        )
    }
    title() {
        let title = "text.dec:task_" + this.id + "_title.name"
        return title
    }
    body() {
        let body = "text.dec:task_" + this.id + "_body.name"
        return body
    }
}

function runComMult(en: Dimension | Entity | Player, commands: Array<string>) {
    commands.forEach(c => {
        en.runCommandAsync(c)
    });
}
function randonNumber(min: number, max: number) {
    let length = Math.floor(Math.random() * (max - min + 1));
    return min + length;
}
function ifInRange(n: number, min: number, max: number) {
    if (n >= min && n <= max) {
        return true
    } else {
        return false
    }
}
function findEleInArr(aim_e: string | number, arr: Array<string> | Array<number>) {
    let r = []
    if (arr) {
        for (let i = 0; i <= arr.length; i++) {
            if (arr[i] == aim_e) {
                r.push(i)
            }
        }
    } else {
        return []
    }
    return r
}
function equAddTag(tar: Entity | Player, head: string, chest: string, legs: string, boots: string, tag: string) {
    tar.runCommandAsync("execute if entity @s[hasitem={location=slot.armor.head,item=" + head + "}] if entity @s[hasitem={location=slot.armor.chest,item=" + chest + "}] if entity @s[hasitem={location=slot.armor.legs,item=" + legs + "}] if entity @s[hasitem={location=slot.armor.feet,item=" + boots + "}] run tag @s add " + tag)
}
function numTranToTask(n: number) {
    let r = ""
    let task_arr = ["Ao", "Jf", "Sk", "Ch", "Om", "Bs", "Hd", "Oa", "Gx", "Xe"]
    for (let l = 0; l <= n.toString().length - 1; l++) {
        r = r + task_arr.slice(parseInt(n.toString().charAt(l)), parseInt(n.toString().charAt(l)) + 1) + " "
    }
    while (r.charAt(-1) == " ") {
        r = r.slice(0, r.length - 1)
    }
    return r
}

function taskTranToNum(t: string) {
    let task_arr = ["Ao", "Jf", "Sk", "Ch", "Om", "Bs", "Hd", "Oa", "Gx", "Xe"]
    let n = ""
    while (t.length >= 2) {
        n = n + findEleInArr(t.slice(0, 2), task_arr).toString()
        t = t.slice(3)
    }
    return n
}

function taskUi(p: Player, i: ItemStack) {
    let ui = new ActionFormData()
    ui = ui.title("text.dec:task_choose_title.name")
    ui = ui.body("text.dec:task_choose_body.name")
    let lor = i.getLore()
    lor.forEach(l => {
        ui = ui.button(l)
    })
    ui.show(p).then(s => {
        if (s.selection != undefined) {
            let ch_t = lor[s.selection]
            let ch_n = taskTranToNum(ch_t)
            //p.runCommandAsync("say "+ch_n)
            taskUiChoose(p, ch_n)
        }
    })
}

function taskUiChoose(p: Player, id: string) {
    let ui_ch = new ActionFormData()
    ui_ch.button("text.dec:task_complete_button.name")
    let title = ""
    let body = ""
    let commands = new Array<string>
    tasks.forEach(t => {
        if (t.id == id) {
            title = t.title()
            body = t.body()
            commands = t.commands
            return
        }
    })
    ui_ch = ui_ch.title(title)
    ui_ch = ui_ch.body(body)
    ui_ch.show(p).then(s => {
        if (s.selection == 0) {
            runComMult(p, commands)
        }
    })
}
try {
    world.scoreboard.addObjective("i_inviolable", "i_inviolable")
}
catch { }
try {
    world.scoreboard.addObjective("i_damp", "i_damp")
}
catch { }
try {
    world.scoreboard.addObjective("i_soft", "i_soft")
}
catch { }
/*try {
    world.scoreboard.addObjective("harmless", "harmless")
}
catch { }*/
let sc_i_inviolable = world.scoreboard.getObjective("i_inviolable")
let sc_i_damp = world.scoreboard.getObjective("i_damp")
let sc_i_soft = world.scoreboard.getObjective("i_soft")
//let sc_harmless = world.scoreboard.getObjective("harmless")//实际效果没写，原因：不知道怎么取消伤害

world.events.beforeChat.subscribe(e => {
    if (e.message == ">/help") {
        world.getDimension("overworld").runCommandAsync("function help")
        e.cancel = true
    }
    if (e.message == ">/diemode open") {
        world.getDimension("overworld").runCommandAsync("function diemode/open")
        e.cancel = true
    }
    if (e.message == ">/diemode test") {
        world.getDimension("overworld").runCommandAsync("function diemode/test")
        e.cancel = true
    }
    if (e.message == ">/magic display true") {
        if (e.sender.isOp()) {
            world.getDimension("overworld").runCommandAsync("function magic/display_on")
            e.cancel = true
        } else {
            world.getDimension("overworld").runCommandAsync("tellraw @s { \"rawtext\" : [ { \"translate\" : \"text.dec:command_fail.name\" } ] }")
            e.cancel = true
        }
    }
    if (e.message == ">/magic display false") {
        if (e.sender.isOp()) {
            world.getDimension("overworld").runCommandAsync("function magic/display_off")
            e.cancel = true
        } else {
            world.getDimension("overworld").runCommandAsync("tellraw @s { \"rawtext\" : [ { \"translate\" : \"text.dec:command_fail.name\" } ] }")
            e.cancel = true
        }
    }
})

world.events.blockBreak.subscribe(e => {
    //防破坏方块 i_inviolable计分板控制
    if (sc_i_inviolable.getScore(e.player.scoreboard) > 1) {
        e.dimension.getBlock(e.block.location).setType(e.brokenBlockPermutation.type)
        world.getDimension("overworld").runCommandAsync("kill @e[type=item,r=2,x=" + e.block.x + ",y=" + e.block.y + ",z=" + e.block.z + "]")
        e.player.addEffect(MinecraftEffectTypes.nausea, 200, 0, true)
        e.player.addEffect(MinecraftEffectTypes.blindness, 200, 0, true)
        e.player.addEffect(MinecraftEffectTypes.darkness, 400, 0, true)
        e.player.addEffect(MinecraftEffectTypes.wither, 100, 0, true)
        e.player.addEffect(MinecraftEffectTypes.miningFatigue, 600, 2, true)
        e.player.addEffect(MinecraftEffectTypes.hunger, 600, 1, true)
        e.player.runCommandAsync("tellraw @s { \"rawtext\" : [ { \"translate\" : \"text.dec:i_inviolable.name\" } ] }")
    }
})

world.events.beforeExplosion.subscribe(e => {
    //防爆 i_inviolable计分板控制
    if (sc_i_damp.getScore(e.source.scoreboard) > 0) {
        world.getDimension("overworld").runCommandAsync("particle dec:damp_explosion_particle " + String(e.source.location.x) + " " + String(e.source.location.y) + " " + String(e.source.location.z))
        e.cancel = true
    }
})

world.events.beforeItemUseOn.subscribe(e => {
    //防放方块
    if (sc_i_soft.getScore(e.source.scoreboard) > 0 && e.item.typeId != "dec:iron_key" && e.item.typeId != "dec:frozen_power") {
        e.cancel = true
    }
})

world.events.entityHurt.subscribe(e => {
    let ra = randonNumber(1, 100)
    //鲁伯特套装受伤效果
    if (ifInRange(ra, 1, 20)) {
        equAddTag(e.hurtEntity, "dec:rupert_helmet", "dec:rupert_chestplate", "rupert_leggings", "rupert_boots", "rupert_armor_skill_1")
        runComMult(e.hurtEntity, [
            "effect @s[tag=rupert_armor_skill_1] regeneration 10",
            "effect @s[tag=rupert_armor_skill_1] speed 5",
            "execute if entity @s[tag=rupert_armor_skill_1] run particle dec:tear_from_rupert ~~1~",
            "execute if entity @s[tag=rupert_armor_skill_1] run particle dec:tear_from_rupert ~~1~",
            "execute if entity @s[tag=rupert_armor_skill_1] run particle dec:tear_from_rupert ~~1~",
            "execute if entity @s[tag=rupert_armor_skill_1] run particle dec:tear_from_rupert ~~1~",
            "execute if entity @s[tag=rupert_armor_skill_1] run particle dec:tear_from_rupert ~~1~",
            "tag @s[tag=rupert_armor_skill_1] remove rupert_armor_skill_1"
        ])
    }
    //岩浆套受伤效果
    equAddTag(e.hurtEntity, "dec:lava_helmet", "dec:lava_chestplate", "dec:lava_leggings", "dec:lava_boots", "lava_armor_skill")
    runComMult(e.hurtEntity, [
        "execute if entity @s[tag=lava_armor_skill] run particle dec:fire_spurt_particle ~~1~",
        "effect @s[tag=lava_armor_skill] fire_resistance 4",
        "tag @s[tag=lava_armor_skill] remove lava_armor_skill"
    ])

    //哭泣套受伤效果
    equAddTag(e.hurtEntity, "dec:crying_helmet", "dec:crying_chestplate", "dec:crying_leggings", "dec:crying_boots", "crying_armor_skill")
    if (ifInRange(ra, 1, 10)) {
        e.hurtEntity.runCommandAsync("effect @s[tag=crying_armor_skill] weakness 5")
    } else if (ifInRange(ra, 11, 20)) {
        e.hurtEntity.runCommandAsync("effect @s[tag=crying_armor_skill] slowness 5")
    } else if (ifInRange(ra, 21, 30)) {
        e.hurtEntity.runCommandAsync("effect @s[tag=crying_armor_skill] blindness 5")
    } else if (ifInRange(ra, 31, 40)) {
        e.hurtEntity.runCommandAsync("effect @s[tag=crying_armor_skill] nausea 7")
    }
    e.hurtEntity.runCommandAsync("tag @s[tag=crying_armor_skill] remove crying_armor_skill")

    //永冬套受伤效果
    if (ifInRange(ra, 1, 12)) {
        equAddTag(e.hurtEntity, "dec:everlasting_winter_helmet", "dec:everlasting_winter_chestplate", "dec:everlasting_winter_leggings", "dec:everlasting_winter_boots", "everlasting_winter_skill")
        runComMult(e.hurtEntity, [
            "execute if entity @s[tag=everlasting_winter_skill] run effect @e[r=5,tag=!everlasting_winter_skill] slowness 3 1",
            "effect @s[tag=everlasting_winter_skill] health_boost 30 0",
            "execute if entity @s[tag=everlasting_winter_skill] run particle dec:everlasting_winter_spurt_particle ~~~",
            "tag @s[tag=everlasting_winter_skill] remove everlasting_winter_skill"
        ])
    }
})

world.events.tick.subscribe(e => {
    //诅咒时间减少
    runComMult(world.getDimension("overworld"), [
        "scoreboard players remove @e[scores={i_inviolable=1..}] i_inviolable 1",
        "scoreboard players remove @e[scores={i_damp=1..}] i_damp 1",
        "scoreboard players remove @e[scores={i_soft=1..}] i_soft 1",
        "scoreboard players remove @e[scores={harmless=1..}] harmless 1"
    ])

    for (const p of Array.from(world.getPlayers())) {
        //蓝魔法卷轴
        let c = (<EntityInventoryComponent>p.getComponent("minecraft:inventory")).container
        if (c.getItem(p.selectedSlot) != undefined) {
            if (c.getItem(p.selectedSlot).typeId == "dec:magic_scroll_blue" && c.getItem(p.selectedSlot).amount == 1 && c.getItem(p.selectedSlot).getLore().length == 0) {
                let t_n = randonNumber(1, 3)
                let c_n = c.getItem(p.selectedSlot)
                let lor = []
                for (let i = 0; i < t_n; i++) {
                    //lor.push(numTranToTask(randonNumber(0, 9)) + numTranToTask(randonNumber(0, 9)) + numTranToTask(randonNumber(0, 9)))
                    lor.push("Ao Ao " + numTranToTask(randonNumber(0, 9)))
                }
                c_n.setLore(lor)
                c.setItem(p.selectedSlot, c_n)
            }
        }
        //潜行获得tag is_sneaking
        if (p.isSneaking) {
            p.addTag("is_sneaking")
        } else {
            p.removeTag("is_sneaking")
        }

        //根据维度添加tag
        if (p.dimension.id == "minecraft:overworld") {
            p.addTag("dOverworld")
            p.removeTag("dNether")
            p.removeTag("dTheEnd")
        } else if (p.dimension.id == "minecraft:nether") {
            p.addTag("dNether")
            p.removeTag("dOverworld")
            p.removeTag("dTheEnd")
            p.runCommandAsync("fog @a remove \"night_event\"")
        } else if (p.dimension.id == "minecraft:the_end") {
            p.addTag("dTheEnd")
            p.removeTag("dNether")
            p.removeTag("dOverworld")
            p.runCommandAsync("fog @a remove \"night_event\"")
        }

        if (e.currentTick % 20 == 0) {
            //紫水晶套装效果
            equAddTag(p, "dec:amethyst_helmet", "dec:amethyst_chestplate", "dec:amethyst_leggings", "dec:amethyst_boots", "amethyst_armor_skill")
            runComMult(p, [
                "execute if entity @s[tag=amethyst_armor_skill] run function armor/amethyst_armor",
                "tag @s[tag=amethyst_armor_skill] remove amethyst_armor_skill"
            ])
        }

        if (e.currentTick % 40 == 0) {
            equAddTag(p, "dec:rupert_helmet", "dec:rupert_chestplate", "dec:rupert_leggings", "dec:rupert_boots", "rupert_armor_skill")
            runComMult(p, [
                //鲁伯特套装效果
                "execute if entity @s[tag=rupert_armor_skill] run particle dec:tear_from_rupert ~~1~",
                "tag @s[tag=rupert_armor_skill] remove rupert_armor_skill"
            ])
            //海龟套效果
            if (p.isSneaking) {
                equAddTag(p, "minecraft:turtle_helmet", "dec:turtle_chestplate", "dec:turtle_leggings", "dec:turtle_boots", "turtle_armor_skill_b")
                runComMult(p, [
                    "execute if entity @s[hasitem={location=slot.weapon.mainhand,item=dec:turtle_sword},tag=turtle_armor_skill_b] run tag @s add turtle_armor_skill",
                    "effect @s[tag=turtle_armor_skill] slowness 5 5",
                    "effect @s[tag=turtle_armor_skill] resistance 2 3",
                    "effect @s[tag=turtle_armor_skill] weakness 2 50",
                    "tag @s[tag=turtle_armor_skill] remove turtle_armor_skill",
                    "tag @s[tag=turtle_armor_skill_b] remove turtle_armor_skill_b"
                ])
            }
        }

        if (e.currentTick % 100 == 0) {
            //木叶套装效果
            equAddTag(p, "dec:wood_helmet", "dec:wood_chestplate", "dec:wood_leggings", "dec:wood_boots", "wood_armor_skill")
            runComMult(p, [
                "scoreboard players add @s[scores={magicpoint=..15},tag=wood_armor_skill] magicpoint 1",
                "execute if entity @s[tag=wood_armor_skill,scores={magicpoint=..15}] run particle dec:wood_armor_magic_increase_particle ~~~",
                "tag @s[tag=wood_armor_skill] remove wood_armor_skill"
            ])
        }
        /*if (p.getItemCooldown("village_portal") > 10) {
            p.startItemCooldown("village_portal",p.getItemCooldown("village_portal")-10)
        }*/
    }
})

world.events.itemUse.subscribe(e => {
    //魔法纸张
    if (e.item.typeId == "dec:magic_scroll_blue") {
        let c = (<EntityInventoryComponent>(<Player>e.source).getComponent("minecraft:inventory")).container
        taskUi((<Player>e.source), c.getItem((<Player>e.source).selectedSlot))
    }
})

//tag给符合条件加task_complete
let tasks = [
    new Task("000", 200, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:lava_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:lava_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:lava_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:lava_boots}] run tag @s add task_complete",
    ]),
    new Task("001", 140, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:frozen_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:frozen_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:frozen_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:frozen_boots}] run tag @s add task_complete",
    ]),
    new Task("002", 170, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:rupert_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:rupert_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:rupert_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:rupert_boots}] run tag @s add task_complete",
    ]),
    new Task("003", 60, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:amethyst_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:amethyst_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:amethyst_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:amethyst_boots}] run tag @s add task_complete",
    ]),
    new Task("004", 50, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:copper_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:copper_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:copper_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:copper_boots}] run tag @s add task_complete",
    ]),
    new Task("005", 300, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:crying_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:crying_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:crying_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:crying_boots}] run tag @s add task_complete",
    ]),
    new Task("006", 80, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:emerald_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:emerald_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:emerald_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:emerald_boots}] run tag @s add task_complete",
    ]),
    new Task("007", 700, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:everlasting_winter_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:everlasting_winter_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:everlasting_winter_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:everlasting_winter_boots}] run tag @s add task_complete",
    ]),
    new Task("008", 200, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:knight_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=iron_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=iron_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=iron_boots}] run tag @s add task_complete",
    ]),
    new Task("009", 100, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:witch_hat}] run tag @s add task_complete",
    ])
]