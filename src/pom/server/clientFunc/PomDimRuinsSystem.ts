import { MinecraftDimensionTypes, Block, EntityHurtAfterEvent, Entity, RawMessage, GameMode } from '@minecraft/server';
import GameController from "./GameController.js";
import RuinsLoaction from "../serverFunc/ruins/RuinsLoaction.js";
import { ExBlockArea } from '../../../modules/exmc/server/block/ExBlockArea.js';
import Vector3 from '../../../modules/exmc/utils/math/Vector3.js';
import PomDesertRuinBasicRule from '../serverFunc/ruins/desert/PomDesertRuinBasicRule.js';
import VarOnChangeListener from '../../../modules/exmc/utils/VarOnChangeListener.js';
import ExMessageAlert from '../../../modules/exmc/server/ui/ExMessageAlert.js';
import ExActionAlert from '../../../modules/exmc/server/ui/ExActionAlert.js';
import PomBossBarrier from '../entities/barrier/PomBossBarrier.js';
import { Objective } from '../../../modules/exmc/server/entity/ExScoresManager.js';
import { MinecraftBlockTypes, MinecraftEffectTypes } from '../../../modules/vanilla-data/lib/index.js';
import PomRuinCommon from '../serverFunc/ruins/PomRuinCommon.js';
import ExGame from '../../../modules/exmc/server/ExGame.js';

export default class PomDimRuinsSystem extends GameController {

    desertRuinRules = new PomDesertRuinBasicRule(this);
    isInRuinJudge: boolean = false;
    causeDamage = 0;
    deathTimes = 0;
    private _causeDamageShow = false;
    causeDamageMonitor: { (args_0: number, args_1: Entity): void; } | undefined;
    barrier?: PomBossBarrier;
    deathTimesListener?: (e: EntityHurtAfterEvent) => void;
    public get causeDamageShow() {
        return this._causeDamageShow;
    }
    public set causeDamageShow(value) {
        this._causeDamageShow = value;
        this.causeDamageListenner.upDate(value);
    }
    causeDamageType: Set<string> = new Set();


    causeDamageListenner = new VarOnChangeListener((n, last) => {
        if (n) {
            this.causeDamageMonitor = this.client.talentSystem.hasCauseDamage.addMonitor((d, e) => {
                if (this.causeDamageType.has(e.typeId)) {
                    this.causeDamage += d;
                }
            });
            this.deathTimesListener = (e: EntityHurtAfterEvent) => {
                if (this.exPlayer.health <= 0) {
                    this.barrier?.notifyDeathAdd();
                }
            }
            this.getEvents().exEvents.afterPlayerHurt.subscribe(this.deathTimesListener);
        } else {
            if (this.causeDamageMonitor) {
                this.client.talentSystem.hasCauseDamage.removeMonitor(this.causeDamageMonitor);
                this.causeDamageMonitor = undefined;
                this.client.magicSystem.deleteActionbarPass("hasCauseDamage");
            }
            if (this.deathTimesListener) {
                this.getEvents().exEvents.afterPlayerHurt.unsubscribe(this.deathTimesListener);
                this.deathTimesListener = undefined;
            }
            this.deathTimes = 0;
            this.causeDamage = 0;
            this.causeDamageType.clear();
        }
    }, false);


