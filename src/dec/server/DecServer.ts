import { Player, MinecraftDimensionTypes, Entity, ItemStack, MinecraftItemTypes, Effect, world } from '@minecraft/server';
import ExConfig from "../../modules/exmc/ExConfig.js";
import ExGameClient from "../../modules/exmc/server/ExGameClient.js";
import DecClient from "./DecClient.js";
import ExPlayer from '../../modules/exmc/server/entity/ExPlayer.js';
import { Objective } from '../../modules/exmc/server/entity/ExScoresManager.js';
import ExEntity from '../../modules/exmc/server/entity/ExEntity.js';
import commandAnalysis from '../../modules/exmc/utils/commandAnalysis.js';
import format from '../../modules/exmc/utils/format.js';
import ExGameServer from '../../modules/exmc/server/ExGameServer.js';
import DecGlobal from './DecGlobal.js';
import { ArmorData, ArmorPlayerDec, ArmorPlayerPom } from './items/ArmorData.js';
import Vector3 from '../../modules/exmc/math/Vector3.js';
import { to } from '../../modules/exmc/server/ExErrorQueue.js';
import { DecEverlastingWinterGhastBoss1, DecEverlastingWinterGhastBoss2 } from './entities/DecEverlastingWinterGhastBoss.js';
import { DecCommonBossLastStage } from './entities/DecCommonBossLastStage.js';
import VarOnChangeListener from '../../modules/exmc/utils/VarOnChangeListener.js';
import ExEnvironment from '../../modules/exmc/server/env/ExEnvironment.js';
import { DecHostOfDeepBoss1, DecHostOfDeepBoss2, DecHostOfDeepBoss3 } from './entities/DecHostOfDeepBoss.js';
import GZIPUtil from '../../modules/exmc/utils/GZIPUtil.js';
import IStructureSettle from './data/structure/IStructureSettle.js';
import IStructureDriver from './data/structure/IStructureDriver.js';
import ExTaskRunner from '../../modules/exmc/server/ExTaskRunner.js';
import { decTreeStructure } from './data/structure/decTreeStructure.js';
import { MinecraftEffectTypes } from '../../modules/vanilla-data/lib/index.js';
import DecNukeController from './entities/DecNukeController.js';
import ExNullEntity from '../../modules/exmc/server/entity/ExNullEntity.js';
import GlobalScoreBoardCache from '../../modules/exmc/server/storage/cache/GlobalScoreBoardCache.js';
import MathUtil from '../../modules/exmc/math/MathUtil.js';


export default class DecServer extends ExGameServer {
    i_inviolable: Objective;
    i_damp: Objective;
    i_soft: Objective;
    i_heavy: Objective;
    bullet_type: Objective;

    nightEventListener: VarOnChangeListener<boolean>;
    tmpV = new Vector3();
    globalscores = new GlobalScoreBoardCache(new Objective("global"), false);

    //test
    compress = [""];

