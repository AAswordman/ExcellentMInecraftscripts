import ExLoreManager from "../../interface/ExLoreManager.js";
import LoreUtil, { Piece } from "./ExLoreUtil.js";

export default class ExColorLoreUtil{
    lore:LoreUtil;
    constructor(item: ExLoreManager) {
        this.lore = new LoreUtil(item);
    }
    setTag(key: string): void {
        this.lore.setTag("§r§n§6" + key);
    }
    hasTag(key: string): boolean {
        let res = this.lore.hasTag(key.startsWith("§") ? key : "§r§n§6" + key);
        return res;
    }
    getValueUseMap(key: string, use: string): string | undefined {
        let res = this.lore.getValueUseMap("§r§l§f" + key, "§r§o§b" + use);
        return res?.startsWith("§") ? res.substring(6) : res;
    }
    setValueUseMap(key: string, use: string, value: string): void {
        this.lore.setValueUseMap("§r§l§f" + key, "§r§o§b" + use, "§r§o§e" + value);
    }
    setValueUseDefault(key:string, value: string|number): void {
        this.lore.setValueUseDefault("§r§b" + key,(typeof value === "number" ? "§r§e":"§r§a") + value);
    }
    getValueUseDefault(key:string) {
        return this.lore.getValueUseDefault("§r§l§f" + key);
    }
    *entries(key?: string) {
        for (let i of this.lore.entries(key)) {
            yield [this.lore.removeColorCode(i[0]), this.lore.removeColorCode(i[1])];
        }
    }
    sort(){
        this.lore.sort();
    }
    setLore(l: string[]): void {
        this.lore.setLore(l);
    }
    delete(name:string){
        this.lore.delete("§r§l§f" + name);
        this.lore.delete("§r§n§6" + name);
    }
    search(name:string){
        return this.lore.search("§r§l§f" + name) || this.lore.search("§r§n§6" + name);
    }
}