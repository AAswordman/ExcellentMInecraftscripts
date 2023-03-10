import { BlockLocation, MinecraftBlockTypes, MinecraftDimensionTypes, Block, MinecraftEntityTypes, GameMode, Seat, EntityHurtEvent, MinecraftEffectTypes } from '@minecraft/server';
import ExBlockStructureNormal from "../../../modules/exmc/server/block/structure/ExBlockStructureNormal.js";
import GameController from "./GameController.js";
import RuinsLoaction from "./ruins/RuinsLoaction.js";
import { ExBlockArea } from '../../../modules/exmc/server/block/ExBlockArea.js';
import Vector3 from '../../../modules/exmc/math/Vector3.js';
import ExGameVector3 from '../../../modules/exmc/server/math/ExGameVector3.js';
import PomDesertRuinBasicRule from './ruins/desert/PomDesertRuinBasicRule.js';
import VarOnChangeListener from '../../../modules/exmc/utils/VarOnChangeListener.js';
import ExMessageAlert from '../../../modules/exmc/server/ui/ExMessageAlert.js';
import ExActionAlert from '../../../modules/exmc/server/ui/ExActionAlert.js';
import PomBossBarrier from './barrier/PomBossBarrier.js';
import { Objective } from '../../../modules/exmc/server/entity/ExScoresManager.js';

export default class PomDimRuinsSystem extends GameController {
    i_inviolable = new Objective("i_inviolable");
    i_damp = new Objective("i_damp");
    i_soft = new Objective("i_soft");

