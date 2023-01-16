import ExPlayer from "../../../modules/exmc/server/entity/ExPlayer.js";
import jsonMerge from "../../../modules/exmc/utils/jsonMerge.js";
import { ExCommandRunner } from '../../../modules/exmc/interface/ExCommandRunner.js';

export class ArmorData {
    head: string;
    chest: string;
    legs: string;
    boots: string;
    name!: string;
    constructor(head: string, chest: string, legs: string, boots: string) {
        this.head = head;
        this.chest = chest;
        this.legs = legs;
        this.boots = boots;
    }
    detect(p: ExPlayer) {
        return p.detectArmor(this.head, this.chest, this.legs, this.boots);
    }
    async find(c: ExCommandRunner) {
        try {
            let res = await c.run("execute as @a if entity @s[hasitem={location=slot.armor.head,item=" + this.head +
                "}] if entity @s[hasitem={location=slot.armor.chest,item=" + this.chest +
                "}] if entity @s[hasitem={location=slot.armor.legs,item=" + this.legs +
                "}] if entity @s[hasitem={location=slot.armor.feet,item=" + this.boots +
                "}] run tag @s add armorTest:" + this.name);
            return res;
        } catch (e) {
            return e;
        }
    }
}

export let ArmorPlayerDec = {
    rupert: new ArmorData("dec:rupert_helmet", "dec:rupert_chestplate", "dec:rupert_leggings", "dec:rupert_boots"),
    lava: new ArmorData("dec:lava_helmet", "dec:lava_chestplate", "dec:lava_leggings", "dec:lava_boots"),
    crying: new ArmorData("dec:crying_helmet", "dec:crying_chestplate", "dec:crying_leggings", "dec:crying_boots"),
    everlasting_winter: new ArmorData("dec:everlasting_winter_helmet", "dec:everlasting_winter_chestplate", "dec:everlasting_winter_leggings", "dec:everlasting_winter_boots"),
    amethyst: new ArmorData("dec:amethyst_helmet", "dec:amethyst_chestplate", "dec:amethyst_leggings", "dec:amethyst_boots"),
    turtle: new ArmorData("minecraft:turtle_helmet", "dec:turtle_chestplate", "dec:turtle_leggings", "dec:turtle_boots"),
    wood: new ArmorData("dec:wood_helmet", "dec:wood_chestplate", "dec:wood_leggings", "dec:wood_boots")
}
let ArmorPlayerPomFrom = {
    rupert: new ArmorData("dec:rupert_helmet", "dec:rupert_chestplate", "dec:rupert_leggings", "dec:rupert_boots")
}

export let ArmorPlayerPom = jsonMerge(ArmorPlayerPomFrom, ArmorPlayerDec);

let ArmorToName = new Map<ArmorData, string>();
for (let k in ArmorPlayerPom) {
    ((<any>ArmorPlayerPom)[k] as ArmorData).name = k;
    ArmorToName.set((<any>ArmorPlayerPom)[k], k);
}

export { ArmorToName };