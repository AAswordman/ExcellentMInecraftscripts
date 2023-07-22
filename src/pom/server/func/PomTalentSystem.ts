import { EntityQueryOptions, Entity, EntityAttributeComponent } from '@minecraft/server';
import MathUtil from "../../../modules/exmc/math/MathUtil.js";
import ExEntity from "../../../modules/exmc/server/entity/ExEntity.js";
import ExPlayer from "../../../modules/exmc/server/entity/ExPlayer.js";
import ExColorLoreUtil from "../../../modules/exmc/server/item/ExColorLoreUtil.js";
import ExItem from "../../../modules/exmc/server/item/ExItem.js";
import { decodeUnicode } from "../../../modules/exmc/utils/Unicode.js";
import TalentData, { Occupation, Talent } from "../cache/TalentData.js";
import isEquipment from "../items/isEquipment.js";
import GameController from "./GameController.js";
import ExGameVector3 from '../../../modules/exmc/server/math/ExGameVector3.js';
import damageShow from "../helper/damageShow.js";
import MonitorManager from "../../../modules/exmc/utils/MonitorManager.js";
import ExSystem from '../../../modules/exmc/utils/ExSystem.js';
import TickDelayTask from '../../../modules/exmc/utils/TickDelayTask.js';
import ItemTagComponent from '../data/ItemTagComponent.js';
import { ArmorData } from '../../../dec/server/items/ArmorData.js';
import VarOnChangeListener from '../../../modules/exmc/utils/VarOnChangeListener.js';

export default class PomTalentSystem extends GameController {
    strikeSkill = true;
    talentRes: Map<number, number> = new Map<number, number>();
    skillLoop = ExSystem.tickTask(() => {
        if (this.data.talent.occupation.id === Occupation.ASSASSIN.id) this.strikeSkill = true;
        if (this.data.talent.occupation.id === Occupation.PRIEST.id) {
            let health = 999;
            let player: ExPlayer = this.exPlayer;
            for (let p of this.player.dimension.getPlayers({
                maxDistance: 20,
                location: this.player.location
            })) {
                let exp = ExPlayer.getInstance(p);
                if (exp.health < health) {
                    health = exp.health;
                    player = exp;
                }
            }
            player.addHealth(this, (this.talentRes.get(Talent.REGENERATE) ?? 0));
        }
    }).delay(10 * 20);

    equiTotalTask: TickDelayTask | undefined;

    itemOnHandComp?: ItemTagComponent;
    headComp?: ItemTagComponent;
    chestComp?: ItemTagComponent;
    legComp?: ItemTagComponent;
    feetComp?: ItemTagComponent;

    armor_movement_addition: [number, number, number] = [0, 0, 0];
    armor_attack_addition = 0;
    armor_protection: [number, number, number] = [0, 0, 0];

    movement: [number, number, number] = [0.1, 0.1, 0.03];
    movement_addition: [number, number, number] = [0, 0, 0];
    attack_addition = 0;

    movementChanger = new VarOnChangeListener((n, l) => {
        if (n) {
            this.exPlayer.triggerEvent("movement_" + MathUtil.round(MathUtil.clamp(this.movement[1] + this.movement_addition[1], 0, 0.2), 3));
        } else {
            this.exPlayer.triggerEvent("movement_" + MathUtil.round(MathUtil.clamp(this.movement[0] + this.movement_addition[0], 0, 0.2), 3));
        }
        this.exPlayer.triggerEvent("underwater_" + MathUtil.round(MathUtil.clamp(this.movement[2] + this.movement_addition[2], 0, 0.2), 3));
    }, false);

    armorUpdater = new VarOnChangeListener((n, l) => {
        const bag = this.exPlayer.getBag();
        const head = bag.equipmentOnHead, chest = bag.equipmentOnChest,
            legs = bag.equipmentOnLegs, feet = bag.equipmentOnFeet;
        if (head) this.headComp = new ItemTagComponent(ExItem.getInstance(head));
        if (chest) this.chestComp = new ItemTagComponent(ExItem.getInstance(chest));
        if (legs) this.legComp = new ItemTagComponent(ExItem.getInstance(legs));
        if (feet) this.feetComp = new ItemTagComponent(ExItem.getInstance(feet));

        this.updateArmorData();
        this.updatePlayerAttribute();
    }, "");