    constructor(config: ExConfig) {
        super(config);

        this.i_inviolable = new Objective("i_inviolable").create("i_inviolable");
        this.i_damp = new Objective("i_damp").create("i_damp");

        this.i_soft = new Objective("i_soft").create("i_soft");
        this.i_heavy = new Objective("i_heavy").create("i_heavy");
        this.bullet_type = new Objective("bullet_type").create("bullet_type");
        //new Objective("harmless").create("harmless");
        this.nightEventListener = new VarOnChangeListener(e => {
            if (e) {
                // is night
                if (this.globalscores.getNumber("NightRandom") === 0) {
                    this.globalscores.setNumber("NightRandom", MathUtil.randomInteger(1, 100));
                    this.globalscores.setNumber("IsDay", 0);
                    this.globalscores.setNumber("IsNight", 1);
                }
            } else {
                this.globalscores.setNumber("NightRandom", 0);
                this.globalscores.setNumber("IsDay", 1);
                this.globalscores.setNumber("IsNight", 0);
                this.getExDimension(MinecraftDimensionTypes.overworld).command.run([
                    "fog @a remove \"night_event\""
                ]);
            }
        }, false);

        this.getEvents().events.beforeChatSend.subscribe(e => {
            let cmdRunner = this.getExDimension(MinecraftDimensionTypes.overworld);
            let sender = ExPlayer.getInstance(e.sender);

            if (e.message.startsWith(">/")) {
                let cmds = commandAnalysis(e.message.substring(2));
                let errMsg = "";

                switch (cmds[0]) {
                    case "help": {
                        sender.command.run("function help");
                        break;
                    }
                    case "creators": {
                        if (DecGlobal.isDec()) {
                            sender.command.run("function test/creator_list");
                        }
                        break;
                    }
                    case "diemode": {
                        if (cmds[1] === "open") {
                            sender.command.run("function diemode/open");
                        } else if (cmds[1] === "test") {
                            sender.command.run("function diemode/test");
                        } else {
                            errMsg = "Invalid command " + cmds[1];
                        }
                        break;
                    }
                    case "magic": {
                        if (DecGlobal.isDec()) {
                            if (cmds[1] === "display") {
                                if (e.sender.isOp()) {
                                    if (cmds[2] === "true") {
                                        cmdRunner.command.run("function magic/display_on");
                                    } else if (cmds[2] === "false") {
                                        cmdRunner.command.run("function magic/display_off");
                                    } else {
                                        errMsg = "Invalid command " + cmds[2];
                                    }
                                } else {
                                    sender.command.run("tellraw @s { \"rawtext\" : [ { \"translate\" : \"text.dec:command_fail.name\" } ] }");
                                }
                            } else {
                                errMsg = "Invalid command " + cmds[1];
                            }
                        }
                        break;
                    }
                    case "_save": {
                        if (cmds.length < 7) return;
                        let start = new Vector3(Math.floor(parseFloat(cmds[1])), Math.floor(parseFloat(cmds[2])), Math.floor(parseFloat(cmds[3])));
                        let end = new Vector3(Math.floor(parseFloat(cmds[4])), Math.floor(parseFloat(cmds[5])), Math.floor(parseFloat(cmds[6]))).add(1);

                        let data: string[] = [];
                        let task = new ExTaskRunner();
                        const mthis = this;
                        task.run((function* () {
                            for (let i of new IStructureDriver().save(mthis.getExDimension(MinecraftDimensionTypes.overworld), start, end)) {
                                let res = i.toData();
                                i.dispose();
                                //console.warn(JSON.stringify(res));
                                let com = GZIPUtil.zipString(JSON.stringify(res)) ?? "";
                                data.push(com);
                                //console.warn(com);
                                yield true;
                            }
                        }).bind(this));
                        task.start(2, 1).then(() => {
                            this.compress = data;
                            console.warn("over");
                            // for(let i of data){
                            //     console.warn(i);
                            // }
                            console.warn(JSON.stringify(data));
                        });
                        // console.warn(GZIPUtil.unzipString(com));
                        break;
                    }
                    case "_load": {
                        let start = new Vector3(Math.floor(parseFloat(cmds[1])), Math.floor(parseFloat(cmds[2])), Math.floor(parseFloat(cmds[3])));
                        let data = new IStructureSettle();
                        let task: (() => void)[] = [];

                        for (let comp of this.compress) {
                            task.push(() => {
                                data.load(JSON.parse(GZIPUtil.unzipString(comp)));
                                data.run(this.getExDimension(MinecraftDimensionTypes.overworld), start)
                                    .then(() => {
                                        task.shift()?.();
                                    });
                            });
                        }
                        task.shift()?.();
                        break;
                    }
                    case "_test": {
                        let start = new Vector3(Math.floor(parseFloat(cmds[1])), Math.floor(parseFloat(cmds[2])), Math.floor(parseFloat(cmds[3])));
                        let data = new IStructureSettle();
                        let task: (() => void)[] = [];

                        for (let comp of decTreeStructure) {
                            task.push(() => {
                                data.load(JSON.parse(GZIPUtil.unzipString(comp)));
                                data.run(this.getExDimension(MinecraftDimensionTypes.overworld), start)
                                    .then(() => {
                                        task.shift()?.();
                                    });
                            });
                        }
                        task.shift()?.();
                        break;
                    }
                }
                if (errMsg.length !== 0) {
                    sender.command.run(`tellraw @s { "rawtext" : [ { "text" : "Command Error: ${errMsg}" } ] }`);
                }
                e.cancel = true;
            }
        });

        this.getEvents().events.afterBlockBreak.subscribe(e => {
            const entity = ExPlayer.getInstance(e.player);
            //防破坏方块 i_inviolable计分板控制
            if (entity.getScoresManager().getScore(this.i_inviolable) > 1) {
                e.dimension.getBlock(e.block.location)?.setType(e.brokenBlockPermutation.type);
                let ep = ExPlayer.getInstance(e.player);
                entity.exDimension.command.run("kill @e[type=item,r=2,x=" + e.block.x + ",y=" + e.block.y + ",z=" + e.block.z + "]")
                ep.addEffect(MinecraftEffectTypes.Blindness, 200, 0, true);
                ep.addEffect(MinecraftEffectTypes.Darkness, 400, 0, true);
                ep.addEffect(MinecraftEffectTypes.Wither, 100, 0, true);
                ep.addEffect(MinecraftEffectTypes.MiningFatigue, 600, 2, true);
                ep.addEffect(MinecraftEffectTypes.Hunger, 600, 1, true);
                ep.addEffect(MinecraftEffectTypes.Nausea, 200, 0, true);
                entity.command.run("tellraw @s { \"rawtext\" : [ { \"translate\" : \"text.dec:i_inviolable.name\" } ] }")
            }
        });

        this.getEvents().events.beforeExplosion.subscribe(e => {
            if (e.source) {
                const entity = ExEntity.getInstance(e.source);
                //防爆 i_inviolable计分板控制
                if (entity.getScoresManager().getScore(this.i_damp) > 0) {
                    entity.exDimension.spawnParticle("dec:damp_explosion_particle", e.source.location);
                    e.cancel = true;
                }
            }
        });

        this.getEvents().events.beforeItemUseOn.subscribe(e => {
            const entity = ExEntity.getInstance(e.source);
            //防放方块
            if (entity.getScoresManager().getScore(this.i_soft) > 0 && e.itemStack.typeId != "dec:iron_key" && e.itemStack.typeId != "dec:frozen_power" && e.itemStack.typeId != "dec:ash_key" && e.itemStack.typeId != "dec:challenge_of_ash") {
                e.cancel = true;
            }
        });

        this.getEvents().exEvents.tick.subscribe(e => {
            //诅咒时间减少
            this.getExDimension(MinecraftDimensionTypes.overworld).command.run([
                "scoreboard players remove @e[scores={i_inviolable=1..}] i_inviolable 1",
                "scoreboard players remove @e[scores={i_damp=1..}] i_damp 1",
                "scoreboard players remove @e[scores={i_soft=1..}] i_soft 1",
                "scoreboard players remove @e[scores={i_heavy=1..}] i_heavy 1",
                "scoreboard players remove @e[scores={harmless=1..}] harmless 1"
            ]);

            let night_event = this.globalscores.getNumber("NightRandom");
            const nightEvent = (fog: string, eventEntity: string, maxSpawn: number) => {
                this.getExDimension(MinecraftDimensionTypes.overworld).command.run(['fog @a[tag=dOverworld] push ' + fog + ' "night_event"']);
                let i = 0;
                for (let p of this.getExDimension(MinecraftDimensionTypes.overworld).getPlayers()) {
                    if (i >= maxSpawn) break;
                    this.getExDimension(MinecraftDimensionTypes.overworld).spawnEntity(eventEntity, p.location);
                    i += 1;
                }
            }
            if (e.currentTick % 400 === 0) {
                switch (night_event) {
                    case 1:
                        //尸潮
                        nightEvent('dec:event_zombie_wave', 'dec:event_zombie_wave', 6)
                        break;
                    case 2:
                        //骷髅夜
                        nightEvent('dec:event_skeleton_wave', 'dec:event_skeleton_wave', 6)
                        break;
                    case 3:
                        //暗影之夜
                        nightEvent('dec:event_shadow_night', 'dec:event_shadow_night', 3)
                        break;
                    case 5:
                        //万圣夜
                        nightEvent('dec:event_halloween', 'dec:event_halloween', 7)
                        break;
                    case 6:
                        //寂静之夜
                        nightEvent('dec:event_silent_night', 'dec:event_silent_night', 2)
                        break;
                }
            }
            if (e.currentTick % 200 === 0) {
                switch (night_event) {
                    case 4:
                        //寒潮
                        nightEvent('dec:event_cold_wave', 'dec:event_cold_wave', 7)
                        break;
                }
            }

            if (e.currentTick % 100 === 0) {
                //夜晚事件
                this.nightEventListener.upDate(new ExEnvironment().isNight());
            }
        });

        //实体监听器，用于播放bgm、完成任务判断
        this.addEntityController("dec:leaves_golem", DecCommonBossLastStage);
        this.addEntityController("dec:king_of_pillager", DecCommonBossLastStage);
        this.addEntityController("dec:abyssal_controller", DecCommonBossLastStage);
        this.addEntityController("dec:predators", DecCommonBossLastStage);
        this.addEntityController("dec:enchant_illager_2", DecCommonBossLastStage);
        this.addEntityController("dec:escaped_soul_entity", DecCommonBossLastStage);
        this.addEntityController("dec:host_of_deep", DecHostOfDeepBoss1);
        this.addEntityController("dec:host_of_deep_1", DecHostOfDeepBoss2);
        this.addEntityController("dec:host_of_deep_2", DecHostOfDeepBoss3);
        this.addEntityController("dec:ash_knight", DecCommonBossLastStage);
        this.addEntityController("dec:everlasting_winter_ghast", DecEverlastingWinterGhastBoss1);
        this.addEntityController("dec:everlasting_winter_ghast_1", DecEverlastingWinterGhastBoss2);


        this.addEntityController("dec:nuke", DecNukeController);

    }

    override newClient(id: string, player: Player): ExGameClient {
        return new DecClient(this, id, player);
    }
}