    backJudgeGenerate = (id: string, ruin: PomRuinCommon) => {
        return new VarOnChangeListener((v) => {
            if (v) {
                this.setTimeout(() => {
                    new ExActionAlert().title(this.lang.operation).body(this.lang.chooseYourOper)
                        .button(this.lang.summonBoss, () => {
                            let bag = this.exPlayer.getBag();
                            let itemMap = bag.countAllItems();
                            let useMap = {
                                "dec:blue_gem": 5,
                                "dec:red_gem": 5,
                                "dec:heart_egg": 1,
                                "dec:spurt_egg": 1,
                                "dec:ender_egg": 1,
                                "dec:magic_crystal": 1
                            }
                            if (this.exPlayer.gamemode == GameMode.creative || Array.from(Object.keys(useMap)).every(k => (useMap as any)[k] as number <= (itemMap.get(k) ?? 0))) {
                                let ent = this.getExDimension().spawnEntity(id,
                                    ruin.getBossSpawnArea()!.center()
                                );

                                ent?.dimension.playSound("game.boss.summon", ent.location, {
                                    "volume": 2
                                });
                                for (let k of Object.keys(useMap)) {
                                    bag.clearItem(k, (useMap as any)[k]);
                                }
                            } else {
                                let msg: RawMessage[] = [];
                                for (let k of Object.keys(useMap)) {
                                    let item = itemMap.get(k) ?? 0;
                                    let s = 'item.' + k + '.name';

                                    if ((useMap as any)[k] > item) {
                                        msg.push({
                                            text: "§c",
                                        })
                                    } else {
                                        msg.push({
                                            text: "§a",
                                        })
                                    }
                                    msg.push({
                                        translate: s,
                                    }, {
                                        text: ": " + item + "/" + (useMap as any)[k] + "\n"
                                    });
                                }
                                this.client.sayTo({
                                    rawtext: ([
                                        { text: this.lang.haveNoEnoughMaterial },
                                        { text: "§r\n" }
                                    ] as RawMessage[]).concat(msg)
                                })
                            }
                        })
                        .button(this.lang.backToOverworld, () => {
                            let v = this.data.dimBackPoint;
                            if (!v) {
                                v = new Vector3(0, 255, 0);
                            }
                            this.exPlayer.setPosition(v, this.getDimension(MinecraftDimensionTypes.overworld));
                        })
                        .button(this.lang.cancel, () => {

                        })
                        .show(this.player);
                }, 0);
            }
        }, false);
    }
    desertRuinBackJudge = new VarOnChangeListener((v) => {
        if (v) {
            new ExMessageAlert().title(this.lang.back).body(this.lang.whetherBackToOverworld)
                .button1(this.lang.no, () => {

                })
                .button2(this.lang.yes, () => {
                    let v = this.data.dimBackPoint;
                    if (!v) {
                        v = new Vector3(0, 255, 0);
                    }
                    this.exPlayer.setPosition(v, this.getDimension(MinecraftDimensionTypes.overworld));
                })
                .show(this.player);
        }
    }, false);
    stoneRuinBackJudge = this.backJudgeGenerate("wb:magic_stoneman", this.client.getServer().ruin_stoneBoss);
    caveRuinBackJudge = this.backJudgeGenerate("wb:headless_guard", this.client.getServer().ruin_caveBoss);
    ancientRuinBackJudge = this.backJudgeGenerate("wb:ancient_stone", this.client.getServer().ruin_ancientBoss);
    mindRuinBackJudge = this.backJudgeGenerate("wb:intentions_first", this.client.getServer().ruin_mindBoss);
    guardRuinBackJudge = this.backJudgeGenerate("wb:god_of_guard_zero", this.client.getServer().ruin_guardBoss);

    fogChange = new VarOnChangeListener((v, l) => {
        this.exPlayer.command.runAsync(`fog @s remove "ruin_fog"`);
    }, "");