    chooseArmor(a: ArmorData) {

    }
    updateTalentRes() {
        this.talentRes.clear();

        for (let t of this.data.talent.talents) {
            this.talentRes.set(t.id, TalentData.calculateTalent(this.data.talent.occupation, t.id, t.level));
        }

        this.client.magicSystem.upDateByTalent(this.talentRes);

        if (this.data.talent.occupation.id === Occupation.PRIEST.id || this.data.talent.occupation.id === Occupation.ASSASSIN.id) {
            this.skillLoop.start();
        } else {
            this.skillLoop.stop();
        }
        //this.exPlayer.triggerEvent("hp:" + Math.round((20 + (this.talentRes.get(Talent.VIENTIANE) ?? 0))));
    }

    //更新盔甲属性（在不换甲的情况下）
    updateArmorData() {
        this.headComp?.setGroup(this.headComp.dataGroupJudge(this.client));
        this.chestComp?.setGroup(this.chestComp.dataGroupJudge(this.client));
        this.legComp?.setGroup(this.legComp.dataGroupJudge(this.client));
        this.feetComp?.setGroup(this.feetComp.dataGroupJudge(this.client));

        this.attack_addition = (this.headComp?.getComponentWithGroup("attack_addition") ?? 0)
            + (this.chestComp?.getComponentWithGroup("attack_addition") ?? 0)
            + (this.legComp?.getComponentWithGroup("attack_addition") ?? 0)
            + (this.feetComp?.getComponentWithGroup("attack_addition") ?? 0);
        this.armor_movement_addition = (["movement_addition", "sneak_movement_addition", "underwater_movement_addition"] as any[])
            .map(e =>
                (this.headComp?.getComponentWithGroup(e) ?? 0)
                + (this.chestComp?.getComponentWithGroup(e) ?? 0)
                + (this.legComp?.getComponentWithGroup(e) ?? 0)
                + (this.feetComp?.getComponentWithGroup(e) ?? 0)) as any;
        this.armor_protection = (["armor_magic_protection", "armor_physical_protection", "armor_physical_reduction"] as any[])
            .map(e =>
                (this.headComp?.getComponentWithGroup(e) ?? 0)
                + (this.chestComp?.getComponentWithGroup(e) ?? 0)
                + (this.legComp?.getComponentWithGroup(e) ?? 0)
                + (this.feetComp?.getComponentWithGroup(e) ?? 0)) as any;
    }

    //更新玩家属性（不改变手持）
    updatePlayerAttribute() {
        //攻击还没写

        //保护
        this.exPlayer.triggerEvent(`damage_senser:mg_${MathUtil.clamp(Math.round(this.armor_protection[0] / 2) * 2, 0, 60)
            }_ph_${MathUtil.clamp(Math.round(this.armor_protection[1] / 2) * 2, 0, 60)
            }_ph2_${MathUtil.clamp(Math.round(this.armor_protection[2]), 0, 4)
            }`);

        //速度
        this.movement_addition[0] = this.armor_movement_addition[0] + (this.itemOnHandComp?.getComponentWithGroup("movement_addition") ?? 0)
        this.movement_addition[1] = this.armor_movement_addition[1] + (this.itemOnHandComp?.getComponentWithGroup("sneak_movement_addition") ?? 0)
        this.movement_addition[2] = this.armor_movement_addition[2] + (this.itemOnHandComp?.getComponentWithGroup("underwater_movement_addition") ?? 0)
        this.movementChanger.force();
    }


