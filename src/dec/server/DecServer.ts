import { Player, MinecraftDimensionTypes, Entity, ItemStack, MinecraftEffectTypes, ChatEvent, MinecraftItemTypes } from '@minecraft/server';
import ExConfig from "../../modules/exmc/ExConfig.js";
import ExGameClient from "../../modules/exmc/server/ExGameClient.js";
import DecClient from "./DecClient.js";
import ExPlayer from '../../modules/exmc/server/entity/ExPlayer.js';
import MathUtil from '../../modules/exmc/math/MathUtil.js';
import { ActionFormData } from '@minecraft/server-ui';
import { DecTasks, taskUi } from './data/Task.js';
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


export default class DecServer extends ExGameServer {
    i_inviolable: Objective;
    i_damp: Objective;
    i_soft: Objective;

    nightEventListener: VarOnChangeListener<boolean>;
    tmpV = new Vector3();
    constructor(config: ExConfig) {
        super(config);

        this.i_inviolable = new Objective("i_inviolable").create("i_inviolable");
        this.i_damp = new Objective("i_damp").create("i_damp");
        this.i_soft = new Objective("i_soft").create("i_soft");
        //new Objective("harmless").create("harmless");
        this.nightEventListener = new VarOnChangeListener(e => {
            if (e) {
                // is night
                this.getExDimension(MinecraftDimensionTypes.overworld).command.run([
                    "scoreboard players random NightRandom global 1 100",
                    "scoreboard players set IsDay global 0",
                    "scoreboard players set IsNight global 1"
                ]);
            } else {
                this.getExDimension(MinecraftDimensionTypes.overworld).command.run([
                    "scoreboard players set IsDay global 1",
                    "scoreboard players set IsNight global 0",
                    "scoreboard players set NightRandom global 0",
                    "scoreboard players set @a night_event 0",
                    "fog @a remove \"night_event\""
                ]);
            }
        }, false);

        this.getEvents().events.beforeChat.subscribe(e => {
            let cmdRunner = this.getExDimension(MinecraftDimensionTypes.overworld);
            let sender = ExPlayer.getInstance(e.sender);

            if (e.message.startsWith(">/")) {
                let cmds = commandAnalysis(e.message.substring(2));
                let errMsg = "";
                switch (cmds[0]) {
                    case "help":
                        sender.command.run("function help");
                        break;
                    case "creators":
                        if (DecGlobal.isDec()) {
                            sender.command.run("function test/creator_list");
                        }
                        break;
                    case "diemode":
                        if (cmds[1] === "open") {
                            sender.command.run("function diemode/open");
                        } else if (cmds[1] === "test") {
                            sender.command.run("function diemode/test");
                        } else {
                            errMsg = "Invalid command " + cmds[1];
                        }
                        break;
                    case "magic":
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
                if (errMsg.length !== 0) {
                    sender.command.run(`tellraw @s { "rawtext" : [ { "text" : "Command Error: ${errMsg}" } ] }`);
                }
                e.cancel = true;
            }
        });

        this.getEvents().events.blockBreak.subscribe(e => {
            const entity = ExPlayer.getInstance(e.player);
            //??????????????? i_inviolable???????????????
            if (entity.getScoresManager().getScore(this.i_inviolable) > 1) {
                e.dimension.getBlock(e.block.location).setType(e.brokenBlockPermutation.type);
                entity.getExDimension().command.run("kill @e[type=item,r=2,x=" + e.block.x + ",y=" + e.block.y + ",z=" + e.block.z + "]")
                e.player.addEffect(MinecraftEffectTypes.nausea, 200, 0, true);
                e.player.addEffect(MinecraftEffectTypes.blindness, 200, 0, true);
                e.player.addEffect(MinecraftEffectTypes.darkness, 400, 0, true);
                e.player.addEffect(MinecraftEffectTypes.wither, 100, 0, true);
                e.player.addEffect(MinecraftEffectTypes.miningFatigue, 600, 2, true);
                e.player.addEffect(MinecraftEffectTypes.hunger, 600, 1, true);
                entity.command.run("tellraw @s { \"rawtext\" : [ { \"translate\" : \"text.dec:i_inviolable.name\" } ] }")
            }
        });

        this.getEvents().events.beforeExplosion.subscribe(e => {
            if (e.source) {
                const entity = ExEntity.getInstance(e.source);
                //?????? i_inviolable???????????????
                if (entity.getScoresManager().getScore(this.i_damp) > 0) {
                    entity.getExDimension().spawnParticle("dec:damp_explosion_particle", e.source.location);
                    e.cancel = true;
                }
            }
        });

        this.getEvents().events.beforeItemUseOn.subscribe(e => {
            const entity = ExEntity.getInstance(e.source);
            //????????????
            if (entity.getScoresManager().getScore(this.i_soft) > 0 && e.item.typeId != "dec:iron_key" && e.item.typeId != "dec:frozen_power") {
                e.cancel = true;
            }
        });

        this.getEvents().events.tick.subscribe(e => {
            //??????????????????
            this.getExDimension(MinecraftDimensionTypes.overworld).command.run([
                "scoreboard players remove @e[scores={i_inviolable=1..}] i_inviolable 1",
                "scoreboard players remove @e[scores={i_damp=1..}] i_damp 1",
                "scoreboard players remove @e[scores={i_soft=1..}] i_soft 1",
                "scoreboard players remove @e[scores={harmless=1..}] harmless 1"
            ]);

            if (e.currentTick % 100 === 0) {
                //????????????
                this.nightEventListener.upDate(new ExEnvironment().isNight());

                //????????????
                let prom: Promise<boolean>[] = [];
                for (const client of <IterableIterator<DecClient>>this.getClients()) {
                    prom.push(client.checkArmor());
                }
                to(Promise.all(prom).then((e) => {
                    if (!e.every(i => i)) {
                        let prom2: Promise<unknown>[] = [];
                        if (DecGlobal.isDec()) {
                            for (let k in ArmorPlayerDec) {
                                prom2.push((<ArmorData>(<any>ArmorPlayerDec)[k]).find(this.getExDimension(MinecraftDimensionTypes.overworld).command));
                            }
                        } else {
                            for (let k in ArmorPlayerPom) {
                                prom2.push((<ArmorData>(<any>ArmorPlayerPom)[k]).find(this.getExDimension(MinecraftDimensionTypes.overworld).command));
                            }
                        }
                        to(Promise.all(prom2).then((x) => {
                            for (const client of <IterableIterator<DecClient>>this.getClients()) {
                                let flag = false;
                                for (let tag of client.player.getTags()) {
                                    if (tag.startsWith("armorTest:")) {
                                        client.player.removeTag(tag);
                                        client.chooseArmor((<any>ArmorPlayerPom)[tag.split(":")[1]]);
                                        flag = true;
                                    }
                                }
                                if (!flag) {
                                    client.chooseArmor(undefined);
                                }
                            }
                        }));
                    }
                }));
            }
        });

        //??????????????????????????????bgm?????????????????????
        this.addEntityController("dec:leaves_golem", DecCommonBossLastStage);
        this.addEntityController("dec:king_of_pillager", DecCommonBossLastStage);
        this.addEntityController("dec:abyssal_controller", DecCommonBossLastStage);
        this.addEntityController("dec:predators", DecCommonBossLastStage);
        this.addEntityController("dec:enchant_illager_2", DecCommonBossLastStage);
        this.addEntityController("dec:escaped_soul_entity", DecCommonBossLastStage);
        this.addEntityController("dec:host_of_deep_2", DecCommonBossLastStage);
        this.addEntityController("dec:ash_knight", DecCommonBossLastStage);
        this.addEntityController("dec:everlasting_winter_ghast", DecEverlastingWinterGhastBoss1);
        this.addEntityController("dec:everlasting_winter_ghast_1", DecEverlastingWinterGhastBoss2);

    }

    override newClient(id: string, player: Player): ExGameClient {
        return new DecClient(this, id, player);
    }
}