    onJoin(): void {
        const tmpV = new Vector3();
        const tmpA = new Vector3();
        const tmpB = new Vector3();


        let warningRuinTimes = 0;

        this.getEvents().exEvents.onLongTick.subscribe(event => {
            if (event.currentTick % 4 !== 0) return;
            //1s 1 tick

            //脚下方块探测
            tmpV.set(this.player.location);
            tmpV.y -= 1;
            let block;
            try {
                block = this.getDimension().getBlock(tmpV.floor());
            } catch (err) { }
            if (block?.typeId === "wb:portal_desertboss") {
                //守卫遗迹判断
                this.data.dimBackPoint = new Vector3(this.player.location).add(3, 2, 3);
                this.client.cache.save();
                this.exPlayer.setPosition(ExBlockArea.randomPoint(this.client.getServer().ruin_desertBoss.getPlayerSpawnArea(), 4),
                    this.getDimension(MinecraftDimensionTypes.theEnd));
                //未生成遗迹判断
                if (((this.globalSettings.ruinsExsitsData >> RuinsLoaction.DESERT_RUIN_NUM) & 1) == 0) {
                    //generate
                    this.client.getServer().ruin_desertBoss.generate();
                    this.globalSettings.ruinsExsitsData = this.globalSettings.ruinsExsitsData | (1 << (RuinsLoaction.DESERT_RUIN_NUM));
                }
            } else if (block?.typeId === "wb:portal_stoneboss") {
                //石头遗迹判断
                this.data.dimBackPoint = new Vector3(this.player.location).add(3, 2, 3);
                this.client.cache.save();
                this.exPlayer.addEffect(MinecraftEffectTypes.Resistance, 20 * 10, 10, true);
                this.exPlayer.setPosition(ExBlockArea.randomPoint(this.client.getServer().ruin_stoneBoss.getPlayerSpawnArea(), 0),
                    this.getDimension(MinecraftDimensionTypes.theEnd));
                //未生成遗迹判断
                if (((this.globalSettings.ruinsExsitsData >> RuinsLoaction.STONE_RUIN_NUM) & 1) == 0) {
                    //generate
                    this.client.getServer().ruin_stoneBoss.generate();
                    this.globalSettings.ruinsExsitsData = this.globalSettings.ruinsExsitsData | (1 << (RuinsLoaction.STONE_RUIN_NUM));
                }
            } else if (block?.typeId === "wb:portal_caveboss") {
                //洞穴遗迹判断
                this.data.dimBackPoint = new Vector3(this.player.location).add(3, 2, 3);
                this.client.cache.save();
                this.exPlayer.addEffect(MinecraftEffectTypes.Resistance, 20 * 10, 10, true);
                this.exPlayer.setPosition(ExBlockArea.randomPoint(this.client.getServer().ruin_caveBoss.getPlayerSpawnArea(), 0),
                    this.getDimension(MinecraftDimensionTypes.theEnd));
                //未生成遗迹判断
                if (((this.globalSettings.ruinsExsitsData >> RuinsLoaction.CAVE_RUIN_NUM) & 1) == 0) {
                    //generate
                    this.client.getServer().ruin_caveBoss.generate();
                    this.globalSettings.ruinsExsitsData = this.globalSettings.ruinsExsitsData | (1 << (RuinsLoaction.CAVE_RUIN_NUM));
                }
            } else if (block?.typeId === "wb:portal_ancientboss") {
                //远古遗迹判断
                this.data.dimBackPoint = new Vector3(this.player.location).add(3, 2, 3);
                this.client.cache.save();
                this.exPlayer.addEffect(MinecraftEffectTypes.Resistance, 20 * 10, 10, true);
                this.exPlayer.setPosition(ExBlockArea.randomPoint(this.client.getServer().ruin_ancientBoss.getPlayerSpawnArea(), 0),
                    this.getDimension(MinecraftDimensionTypes.theEnd));
                //未生成遗迹判断
                if (((this.globalSettings.ruinsExsitsData >> RuinsLoaction.ANCIENT_RUIN_NUM) & 1) == 0) {
                    //generate
                    this.client.getServer().ruin_ancientBoss.generate();
                    this.globalSettings.ruinsExsitsData = this.globalSettings.ruinsExsitsData | (1 << (RuinsLoaction.ANCIENT_RUIN_NUM));
                }
            } else if (block?.typeId === "wb:portal_mindboss") {
                //内心遗迹判断
                this.data.dimBackPoint = new Vector3(this.player.location).add(3, 2, 3);
                this.client.cache.save();
                this.exPlayer.addEffect(MinecraftEffectTypes.Resistance, 20 * 10, 10, true);
                this.exPlayer.setPosition(ExBlockArea.randomPoint(this.client.getServer().ruin_mindBoss.getPlayerSpawnArea(), 0),
                    this.getDimension(MinecraftDimensionTypes.theEnd));
                //未生成遗迹判断
                if (((this.globalSettings.ruinsExsitsData >> RuinsLoaction.MIND_RUIN_NUM) & 1) == 0) {
                    //generate
                    this.client.getServer().ruin_mindBoss.generate();
                    this.globalSettings.ruinsExsitsData = this.globalSettings.ruinsExsitsData | (1 << (RuinsLoaction.MIND_RUIN_NUM));
                }
            } else if (block?.typeId === "wb:portal_guardboss") {
                //守卫遗迹判断
                this.data.dimBackPoint = new Vector3(this.player.location).add(3, 2, 3);
                this.client.cache.save();
                this.exPlayer.addEffect(MinecraftEffectTypes.Resistance, 20 * 10, 10, true);
                this.exPlayer.setPosition(ExBlockArea.randomPoint(this.client.getServer().ruin_guardBoss.getPlayerSpawnArea(), 0),
                    this.getDimension(MinecraftDimensionTypes.theEnd));
                //未生成遗迹判断
                if (((this.globalSettings.ruinsExsitsData >> RuinsLoaction.GUARD_RUIN_NUM) & 1) == 0) {
                    //generate
                    this.client.getServer().ruin_guardBoss.generate();
                    this.globalSettings.ruinsExsitsData = this.globalSettings.ruinsExsitsData | (1 << (RuinsLoaction.GUARD_RUIN_NUM));
                }
            }
            //所有遗迹返回判断
            if (!PomBossBarrier.isInBarrier(this.player)) {
                this.desertRuinBackJudge.upDate(
                    (this.client.getServer().ruin_desertBoss.getBossSpawnArea()?.contains(tmpV) ?? false)
                    && this.player.dimension.id === MinecraftDimensionTypes.theEnd
                );
                this.stoneRuinBackJudge.upDate(
                    (this.client.getServer().ruin_stoneBoss.getBossSpawnArea()?.contains(tmpV) ?? false)
                    && this.player.dimension.id === MinecraftDimensionTypes.theEnd
                );
                this.caveRuinBackJudge.upDate(
                    (this.client.getServer().ruin_caveBoss.getBossSpawnArea()?.contains(tmpV) ?? false)
                    && this.player.dimension.id === MinecraftDimensionTypes.theEnd
                );
                this.ancientRuinBackJudge.upDate(
                    (this.client.getServer().ruin_ancientBoss.getBossSpawnArea()?.contains(tmpV) ?? false)
                    && this.player.dimension.id === MinecraftDimensionTypes.theEnd
                );
                this.mindRuinBackJudge.upDate(
                    (this.client.getServer().ruin_mindBoss.getBossSpawnArea()?.contains(tmpV) ?? false)
                    && this.player.dimension.id === MinecraftDimensionTypes.theEnd
                );
                this.guardRuinBackJudge.upDate(
                    (this.client.getServer().ruin_guardBoss.getBossSpawnArea()?.contains(tmpV) ?? false)
                    && this.player.dimension.id === MinecraftDimensionTypes.theEnd
                );
            }
            let isInDesertRuin = false;
            let isInGuardRuin = false;
            let isInStoneRuin = false;
            let isInCaveRuin = false;
            let isInAncientRuin = false;
            let isInMindRuin = false;

            //处于守卫遗迹
            if (this.getDimension(MinecraftDimensionTypes.theEnd) === this.player.dimension
                && tmpV.x >= RuinsLoaction.DESERT_RUIN_LOCATION_START.x && tmpV.x <= RuinsLoaction.DESERT_RUIN_LOCATION_END.x
                && tmpV.z >= RuinsLoaction.DESERT_RUIN_LOCATION_START.z && tmpV.z <= RuinsLoaction.DESERT_RUIN_LOCATION_END.z) {
                if (tmpV.y < RuinsLoaction.DESERT_RUIN_LOCATION_START.y - 2) {
                    tmpV.y = RuinsLoaction.DESERT_RUIN_LOCATION_START.y + 4;
                    this.exPlayer.setPosition(tmpV);
                }

                if (3 <= tmpV.x % 16 && tmpV.x % 16 <= 13 && 3 <= tmpV.z % 16 && tmpV.z % 16 <= 13)
                    this.desertRuinRules.desertRuinScoreJudge.upDate(`${Math.floor((tmpV.x - RuinsLoaction.DESERT_RUIN_LOCATION_START.x) / 16)},${Math.floor((tmpV.y - RuinsLoaction.DESERT_RUIN_LOCATION_START.y) / 16)},${Math.floor((tmpV.z - RuinsLoaction.DESERT_RUIN_LOCATION_START.z) / 16)}`);
                isInDesertRuin = true;
                let show = [];
                show = this.desertRuinRules.getShowMap();
                this.client.magicSystem.setActionbarByPass("desertRuinMap", show);

                // this.exPlayer.command.run(`fog @s push wb:ruin_desert_boss "ruin_fog"`);

            }

            this.desertRuinRules.inRuinsListener.upDate(isInDesertRuin);


            //处于守卫遗迹
            if (this.getDimension(MinecraftDimensionTypes.theEnd) === this.player.dimension
                && tmpV.x >= RuinsLoaction.GUARD_RUIN_LOCATION_START.x && tmpV.x <= RuinsLoaction.GUARD_RUIN_LOCATION_END.x
                && tmpV.z >= RuinsLoaction.GUARD_RUIN_LOCATION_START.z && tmpV.z <= RuinsLoaction.GUARD_RUIN_LOCATION_END.z) {
                if (tmpV.y < RuinsLoaction.GUARD_RUIN_LOCATION_START.y - 2) {
                    tmpV.y = RuinsLoaction.GUARD_RUIN_LOCATION_START.y + 6;
                    this.exPlayer.setPosition(tmpV);
                }

                isInGuardRuin = true;
                this.exPlayer.command.runAsync(`fog @s push wb:ruin_guard_boss "ruin_fog"`);

            }

            //处于石头遗迹
            if (this.getDimension(MinecraftDimensionTypes.theEnd) === this.player.dimension
                && tmpV.x >= RuinsLoaction.STONE_RUIN_LOCATION_START.x && tmpV.x <= RuinsLoaction.STONE_RUIN_LOCATION_END.x
                && tmpV.z >= RuinsLoaction.STONE_RUIN_LOCATION_START.z && tmpV.z <= RuinsLoaction.STONE_RUIN_LOCATION_END.z) {
                if (tmpV.y < RuinsLoaction.STONE_RUIN_LOCATION_START.y - 2) {
                    tmpV.y = RuinsLoaction.STONE_RUIN_LOCATION_START.y + 6;
                    this.exPlayer.setPosition(tmpV);
                }

                isInStoneRuin = true;
                this.exPlayer.command.runAsync(`fog @s push wb:ruin_stone_boss "ruin_fog"`);

            }

            //处于洞穴遗迹
            if (this.getDimension(MinecraftDimensionTypes.theEnd) === this.player.dimension
                && tmpV.x >= RuinsLoaction.CAVE_RUIN_LOCATION_START.x && tmpV.x <= RuinsLoaction.CAVE_RUIN_LOCATION_END.x
                && tmpV.z >= RuinsLoaction.CAVE_RUIN_LOCATION_START.z && tmpV.z <= RuinsLoaction.CAVE_RUIN_LOCATION_END.z) {


                isInCaveRuin = true;
                this.exPlayer.command.runAsync(`fog @s push wb:ruin_cave_boss "ruin_fog"`);

            }
            //处于远古遗迹
            if (this.getDimension(MinecraftDimensionTypes.theEnd) === this.player.dimension
                && tmpV.x >= RuinsLoaction.ANCIENT_RUIN_LOCATION_START.x && tmpV.x <= RuinsLoaction.ANCIENT_RUIN_LOCATION_END.x
                && tmpV.z >= RuinsLoaction.ANCIENT_RUIN_LOCATION_START.z && tmpV.z <= RuinsLoaction.ANCIENT_RUIN_LOCATION_END.z) {


                isInAncientRuin = true;
                this.exPlayer.command.runAsync(`fog @s push wb:ruin_ancient_boss "ruin_fog"`);

            }
            //处于内心遗迹
            if (this.getDimension(MinecraftDimensionTypes.theEnd) === this.player.dimension
                && tmpV.x >= RuinsLoaction.MIND_RUIN_LOCATION_START.x && tmpV.x <= RuinsLoaction.MIND_RUIN_LOCATION_END.x
                && tmpV.z >= RuinsLoaction.MIND_RUIN_LOCATION_START.z && tmpV.z <= RuinsLoaction.MIND_RUIN_LOCATION_END.z) {


                isInMindRuin = true;
                //this.exPlayer.command.run(`fog @s push wb:ruin_mind_1_boss "ruin_fog"`);

            }

            if (this.causeDamageShow) {
                let show: string[] = this.client.magicSystem.registActionbarPass("hasCauseDamage");
                show.push(`${this.lang.hasDied} ${this.deathTimes} ${this.lang.times}`);
                show.push(`${this.lang.causeDamage} ${(this.causeDamage).toFixed(2)} ${this.lang.points}`);
            }


            //设置游戏模式
            this.isInRuinJudge = isInDesertRuin || isInStoneRuin || isInCaveRuin || isInAncientRuin || isInMindRuin || isInGuardRuin
            if (this.getDimension().id === MinecraftDimensionTypes.theEnd) {
                let loc = this.player.location;
                if ((!this.isInRuinJudge) && (15000 <= loc.x && loc.x <= 20000 && loc.z >= 15000 && loc.z <= 20000)) {
                    if (warningRuinTimes == 5) {
                        this.sayTo(this.lang.unProtectedAreaWarning);
                        warningRuinTimes = 0;
                    }
                    warningRuinTimes += 1;
                } else {
                    warningRuinTimes = 0;
                }
            }

            this.fogChange.upDate(`${isInDesertRuin}-${isInStoneRuin}-${isInCaveRuin}-${isInAncientRuin}-${isInMindRuin}-${isInGuardRuin}`);

            //let mode = this.exPlayer.getGameMode();
            // if (this.isInRuinJudge && mode === GameMode.survival) {
            //     this.exPlayer.setGameMode(GameMode.adventure);
            // } else if (!this.isInRuinJudge && mode === GameMode.adventure && this.data.dimBackMode === 0) {
            //     this.exPlayer.setGameMode(GameMode.survival);
            // } else if (!this.isInRuinJudge && (mode !== GameMode.adventure)) {
            //     this.data.dimBackMode = 0;
            // } else if (!this.isInRuinJudge && (mode === GameMode.adventure)) {
            //     this.data.dimBackMode = 2;
            // }
            // if(this.isInRuinJudge){
            //     if(event.currentTick % 40 === 0){
            //         let scores = this.exPlayer.getScoresManager();
            //         scores.setScoreAsync(this.i_damp,13);
            //         scores.setScoreAsync(this.i_inviolable,13);
            //         scores.setScoreAsync(this.i_soft,13);
            //     }
            // }
        });



        // this.getEvents().exEvents.itemOnHandChange.subscribe((e) => {
        //     this.sayTo(e.afterItem?.typeId + "");
        // });
        this.getEvents().exEvents.beforeOnceItemUseOn.subscribe(e => {
            let block = e.block;
            if (e.itemStack.typeId === "wb:start_key") {
                ExGame.runTimeout(() => {
                    if (block?.typeId === "wb:block_magic_equipment") {
                        let p = this.client.getServer().portal_desertBoss;
                        let v2 = new Vector3(e.block).add(2, 2, 2);
                        let v1 = new Vector3(e.block).sub(2, 0, 2);
                        let m = p.setArea(new ExBlockArea(v1, v2, true))
                            .setDimension(this.getDimension(MinecraftDimensionTypes.overworld))
                            .find();
                        if (m) {
                            this.getDimension().playSound("game.portal.active", e.block, {
                                "volume": 1.2
                            });
                            p.clone().analysis({
                                X: MinecraftBlockTypes.Sandstone,
                                W: "wb:portal_desertboss",
                                Y: "wb:portal_desertboss",
                                A: MinecraftBlockTypes.Air,
                                S: MinecraftBlockTypes.SandstoneSlab,
                                C: MinecraftBlockTypes.CobblestoneWall
                            })
                                .putStructure(m);
                            const parLoc = new Vector3(e.block).add(0.5, 0.5, 0.5);
                            this.getExDimension().spawnParticle("wb:portal_desertboss_par1", parLoc);
                            this.getExDimension().spawnParticle("wb:portal_desertboss_par2", parLoc);
                        } else {
                            p = this.client.getServer().portal_guardBoss;
                            v1 = new Vector3(e.block).sub(2, 0, 2);
                            v2 = new Vector3(e.block).add(2, 2, 2);
                            m = p.setArea(new ExBlockArea(v1, v2, true))
                                .setDimension(this.getDimension(MinecraftDimensionTypes.overworld))
                                .find();
                            if (m) {
                                this.getDimension().playSound("game.portal.active", e.block, {
                                    "volume": 1.2
                                });
                                p.clone().analysis({
                                    X: MinecraftBlockTypes.Sandstone,
                                    W: "wb:portal_guardboss",
                                    Y: "wb:portal_guardboss",
                                    A: MinecraftBlockTypes.Air,
                                    S: MinecraftBlockTypes.SandstoneSlab,
                                    C: MinecraftBlockTypes.Air
                                })
                                    .putStructure(m);
                                const parLoc = new Vector3(e.block).add(0.5, 0.5, 0.5);
                                this.getExDimension().spawnParticle("wb:portal_desertboss_par1", parLoc);
                                this.getExDimension().spawnParticle("wb:portal_desertboss_par2", parLoc);
                            }
                        }
                    } else if (block?.typeId === "wb:block_energy_seal") {
                        const v2 = new Vector3(e.block).add(2, 1, 2);
                        const v1 = new Vector3(e.block).sub(2, 0, 2);

                        let p = this.client.getServer().portal_stoneBoss;
                        let m = p.setArea(new ExBlockArea(v1, v2, true))
                            .setDimension(this.getDimension(MinecraftDimensionTypes.overworld))
                            .find();
                        if (m) {
                            this.getDimension().playSound("game.portal.active", e.block, {
                                "volume": 1.2
                            });
                            p.clone().analysis({
                                X: MinecraftBlockTypes.Sandstone,
                                W: "wb:portal_stoneboss",
                                Y: "wb:portal_stoneboss",
                                S: MinecraftBlockTypes.CobblestoneWall,
                                A: MinecraftBlockTypes.Air,
                                B: MinecraftBlockTypes.StoneBricks
                            })
                                .putStructure(m);
                        }
                    } else if (block?.typeId === "wb:block_energy_boundary") {
                        const v2 = new Vector3(e.block).add(2, 1, 2);
                        const v1 = new Vector3(e.block).sub(2, 0, 2);
                        let p = this.client.getServer().portal_caveBoss;
                        let m = p.setArea(new ExBlockArea(v1, v2, true))
                            .setDimension(this.getDimension(MinecraftDimensionTypes.overworld))
                            .find();
                        if (m) {
                            this.getDimension().playSound("game.portal.active", e.block, {
                                "volume": 1.2
                            });
                            p.clone().analysis({
                                X: MinecraftBlockTypes.DeepslateTiles,
                                W: "wb:portal_caveboss",
                                Y: "wb:portal_caveboss",
                                S: MinecraftBlockTypes.Lantern,
                                A: MinecraftBlockTypes.Air
                            })
                                .putStructure(m);
                        }
                    } else if (block?.typeId === "wb:block_magic_ink") {
                        const v2 = new Vector3(e.block).add(2, 1, 2);
                        const v1 = new Vector3(e.block).sub(2, 0, 2);
                        let p = this.client.getServer().portal_ancientBoss;
                        let m = p.setArea(new ExBlockArea(v1, v2, true))
                            .setDimension(this.getDimension(MinecraftDimensionTypes.overworld))
                            .find();
                        if (m) {
                            this.getDimension().playSound("game.portal.active", e.block, {
                                "volume": 1.2
                            });
                            p.clone().analysis({
                                X: MinecraftBlockTypes.ChiseledDeepslate,
                                W: "wb:portal_ancientboss",
                                Y: "wb:portal_ancientboss",
                                S: MinecraftBlockTypes.VerdantFroglight,
                                A: MinecraftBlockTypes.Air,
                                B: MinecraftBlockTypes.MossyCobblestone
                            })
                                .putStructure(m);
                        }

                    } else if (block?.typeId === "wb:block_senior_equipment") {
                        const v2 = new Vector3(e.block).add(2, 1, 2);
                        const v1 = new Vector3(e.block).sub(2, 0, 2);
                        let p = this.client.getServer().portal_mindBoss;
                        let m = p.setArea(new ExBlockArea(v1, v2, true))
                            .setDimension(this.getDimension(MinecraftDimensionTypes.overworld))
                            .find();
                        if (m) {
                            this.getDimension().playSound("game.portal.active", e.block, {
                                "volume": 1.2
                            });
                            p.clone().analysis({
                                X: "wb:block_magic_equipment",
                                W: "wb:portal_mindboss",
                                Y: "wb:portal_mindboss",
                                S: "wb:block_magic_barrier",
                                A: MinecraftBlockTypes.Air
                            })
                                .putStructure(m);
                        }
                    }
                });
                //遗迹传送门激活

            }
        });
    }


    onLoad(): void {
        
    }

    onLeave(): void {

    }

}