    onJoin(): void {
        this.getEvents().exEvents.onLongTick.subscribe(e => {
            if (e.currentTick % 20 === 0) {
                const bag = this.exPlayer.getBag();
                const head = bag.equipmentOnHead, chest = bag.equipmentOnChest,
                    legs = bag.equipmentOnLegs, feet = bag.equipmentOnFeet;

                this.armorUpdater.upDate(head?.typeId + "|" + chest?.typeId + "|" + legs?.typeId + "|" + feet?.typeId);
            }
        });
        this.getEvents().exEvents.tick.subscribe(e => {
            this.movementChanger.upDate(this.player.isSneaking);
        });


        this.getEvents().exEvents.afterPlayerHitEntity.subscribe((e) => {
            let item = this.exPlayer.getBag().itemOnMainHand;
            let damageFac = 0;
            let extraDamage = 0;
            let target = ExEntity.getInstance(e.hurtEntity);
            let dis = target.position.distance(this.exPlayer.position);
            let CLOAD_PIERCING = this.talentRes.get(Talent.CLOAD_PIERCING) ?? 0;

            damageFac += Math.min(64, dis) / 64 * CLOAD_PIERCING / 100;
            let ARMOR_BREAKING = this.talentRes.get(Talent.ARMOR_BREAKING) ?? 0;
            extraDamage += this.exPlayer.getMaxHealth() * ARMOR_BREAKING / 100;

            let SANCTION = this.talentRes.get(Talent.SANCTION) ?? 0;
            damageFac += (16 - Math.min(16, dis)) / 16 * SANCTION / 100;
            let SUDDEN_STRIKE = this.talentRes.get(Talent.SUDDEN_STRIKE) ?? 0;
            if (item) {
                if (item.typeId.startsWith("dec:")) damageFac += 0.4;
                let lore = new ExColorLoreUtil(ExItem.getInstance(item));
            }
            if (this.strikeSkill) {
                if (this.data.talent.occupation.id === Occupation.ASSASSIN.id) this.skillLoop.startOnce();
                this.strikeSkill = false;
                damageFac += SUDDEN_STRIKE / 100;
            }



            let damage = e.damage * damageFac + extraDamage;
            if (this.globalSettings.damageShow) {
                damageShow(this.getExDimension(), damage, target.entity.location);
            }
            this.hasCauseDamage.trigger(e.damage + damage, e.hurtEntity);

            target.removeHealth(this, damage);
        });

        this.getEvents().exEvents.afterPlayerHurt.subscribe((e) => {
            let damage = (this.exPlayer.getPreRemoveHealth() ?? 0) + e.damage;
            let add = 0;
            add += damage * (this.talentRes.get(Talent.DEFENSE) ?? 0) / 100;

            this.exPlayer.addHealth(this, add);
            this.hasBeenDamaged.trigger(e.damage - add, e.damageSource.damagingEntity);
        });

        let lastListener = (d: number) => { };
        this.getEvents().exEvents.afterItemOnHandChange.subscribe((e) => {
            let bag = this.exPlayer.getBag();
            if (e.afterItem) {
                //设置lore
                const lore = new ExColorLoreUtil(e.afterItem);
                //TalentData.calculateTalentToLore(this.data.talent.talents, this.data.talent.occupation, ExItem.getInstance(e.afterItem), this.getLang());

                let comp = new ItemTagComponent(ExItem.getInstance(e.afterItem));
                comp.setGroup(comp.dataGroupJudge(this.client));
                let base: string[] = [];
                if (comp.hasComponent("actual_level")) base.push(`§r§e基础属性` + "  §r§6LV." + comp.getComponentWithGroup("actual_level"));
                if (comp.hasComponent("armor_protection")) base.push("§r§7•护甲值§6+" + comp.getComponentWithGroup("movement_addition"));

                if (comp.hasComponent("armor_type")) {
                    //let typeMsg = comp.getComponentWithGroup("armor_type");
                    //lore.setValueUseDefault("盔甲类型", typeMsg.tagName + ": " + typeMsg.data);
                    if (comp.hasComponent("armor_physical_protection")) base.push("§r§7•物理抗性§6+" + comp.getComponentWithGroup("armor_physical_protection") + "％§r§7 | 受到的物理伤害§6-" + comp.getComponentWithGroup("armor_physical_reduction") ?? 0);
                    if (comp.hasComponent("armor_magic_protection")) base.push("§r§7•魔法抗性§6+" + comp.getComponentWithGroup("armor_magic_protection") + "％");
                }
                let smove = comp.getComponentWithGroup("sneak_movement_addition") ?? 0;
                if (comp.hasComponent("movement_addition")) {
                    base.push("§r§7•移动速度§6+" + comp.getComponentWithGroup("movement_addition"));

                    if (comp.hasComponent("sneak_movement_addition"))
                        base[base.length - 1] += ("§r§7 | 潜行移速" + (smove < 0 ? "§c" + smove : "§6+" + smove));
                } else if (comp.hasComponent("sneak_movement_addition")) base.push("§r§7•潜行移速" + (smove < 0 ? "§c" + smove : "§6+" + smove));
                if (comp.hasComponent("equipment_type")) {
                    if (e.afterItem.typeId.startsWith("dec:")) {
                        base.push("§r§7•在主手时: +40％§7攻击伤害");
                    }
                    // let typeMsg = comp.getComponentWithGroup("equipment_type");
                    // lore.setValueUseDefault("武器类型", typeMsg.tagName + ": " + typeMsg.data);
                }
                if (base.length > 0) {
                    base[base.length - 1] = base[base.length - 1] + "§r";
                    lore.setTags(base);
                }
                lore.sort();
                this.itemOnHandComp = comp;

                bag.itemOnMainHand = e.afterItem;

                //武器特殊项
                if (comp.hasComponent("equipment_type")) {

                    let maxSingleDamage = parseFloat(lore.getValueUseMap("total", this.getLang().maxSingleDamage) ?? "0");
                    let maxSecondaryDamage = parseFloat(lore.getValueUseMap("total", this.getLang().maxSecondaryDamage) ?? "0");
                    let damage = 0;
                    this.hasCauseDamage.removeMonitor(lastListener);
                    lastListener = (d: number) => {
                        damage += d;
                        maxSingleDamage = Math.ceil(Math.max(d, maxSingleDamage));
                    };
                    this.hasCauseDamage.addMonitor(lastListener);
                    this.equiTotalTask?.stop();
                    (this.equiTotalTask = ExSystem.tickTask(() => {
                        let shouldUpstate = false;
                        maxSecondaryDamage = Math.ceil(Math.max(maxSecondaryDamage, damage / 5));
                        damage = 0;
                        if ((lore.getValueUseMap("total", this.getLang().maxSingleDamage) ?? "0") !== maxSingleDamage + "") {
                            lore.setValueUseMap("total", this.getLang().maxSingleDamage, maxSingleDamage + "");
                            shouldUpstate = true;
                        }
                        if ((lore.getValueUseMap("total", this.getLang().maxSecondaryDamage) ?? "0") !== maxSecondaryDamage + "") {
                            lore.setValueUseMap("total", this.getLang().maxSecondaryDamage, maxSecondaryDamage + "");
                            shouldUpstate = true;
                        }
                        if (shouldUpstate && bag.itemOnMainHand?.typeId === e?.afterItem?.typeId) {
                            lore.sort();
                            bag.itemOnMainHand = e.afterItem;
                        }
                    }).delay(5 * 20)).start(); //
                }
            } else {
                this.equiTotalTask?.stop();
                this.itemOnHandComp = undefined;
            }
            this.updatePlayerAttribute();
            this.exPlayer.triggerEvent("hp:" + Math.round((20 + (this.talentRes.get(Talent.VIENTIANE) ?? 0))));
        });

        let testCauseDamage = 0;
        let testRoundDamage = 0;
        let testBeDamaged = 0;
        let delay = 0;
        this.getEvents().exEvents.beforeChatSend.subscribe(data => {
            if (data.message.startsWith(">/_debugger")) {
                if (!this.debugger) {
                    this.debugger = true;
                    this.client.magicSystem.registActionbarPass("debugger");
                    this.hasBeenDamaged.addMonitor(e => {
                        testBeDamaged += e;
                    });
                    this.hasCauseDamage.addMonitor(e => {
                        testCauseDamage += e;
                    });
                    this.getEvents().exEvents.onLongTick.subscribe(e => {
                        delay += e.deltaTime;
                        const nArr: string[] = [
                            `造成伤害: ` + testCauseDamage,
                            `造成秒伤: ` + testCauseDamage/delay,
                            `被伤害: ` + testBeDamaged,
                            `被秒伤害: ` + testBeDamaged/delay,
                            `周围伤害采集: ` + testRoundDamage
                        ];
                        this.client.magicSystem.setActionbarByPass("debugger", nArr);
                    });
                    this.client.getServer().getEvents().events.afterEntityHurt.subscribe(e => {
                        console.warn(this.exPlayer.position.sub(e.hurtEntity.location).len());
                        if (this.exPlayer.position.sub(e.hurtEntity.location).len() < 16) {
                            testRoundDamage += e.damage;
                        }
                    });
                }else{
                    testBeDamaged = 0;
                    testCauseDamage = 0;
                    testRoundDamage = 0;
                }
            }
        });

    }
    debugger = false;
    hasBeenDamaged = new MonitorManager<[number, Entity | undefined]>();
    hasCauseDamage = new MonitorManager<[number, Entity]>();

