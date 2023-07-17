import LoreUtil, { Piece } from "./ExLoreUtil.js";

export default class ExColorLoreUtil extends LoreUtil {
    override setTag(key: string): void {
        super.setTag("§r§n§6" + key);
    }
    override hasTag(key: string): boolean {
        let res = super.hasTag(key.startsWith("§") ? key : "§r§n§6" + key);
        return res;
    }
    override getValueUseMap(key: string, use: string): string | undefined {
        let res = super.getValueUseMap("§r§l§f" + key, "§r§o§b" + use);
        return res?.startsWith("§") ? res.substring(6) : res;
    }
    override setValueUseMap(key: string, use: string, value: string): void {
        super.setValueUseMap("§r§l§f" + key, "§r§o§b" + use, "§r§o§e" + value);
    }
    *colorEntries(key?: string) {
        for (let i of super.entries(key)) {
            yield [this.removeColorCode(i[0]), this.removeColorCode(i[1])];
        }
    }
    override search(key: string): Piece | undefined {
        let lore = this.getLore();
        key = this.removeColorCode(key);
        for (let i = 0; i < lore.length; i++) {

            if ((lore[i].startsWith("§") ? lore[i].substring(6) : lore[i]).startsWith(key + " : ")) {
                return new Piece(this.item, i);
            }
        }
        return undefined;

    }
}