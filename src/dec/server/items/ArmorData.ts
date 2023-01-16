import ExPlayer from "../../../modules/exmc/server/entity/ExPlayer.js";
import jsonMerge from "../../../modules/exmc/utils/jsonMerge.js";

export class ArmorData {
    head: string;
    chest: string;
    legs: string;
    boots: string;
    constructor(head: string, chest: string, legs: string, boots: string) {
        this.head = head;
        this.chest = chest;
        this.legs = legs;
        this.boots = boots;
    }
    detect(p: ExPlayer) {
        return p.detectArmor(this.head, this.chest, this.legs, this.boots);
    }
}

export let ArmorPlayerDec = {
    rupert: new ArmorData("dec:rupert_helmet", "dec:rupert_chestplate", "rupert_leggings", "rupert_boots"),
    lava: new ArmorData("dec:lava_helmet", "dec:lava_chestplate", "dec:lava_leggings", "dec:lava_boots"),
    crying: new ArmorData("dec:crying_helmet", "dec:crying_chestplate", "dec:crying_leggings", "dec:crying_boots"),
    everlasting_winter: new ArmorData("dec:everlasting_winter_helmet", "dec:everlasting_winter_chestplate", "dec:everlasting_winter_leggings", "dec:everlasting_winter_boots")
}
let ArmorPlayerPomFrom = {
    rupert: new ArmorData("dec:rupert_helmet", "dec:rupert_chestplate", "rupert_leggings", "rupert_boots"),
    lava: new ArmorData("dec:lava_helmet", "dec:lava_chestplate", "dec:lava_leggings", "dec:lava_boots"),
    crying: new ArmorData("dec:crying_helmet", "dec:crying_chestplate", "dec:crying_leggings", "dec:crying_boots"),
    everlasting_winter: new ArmorData("dec:everlasting_winter_helmet", "dec:everlasting_winter_chestplate", "dec:everlasting_winter_leggings", "dec:everlasting_winter_boots")
}

export let ArmorPlayerPom = jsonMerge(ArmorPlayerPomFrom, ArmorPlayerDec);

let ArmorToName = new Map<ArmorData, string>();
for (let k in ArmorPlayerPom) {
    ArmorToName.set((<any>ArmorPlayerPom)[k], k);
}

export { ArmorToName };