    desertRuinRules = new PomDesertRuinBasicRule(this);
    isInRuinJudge: boolean = false;
    causeDamage = 0;
    deathTimes = 0;
    private _causeDamageShow = false;
    causeDamageMonitor: any;
    barrier?: PomBossBarrier;
    deathTimesListener?: (e: EntityHurtEvent) => void;
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
            this.deathTimesListener = (e: EntityHurtEvent) => {
                // console.warn("add");
                // console.warn(this.exPlayer.getHealth());
                if (this.exPlayer.getHealth() <= 0) {
                    this.barrier?.notifyDeathAdd();
                }
            }
            this.getEvents().exEvents.playerHurt.subscribe(this.deathTimesListener);
        } else {
            if (this.causeDamageMonitor) {
                this.client.talentSystem.hasCauseDamage.removeMonitor(this.causeDamageMonitor);
                this.causeDamageMonitor = undefined;
                this.client.magicSystem.deleteActionbarPass("hasCauseDamage");
            }
            if (this.deathTimesListener) {
                this.getEvents().exEvents.playerHurt.unsubscribe(this.deathTimesListener);
                this.deathTimesListener = undefined;
            }
            this.deathTimes = 0;
            this.causeDamage = 0;
            this.causeDamageType.clear();
        }
    }, false);


    desertRuinBackJudge = new VarOnChangeListener((v) => {
        if (v) {
            new ExMessageAlert().title("??????").body("??????????????????????")
                .button1("???", () => {

                })
                .button2("???", () => {
                    let v = this.data.dimBackPoint;
                    if (!v) {
                        v = new Vector3(0, 255, 0);
                    }
                    this.exPlayer.setPosition(v, this.getDimension(MinecraftDimensionTypes.overworld));
                })
                .show(this.player);
        }
    }, false);
    stoneRuinBackJudge = new VarOnChangeListener((v) => {
        if (v) {
            new ExActionAlert().title("??????").body("??????????????????")
                .button("??????boss", () => {
                    this.getExDimension().spawnEntity("wb:magic_stoneman",
                        this.client.getServer().ruin_stoneBoss.getBossSpawnArea()!.center()
                    );
                })
                .button("???????????????", () => {
                    let v = this.data.dimBackPoint;
                    if (!v) {
                        v = new Vector3(0, 255, 0);
                    }
                    this.exPlayer.setPosition(v, this.getDimension(MinecraftDimensionTypes.overworld));
                })
                .button("??????", () => {

                })
                .show(this.player);
        }
    }, false);
    caveRuinBackJudge = new VarOnChangeListener((v) => {
        if (v) {
            new ExActionAlert().title("??????").body("??????????????????")
                .button("??????boss", () => {
                    this.getExDimension().spawnEntity("wb:headless_guard",
                        this.client.getServer().ruin_caveBoss.getBossSpawnArea()!.center()
                    );
                })
                .button("???????????????", () => {
                    let v = this.data.dimBackPoint;
                    if (!v) {
                        v = new Vector3(0, 255, 0);
                    }
                    this.exPlayer.setPosition(v, this.getDimension(MinecraftDimensionTypes.overworld));
                })
                .button("??????", () => {

                })
                .show(this.player);
        }
    }, false);
    ancientRuinBackJudge = new VarOnChangeListener((v) => {
        if (v) {
            new ExActionAlert().title("??????").body("??????????????????")
                .button("??????boss", () => {
                    this.getExDimension().spawnEntity("wb:ancient_stone",
                        this.client.getServer().ruin_ancientBoss.getBossSpawnArea()!.center()
                    );
                })
                .button("???????????????", () => {
                    let v = this.data.dimBackPoint;
                    if (!v) {
                        v = new Vector3(0, 255, 0);
                    }
                    this.exPlayer.setPosition(v, this.getDimension(MinecraftDimensionTypes.overworld));
                })
                .button("??????", () => {

                })
                .show(this.player);
        }
    }, false);
    mindRuinBackJudge = new VarOnChangeListener((v) => {
        if (v) {
            new ExActionAlert().title("??????").body("??????????????????")
                .button("??????boss", () => {
                    this.getExDimension().spawnEntity("wb:intentions_first",
                        this.client.getServer().ruin_mindBoss.getBossSpawnArea()!.center()
                    );
                })
                .button("???????????????", () => {
                    let v = this.data.dimBackPoint;
                    if (!v) {
                        v = new Vector3(0, 255, 0);
                    }
                    this.exPlayer.setPosition(v, this.getDimension(MinecraftDimensionTypes.overworld));
                })
                .button("??????", () => {

                })
                .show(this.player);
        }
    }, false);

    fogChange = new VarOnChangeListener((v, l) => {
        this.exPlayer.command.run(`fog @s remove "ruin_fog"`);
    }, "");

    onJoin(): void {
        const tmpV = new Vector3();
        const tmpA = new Vector3();
        const tmpB = new Vector3();

        this.getEvents().exEvents.onLongTick.subscribe(event => {
            if (event.currentTick % 4 !== 0) return;
            //1s 1 tick

            //??????????????????
            tmpV.set(this.player.location);
            let loc = ExGameVector3.getBlockLocation(tmpV);
            loc.y -= 1;
            let block;
            try {
                block = this.getDimension().getBlock(loc);
            } catch (e) { }
            if (block?.typeId === "wb:portal_desertboss") {
                //??????????????????
                this.data.dimBackPoint = new Vector3(this.player.location).add(3, 2, 3);
                this.client.cache.save();
                this.exPlayer.setPosition(ExBlockArea.randomPoint(this.client.getServer().ruin_desertBoss.getPlayerSpawnArea(), 4),
                    this.getDimension(MinecraftDimensionTypes.theEnd));
                //?????????????????????
                if (((this.globalSettings.ruinsExsitsData >> RuinsLoaction.DESERT_RUIN_NUM) & 1) == 0) {
                    //generate
                    this.client.getServer().ruin_desertBoss.generate();
                    this.globalSettings.ruinsExsitsData = this.globalSettings.ruinsExsitsData | (1 << (RuinsLoaction.DESERT_RUIN_NUM));
                }
            } else if (block?.typeId === "wb:portal_stoneboss") {
                //??????????????????
                this.data.dimBackPoint = new Vector3(this.player.location).add(3, 2, 3);
                this.client.cache.save();
                this.player.addEffect(MinecraftEffectTypes.resistance, 20 * 10, 10, true);
                this.exPlayer.setPosition(ExBlockArea.randomPoint(this.client.getServer().ruin_stoneBoss.getPlayerSpawnArea(), 0),
                    this.getDimension(MinecraftDimensionTypes.theEnd));
                //?????????????????????
                if (((this.globalSettings.ruinsExsitsData >> RuinsLoaction.STONE_RUIN_NUM) & 1) == 0) {
                    //generate
                    this.client.getServer().ruin_stoneBoss.generate();
                    this.globalSettings.ruinsExsitsData = this.globalSettings.ruinsExsitsData | (1 << (RuinsLoaction.STONE_RUIN_NUM));
                }
            } else if (block?.typeId === "wb:portal_caveboss") {
                //??????????????????
                this.data.dimBackPoint = new Vector3(this.player.location).add(3, 2, 3);
                this.client.cache.save();
                this.player.addEffect(MinecraftEffectTypes.resistance, 20 * 10, 10, true);
                this.exPlayer.setPosition(ExBlockArea.randomPoint(this.client.getServer().ruin_caveBoss.getPlayerSpawnArea(), 0),
                    this.getDimension(MinecraftDimensionTypes.theEnd));
                //?????????????????????
                if (((this.globalSettings.ruinsExsitsData >> RuinsLoaction.CAVE_RUIN_NUM) & 1) == 0) {
                    //generate
                    this.client.getServer().ruin_caveBoss.generate();
                    this.globalSettings.ruinsExsitsData = this.globalSettings.ruinsExsitsData | (1 << (RuinsLoaction.CAVE_RUIN_NUM));
                }
            } else if (block?.typeId === "wb:portal_ancientboss") {
                //??????????????????
                this.data.dimBackPoint = new Vector3(this.player.location).add(3, 2, 3);
                this.client.cache.save();
                this.player.addEffect(MinecraftEffectTypes.resistance, 20 * 10, 10, true);
                this.exPlayer.setPosition(ExBlockArea.randomPoint(this.client.getServer().ruin_ancientBoss.getPlayerSpawnArea(), 0),
                    this.getDimension(MinecraftDimensionTypes.theEnd));
                //?????????????????????
                if (((this.globalSettings.ruinsExsitsData >> RuinsLoaction.ANCIENT_RUIN_NUM) & 1) == 0) {
                    //generate
                    this.client.getServer().ruin_ancientBoss.generate();
                    this.globalSettings.ruinsExsitsData = this.globalSettings.ruinsExsitsData | (1 << (RuinsLoaction.ANCIENT_RUIN_NUM));
                }
            } else if (block?.typeId === "wb:portal_mindboss") {
                //??????????????????
                this.data.dimBackPoint = new Vector3(this.player.location).add(3, 2, 3);
                this.client.cache.save();
                this.player.addEffect(MinecraftEffectTypes.resistance, 20 * 10, 10, true);
                this.exPlayer.setPosition(ExBlockArea.randomPoint(this.client.getServer().ruin_mindBoss.getPlayerSpawnArea(), 0),
                    this.getDimension(MinecraftDimensionTypes.theEnd));
                //?????????????????????
                if (((this.globalSettings.ruinsExsitsData >> RuinsLoaction.MIND_RUIN_NUM) & 1) == 0) {
                    //generate
                    this.client.getServer().ruin_mindBoss.generate();
                    this.globalSettings.ruinsExsitsData = this.globalSettings.ruinsExsitsData | (1 << (RuinsLoaction.MIND_RUIN_NUM));
                }
            }
            //????????????????????????
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
            }
            let isInGuardRuin = false;
            let isInStoneRuin = false;
            let isInCaveRuin = false;
            let isInAncientRuin = false;
            let isInMindRuin = false;

            //??????????????????
            if (this.getDimension(MinecraftDimensionTypes.theEnd) === this.player.dimension
                && tmpV.x >= RuinsLoaction.DESERT_RUIN_LOCATION_START.x && tmpV.x <= RuinsLoaction.DESERT_RUIN_LOCATION_END.x
                && tmpV.z >= RuinsLoaction.DESERT_RUIN_LOCATION_START.z && tmpV.z <= RuinsLoaction.DESERT_RUIN_LOCATION_END.z) {
                if (tmpV.y < RuinsLoaction.DESERT_RUIN_LOCATION_START.y - 2) {
                    tmpV.y = RuinsLoaction.DESERT_RUIN_LOCATION_START.y + 4;
                    this.exPlayer.setPosition(tmpV);
                }

                if (3 <= tmpV.x % 16 && tmpV.x % 16 <= 13 && 3 <= tmpV.z % 16 && tmpV.z % 16 <= 13)
                    this.desertRuinRules.desertRuinScoreJudge.upDate(`${Math.floor((tmpV.x - RuinsLoaction.DESERT_RUIN_LOCATION_START.x) / 16)},${Math.floor((tmpV.y - RuinsLoaction.DESERT_RUIN_LOCATION_START.y) / 16)},${Math.floor((tmpV.z - RuinsLoaction.DESERT_RUIN_LOCATION_START.z) / 16)}`);
                isInGuardRuin = true;
                let show = [];
                show = this.desertRuinRules.getShowMap();
                this.client.magicSystem.setActionbarByPass("desertRuinMap", show);
            }

            this.desertRuinRules.inRuinsListener.upDate(isInGuardRuin);


            //??????????????????
            if (this.getDimension(MinecraftDimensionTypes.theEnd) === this.player.dimension
                && tmpV.x >= RuinsLoaction.STONE_RUIN_LOCATION_START.x && tmpV.x <= RuinsLoaction.STONE_RUIN_LOCATION_END.x
                && tmpV.z >= RuinsLoaction.STONE_RUIN_LOCATION_START.z && tmpV.z <= RuinsLoaction.STONE_RUIN_LOCATION_END.z) {
                if (tmpV.y < RuinsLoaction.STONE_RUIN_LOCATION_START.y - 2) {
                    tmpV.y = RuinsLoaction.STONE_RUIN_LOCATION_START.y + 6;
                    this.exPlayer.setPosition(tmpV);
                }

                isInStoneRuin = true;
                this.exPlayer.command.run(`fog @s push wb:ruin_stone_boss "ruin_fog"`);

            }

            //??????????????????
            if (this.getDimension(MinecraftDimensionTypes.theEnd) === this.player.dimension
                && tmpV.x >= RuinsLoaction.CAVE_RUIN_LOCATION_START.x && tmpV.x <= RuinsLoaction.CAVE_RUIN_LOCATION_END.x
                && tmpV.z >= RuinsLoaction.CAVE_RUIN_LOCATION_START.z && tmpV.z <= RuinsLoaction.CAVE_RUIN_LOCATION_END.z) {


                isInCaveRuin = true;
                this.exPlayer.command.run(`fog @s push wb:ruin_cave_boss "ruin_fog"`);

            }
            //??????????????????
            if (this.getDimension(MinecraftDimensionTypes.theEnd) === this.player.dimension
                && tmpV.x >= RuinsLoaction.ANCIENT_RUIN_LOCATION_START.x && tmpV.x <= RuinsLoaction.ANCIENT_RUIN_LOCATION_END.x
                && tmpV.z >= RuinsLoaction.ANCIENT_RUIN_LOCATION_START.z && tmpV.z <= RuinsLoaction.ANCIENT_RUIN_LOCATION_END.z) {


                isInAncientRuin = true;
                this.exPlayer.command.run(`fog @s push wb:ruin_ancient_boss "ruin_fog"`);

            }
            //??????????????????
            if (this.getDimension(MinecraftDimensionTypes.theEnd) === this.player.dimension
                && tmpV.x >= RuinsLoaction.MIND_RUIN_LOCATION_START.x && tmpV.x <= RuinsLoaction.MIND_RUIN_LOCATION_END.x
                && tmpV.z >= RuinsLoaction.MIND_RUIN_LOCATION_START.z && tmpV.z <= RuinsLoaction.MIND_RUIN_LOCATION_END.z) {


                isInMindRuin = true;
                //this.exPlayer.command.run(`fog @s push wb:ruin_mind_1_boss "ruin_fog"`);

            }
            if (this.causeDamageShow) {
                let show: string[] = this.client.magicSystem.registActionbarPass("hasCauseDamage");
                show.push(`????????????: ${this.deathTimes} ???`);
                show.push(`????????????: ${this.causeDamage} ???`);
            }
            this.client.magicSystem.additionHealthShow = isInGuardRuin;


            //??????????????????
            this.isInRuinJudge = isInGuardRuin || isInStoneRuin || isInCaveRuin || isInAncientRuin || isInMindRuin;
            this.fogChange.upDate(`${isInGuardRuin}-${isInStoneRuin}-${isInCaveRuin}-${isInAncientRuin}-${isInMindRuin}`);

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
        this.getEvents().exEvents.onceItemUseOn.subscribe(e => {
            let block: Block | undefined;
            try {
                block = this.getDimension().getBlock(e.blockLocation);
            } catch (e) { }

            if (e.item.typeId === "wb:start_key") {
                //?????????????????????
                if (block?.typeId === "wb:block_magic_equipment") {
                    let p = this.client.getServer().portal_desertBoss;
                    const v2 = new Vector3(e.blockLocation).add(2, 2, 2);
                    const v1 = new Vector3(e.blockLocation).sub(2, 0, 2);
                    let m = p.setArea(new ExBlockArea(v1, v2, true))
                        .setDimension(this.getDimension(MinecraftDimensionTypes.overworld))
                        .find();
                    if (m) {
                        p.clone().analysis({
                            X: MinecraftBlockTypes.sandstone.id,
                            W: "wb:portal_desertboss",
                            Y: "wb:portal_desertboss",
                            A: MinecraftBlockTypes.air.id,
                            S: MinecraftBlockTypes.stoneBlockSlab2.id,
                            C: MinecraftBlockTypes.cobblestoneWall.id
                        })
                            .putStructure(m);
                        const parLoc = new Vector3(e.blockLocation).add(0.5, 0.5, 0.5);
                        this.getExDimension().spawnParticle("wb:portal_desertboss_par1", parLoc);
                        this.getExDimension().spawnParticle("wb:portal_desertboss_par2", parLoc);
                    }
                } else
                    if (block?.typeId === "wb:block_energy_seal") {
                        const v2 = new Vector3(e.blockLocation).add(2, 1, 2);
                        const v1 = new Vector3(e.blockLocation).sub(2, 0, 2);
                        let p = this.client.getServer().portal_stoneBoss;
                        let m = p.setArea(new ExBlockArea(v1, v2, true))
                            .setDimension(this.getDimension(MinecraftDimensionTypes.overworld))
                            .find();
                        if (m) {
                            p.clone().analysis({
                                X: MinecraftBlockTypes.sandstone.id,
                                W: "wb:portal_stoneboss",
                                Y: "wb:portal_stoneboss",
                                S: MinecraftBlockTypes.cobblestoneWall.id,
                                A: MinecraftBlockTypes.air.id,
                                B: MinecraftBlockTypes.stonebrick.id
                            })
                                .putStructure(m);
                        }
                    } else
                        if (block?.typeId === "wb:block_energy_boundary") {
                            const v2 = new Vector3(e.blockLocation).add(2, 1, 2);
                            const v1 = new Vector3(e.blockLocation).sub(2, 0, 2);
                            let p = this.client.getServer().portal_caveBoss;
                            let m = p.setArea(new ExBlockArea(v1, v2, true))
                                .setDimension(this.getDimension(MinecraftDimensionTypes.overworld))
                                .find();
                            if (m) {
                                p.clone().analysis({
                                    X: MinecraftBlockTypes.deepslateTiles.id,
                                    W: "wb:portal_caveboss",
                                    Y: "wb:portal_caveboss",
                                    S: MinecraftBlockTypes.lantern.id,
                                    A: MinecraftBlockTypes.air.id
                                })
                                    .putStructure(m);
                            }
                        } else
                            if (block?.typeId === "wb:block_magic_ink") {
                                const v2 = new Vector3(e.blockLocation).add(2, 1, 2);
                                const v1 = new Vector3(e.blockLocation).sub(2, 0, 2);
                                let p = this.client.getServer().portal_ancientBoss;
                                let m = p.setArea(new ExBlockArea(v1, v2, true))
                                    .setDimension(this.getDimension(MinecraftDimensionTypes.overworld))
                                    .find();
                                if (m) {
                                    p.clone().analysis({
                                        X: MinecraftBlockTypes.chiseledDeepslate.id,
                                        W: "wb:portal_ancientboss",
                                        Y: "wb:portal_ancientboss",
                                        S: MinecraftBlockTypes.verdantFroglight.id,
                                        A: MinecraftBlockTypes.air.id,
                                        B: MinecraftBlockTypes.mossyCobblestone.id
                                    })
                                        .putStructure(m);
                                }

                            } else
                                if (block?.typeId === "wb:block_senior_equipment") {
                                    const v2 = new Vector3(e.blockLocation).add(2, 1, 2);
                                    const v1 = new Vector3(e.blockLocation).sub(2, 0, 2);
                                    let p = this.client.getServer().portal_mindBoss;
                                    let m = p.setArea(new ExBlockArea(v1, v2, true))
                                        .setDimension(this.getDimension(MinecraftDimensionTypes.overworld))
                                        .find();
                                    if (m) {

                                        p.clone().analysis({
                                            X: "wb:block_magic_equipment",
                                            W: "wb:portal_mindboss",
                                            Y: "wb:portal_mindboss",
                                            S: "wb:block_magic_barrier",
                                            A: MinecraftBlockTypes.air.id
                                        })
                                            .putStructure(m);
                                    }
                                }
            }
        });

    }


    onLoaded(): void {

    }

    onLeave(): void {

    }

}