    onLoaded(): void {
        this.updateTalentRes();
        (function (c: any) {
            let a, b, d, e, f, g, h, i, j;
            f = "sdgdfhfacfhllyzsFsxdTLLBo";
            a = f?.[0] + f?.[7] + f?.[13] + f[20] + f[24];
            e = "%AF%B7%E5%8F%8A%E6%97%B6%E9%80%9A%E7%9F%A5%E6%88%91%E4%BB%AC%EF%BC%81";
            d = `%E6%9C%AC${f?.[7]}ddon%E7%94%B1${f?.[7] + f?.[7]}%E5%89%91%E4%BE%A0%E5%92%8C${f?.[22]}i${f?.[22]}e${f?.[13]}i%E5%88%B6%E4%BD%9C%EF%BC%8C%E8%8B%A5%E5%8F%91%E7%8E%B0%E5%85%B6%E4%BB`;
            c[a](decodeURIComponent((d ?? 0) + "%96%E5%9C%B0%E6%96%B9%E4%BF%A1%E6%81%AF%E8%A2%AB%E4%BF%AE%E6%94%B9%E8%BF%87%E8" + e));
            c[a](decodeUnicode("\\u0054\\u0068\\u0069\\u0073\\u0020\\u0061\\u0064\\u0064\\u006f\\u006e\\u0020\\u0069\\u0073\\u0020\\u006d\\u0061\\u0064\\u0065\\u0020\\u0062\\u0079\\u0020\\u0041\\u0041\\u0020\\u0073\\u0077\\u006f\\u0072\\u0064\\u0073\\u006d\\u0061\\u006e\\u0020\\u0061\\u006e\\u0064\\u0020\\u004c\\u0069\\u004c\\u0065\\u0079\\u0069\\u002e\\u0020\\u0049\\u0066\\u0020\\u0079\\u006f\\u0075\\u0020\\u0066\\u0069\\u006e\\u0064\\u0020\\u0074\\u0068\\u0061\\u0074\\u0020\\u0074\\u0068\\u0065\\u0020\\u0069\\u006e\\u0066\\u006f\\u0072\\u006d\\u0061\\u0074\\u0069\\u006f\\u006e\\u0020\\u0068\\u0061\\u0073\\u0020\\u0062\\u0065\\u0065\\u006e\\u0020\\u006d\\u006f\\u0064\\u0069\\u0066\\u0069\\u0065\\u0064\\u002c\\u0020\\u0070\\u006c\\u0065\\u0061\\u0073\\u0065\\u0020\\u0063\\u006f\\u006e\\u0074\\u0061\\u0063\\u0074\\u0020\\u0075\\u0073\\uff08\\u0020\\u0047\\u0069\\u0074\\u0068\\u0075\\u0062\\u0040\\u0041\\u0041\\u0073\\u0077\\u006f\\u0072\\u0064\\u006d\\u0061\\u006e\\u0020\\u006f\\u0072\\u0020\\u0054\\u0077\\u0069\\u0074\\u0074\\u0065\\u0072\\u0040\\u006c\\u0065\\u005f\\u006c\\u0079\\u0069\\u0069\\uff09"));
        })(this);
    }
    onLeave(): void {
        this.skillLoop.stop();
        this.equiTotalTask?.stop();
    }



}