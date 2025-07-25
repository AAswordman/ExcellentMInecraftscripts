import { Player, world, Block, Direction, GameMode, Entity, ScriptEventSource, Dimension, system, ScriptEventCommandMessageAfterEvent, EntityQueryOptions, EntityApplyDamageOptions, EntityDamageCause, DisplaySlotId, ScoreboardObjectiveDisplayOptions, ScoreboardObjective, ItemStack, RawMessage, CommandPermissionLevel } from '@minecraft/server';
import ExConfig from "../../modules/exmc/ExConfig.js";
import ExGameClient from "../../modules/exmc/server/ExGameClient.js";
import DecClient from "./DecClient.js";
import ExPlayer from '../../modules/exmc/server/entity/ExPlayer.js';
import { Objective } from '../../modules/exmc/server/entity/ExScoresManager.js';
import ExEntity from '../../modules/exmc/server/entity/ExEntity.js';
import commandAnalysis from '../../modules/exmc/utils/commandAnalysis.js';
import ExGameServer from '../../modules/exmc/server/ExGameServer.js';
import DecGlobal from './DecGlobal.js';
import Vector3 from '../../modules/exmc/utils/math/Vector3.js';
import { DecEverlastingWinterGhastBoss1, DecEverlastingWinterGhastBoss2 } from './entities/DecEverlastingWinterGhastBoss.js';
import { DecCommonBossLastStage } from './entities/DecCommonBossLastStage.js';
import VarOnChangeListener from '../../modules/exmc/utils/VarOnChangeListener.js';
import ExEnvironment from '../../modules/exmc/server/env/ExEnvironment.js';
import { DecHostOfDeepBoss1, DecHostOfDeepBoss2, DecHostOfDeepBoss3 } from './entities/DecHostOfDeepBoss.js';
import GZIPUtil from '../../modules/exmc/utils/GZIPUtil.js';
import IStructureSettle from './data/structure/IStructureSettle.js';
import IStructureDriver from './data/structure/IStructureDriver.js';
import ExTaskRunner from '../../modules/exmc/server/ExTaskRunner.js';
import DecNukeController from './entities/DecNukeController.js';
import GlobalScoreBoardCache from '../../modules/exmc/server/storage/cache/GlobalScoreBoardCache.js';
import MathUtil from '../../modules/exmc/utils/math/MathUtil.js';
import ExGame, { receiveMessage } from '../../modules/exmc/server/ExGame.js';
import {  MinecraftDimensionTypes, MinecraftEffectTypes } from '../../modules/vanilla-data/lib/index.js';
import { DecLeavesGolemBoss } from './entities/DecLeavesGolemBoss.js';
import { DecEscapeSoulBoss3, DecEscapeSoulBoss4, DecEscapeSoulBoss5 } from './entities/DecEscapeSoulBoss.js';
import DecBossController from './entities/DecBossController.js';
import DecBossBarrier from './entities/DecBossBarrier.js';
import { ignorn } from '../../modules/exmc/server/ExErrorQueue.js';

export default class DecServer extends ExGameServer {
    i_inviolable: Objective;
    i_damp: Objective;
    i_soft: Objective;
    i_softx: Objective;
    i_heavy: Objective;
    skill_count: Objective;
    gametime: Objective;
    magicpoint: Objective;
    maxmagic: Objective;
    magicgain: Objective;
    story_random: Objective;
    magicreckon: Objective;
    random: Objective;
    global: Objective;
    pre_gamemode: Objective;

    nightEventListener: VarOnChangeListener<boolean>;
    tmpV = new Vector3();
    globalscores = new GlobalScoreBoardCache(new Objective("global"), false);

    //test
    compress = [""];

    state_set_keep = (block: Block, stateMatchMap: { [x: string]: (string | number | boolean) }) => {
        let states = block.permutation.getAllStates();
        for (let k in stateMatchMap) {
            states[k] = stateMatchMap[k];
        }
        let states_string = '['
        Object.keys(states).forEach(k => {
            let new_st = '"' + k + '"='
            if (typeof (states[k]) == 'boolean' || typeof (states[k]) == 'number') {
                new_st += (states[k]) + ','
            } else if (typeof (states[k]) == 'string') {
                new_st += '"' + (states[k]) + '",'
            }
            states_string += new_st;
        })
        states_string = states_string.slice(0, states_string.length - 1)
        states_string += ']'
        this.getExDimension(block.dimension).command.runAsync('setblock ' + (block.location.x) + ' ' + (block.location.y) + ' ' + (block.location.z) + ' ' + block.typeId + ' ' + states_string);
    }

    constructor(config: ExConfig) {
        super(config);

        this.i_inviolable = new Objective("i_inviolable").create("i_inviolable");
        this.i_damp = new Objective("i_damp").create("i_damp");
        this.i_soft = new Objective("i_soft").create("i_soft");
        this.i_softx = new Objective("i_softx").create("i_softx");
        this.i_heavy = new Objective("i_heavy").create("i_heavy");
        this.skill_count = new Objective("skill_count").create("skill_count");
        this.gametime = new Objective("gametime").create("gametime");
        this.magicpoint = new Objective("magicpoint").create("magicpoint");
        this.maxmagic = new Objective("maxmagic").create("maxmagic");
        this.magicgain = new Objective("magicgain").create("magicgain");
        this.story_random = new Objective("story_random").create("story_random");
        this.magicreckon = new Objective("magicreckon").create("magicreckon");
        this.random = new Objective("random").create("random");
        this.pre_gamemode = new Objective("pre_gamemode").create("pre_gamemode");
        this.global = new Objective("global").create("global");
        let place_block_wait_tick = 0
        this.globalscores.setNumber('zero', 0)
        this.globalscores.setNumber('one', 1)
        this.globalscores.setNumber('two', 2)
        this.globalscores.setNumber('four', 4)
        this.globalscores.initNumber('FirstEnter', 0)
        this.globalscores.initNumber('MagicDisplay', 0);

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
                this.getExDimension(MinecraftDimensionTypes.Overworld).command.runAsync([
                    "fog @a remove \"night_event\""
                ]);
            }
        }, false);

        // this.getEvents().events.beforePistonActivate.subscribe(e => {
        //     e.piston
        // });
        let die_mode_test = (p: Player, open: boolean) => {
            if (open) {
                if (world.getDynamicProperty('DieMode')) {
                    if (world.getDynamicProperty('AlreadyDie')) {
                        p.sendMessage({ "rawtext": [{ "translate": "text.dec:diemode_cannot_close_already_die.name" }] })
                    } else {
                        p.sendMessage({ "rawtext": [{ "translate": "text.dec:diemode_cannot_close.name" }] })
                    }
                } else {
                    if (p.hasTag('owner')) {
                        if (world.getDynamicProperty('AlreadyDie')) {
                            p.sendMessage({ "rawtext": [{ "translate": "text.dec:diemode_already_die.name" }] })
                        } else {
                            if (world.getDynamicProperty('GmCheat')) {
                                p.sendMessage({ "rawtext": [{ "translate": "text.dec:diemode_gmcheat.name" }] })
                            } else {
                                p.sendMessage({ "rawtext": [{ "translate": "text.dec:diemode_open.name" }] })
                                world.setDynamicProperty('DieMode', true)
                            }
                        }
                    } else {
                        p.sendMessage({ "rawtext": [{ "translate": "text.dec:diemode_not_owner.name" }] })
                    }
                }
            } else {
                if (world.getDynamicProperty('DieMode')) {
                    p.sendMessage({ "rawtext": [{ "translate": "text.dec:diemode_test_open.name" }] })
                    p.runCommand('tellraw @s ')
                } else {
                    if (world.getDynamicProperty('AlreadyDie')) {
                        p.sendMessage({ "rawtext": [{ "translate": "text.dec:diemode_test_close_cannot_open_die.name" }] })
                    } else {
                        if (world.getDynamicProperty('GmCheat')) {
                            p.sendMessage({ "rawtext": [{ "translate": "text.dec:diemode_test_close_cannot_open_gmc.name" }] })
                        } else {
                            p.sendMessage({ "rawtext": [{ "translate": "text.dec:diemode_test_close.name" }] })
                        }
                    }
                }
            }
        }
        this.getEvents().events.beforeChatSend.subscribe(e => {
            let cmdRunner = this.getExDimension(MinecraftDimensionTypes.Overworld);
            let sender = ExPlayer.getInstance(e.sender);

            if (e.message.startsWith(">/")) {
                let cmds = commandAnalysis(e.message.substring(2));
                let errMsg = "";

                switch (cmds[0]) {
                    case "help": {
                        sender.command.runAsync("function help");
                        break;
                    }
                    case "creators": {
                        if (DecGlobal.isDec()) {
                            sender.command.runAsync("function test/creator_list");
                        }
                        break;
                    }
                    case "diemode": {
                        if (cmds[1] === "open") {
                            die_mode_test(sender.entity, true)
                        } else if (cmds[1] === "test") {
                            die_mode_test(sender.entity, false)
                        } else {
                            errMsg = "Invalid command " + cmds[1];
                        }
                        break;
                    }
                    case "magic": {
                        if (DecGlobal.isDec()) {
                            if (cmds[1] === "display") {
                                if (e.sender.commandPermissionLevel >= CommandPermissionLevel.Admin) {
                                    if (cmds[2] === "true") {
                                        cmdRunner.command.runAsync("function magic/display_on");
                                    } else if (cmds[2] === "false") {
                                        cmdRunner.command.runAsync("function magic/display_off");
                                    } else {
                                        errMsg = "Invalid command " + cmds[2];
                                    }
                                } else {
                                    sender.command.runAsync("tellraw @s { \"rawtext\" : [ { \"translate\" : \"text.dec:command_fail.name\" } ] }");
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
                        let task = new ExTaskRunner(this);
                        const mthis = this;
                        task.setTasks((function* () {
                            for (let i of new IStructureDriver().save(mthis.getExDimension(MinecraftDimensionTypes.Overworld), start, end)) {
                                let res = i.toData();
                                i.dispose();
                                let com = GZIPUtil.zipString(JSON.stringify(res)) ?? "";
                                data.push(com);
                                yield true;
                            }
                        }).bind(this));
                        task.start(2, 1).then(() => {
                            this.compress = data;
                        });
                        break;
                    }
                    case "_load": {
                        let start = new Vector3(Math.floor(parseFloat(cmds[1])), Math.floor(parseFloat(cmds[2])), Math.floor(parseFloat(cmds[3])));
                        let data = new IStructureSettle();
                        let task: (() => void)[] = [];

                        for (let comp of this.compress) {
                            task.push(() => {
                                data.load(JSON.parse(GZIPUtil.unzipString(comp)));
                                data.run(this, this.getExDimension(MinecraftDimensionTypes.Overworld), start)
                                    .then(() => {
                                        task.shift()?.();
                                    });
                            });
                        }
                        task.shift()?.();
                        break;
                    }
                    case "_test": {
                        // let start = new Vector3(Math.floor(parseFloat(cmds[1])), Math.floor(parseFloat(cmds[2])), Math.floor(parseFloat(cmds[3])));
                        // let data = new IStructureSettle();
                        // let task: (() => void)[] = [];

                        // for (let comp of decTreeStructure) {
                        //     task.push(() => {
                        //         data.load(JSON.parse(GZIPUtil.unzipString(comp)));
                        //         data.run(this.getExDimension(MinecraftDimensionTypes.overworld), start)
                        //             .then(() => {
                        //                 task.shift()?.();
                        //             });
                        //     });
                        // }
                        // task.shift()?.();
                        break;
                    }
                }
                if (errMsg.length !== 0) {
                    sender.command.runAsync(`tellraw @s { "rawtext" : [ { "text" : "Command Error: ${errMsg}" } ] }`);
                }
                e.cancel = true;
            }
        });

        let multiple_blocks_items: { [key: string]: string }
        multiple_blocks_items = {
            'dec:patterned_vase_red': 'dec:patterned_vase_red_block',
            'dec:golden_fence': 'dec:golden_fence_block'
        }
        let multiple_blocks: { [key: string]: { 'height': number, 'sound': string, 'facing': boolean } }
        multiple_blocks = {
            'dec:patterned_vase_red_block': {
                'height': 2,
                'sound': 'stone',
                'facing': false
            },
            'dec:golden_fence_block': {
                'height': 2,
                'sound': 'stone',
                'facing': true
            }
        }

        this.getEvents().events.afterPlayerBreakBlock.subscribe(e => {
            const block_before_id = e.brokenBlockPermutation.type.id
            //种植架
            const block = e.block
            function print(s: any) {
                s = String(s)
                world.getDimension('overworld').runCommandAsync('say ' + s)
            }
            if (block_before_id == 'dec:trellis') {
                const bottom_block = (<Block>block.dimension.getBlock(new Vector3(block.location.x, block.location.y - 1, block.location.z)))
                if (bottom_block.typeId == 'dec:trellis') {
                    this.state_set_keep(bottom_block, { 'dec:is_top': true })
                }
            } else if (block_before_id in multiple_blocks) {
                let block_test_below = e.block.location.y - <number>e.brokenBlockPermutation.getAllStates()['dec:location']
                let loc = 0
                let block_test = <Block>e.block.dimension.getBlock(new Vector3(e.block.location.x, block_test_below, e.block.location.z))
                let repeat_times = multiple_blocks[block_before_id]['height'] + 1
                while (repeat_times > 0) {
                    if (block_test.typeId == block_before_id && <number>block_test.permutation.getAllStates()['dec:location'] == loc) {
                        block_test.transTo('minecraft:air')
                    }
                    block_test = <Block>e.block.dimension.getBlock(new Vector3(e.block.location.x, block_test.location.y + 1, e.block.location.z))
                    loc += 1
                    repeat_times -= 1
                }
            }
        });
        this.getEvents().events.beforePlayerBreakBlock.subscribe(e => {
            const entity = ExPlayer.getInstance(e.player);
            //防破坏方块 i_inviolable计分板控制
            if (entity.getScoresManager().getScore(this.i_inviolable) > 1) {
                let ep = ExPlayer.getInstance(e.player);
                this.run(() => {
                    // ep.addEffect(MinecraftEffectTypes.Blindness, 200, 0, true);
                    // ep.addEffect(MinecraftEffectTypes.Darkness, 400, 0, true);
                    // ep.addEffect(MinecraftEffectTypes.Wither, 100, 0, true);
                    ep.addEffect(MinecraftEffectTypes.MiningFatigue, 600, 2, true);
                    // ep.addEffect(MinecraftEffectTypes.Hunger, 600, 1, true);
                    // ep.addEffect(MinecraftEffectTypes.Nausea, 200, 0, true);
                    // entity.command.runAsync("tellraw @s { \"rawtext\" : [ { \"translate\" : \"text.dec:i_inviolable.name\" } ] }");
                });
                e.cancel = true;
            };
        });
        this.getEvents().events.beforeExplosion.subscribe(e => {
            if (e.source) {
                //防爆 i_inviolable计分板控制 和 boss领地默认保护
                const entity = ExEntity.getInstance(e.source);
                //防爆 i_inviolable计分板控制
                if (entity.getScoresManager().getScore(this.i_damp) > 0 || DecBossBarrier.find(e.source.location)) {
                    const s = e.source.location;
                    const dim = entity.dimension
                    this.run(() => dim.spawnParticle("dec:damp_explosion_particle", s));;
                    e.cancel = true;
                }
            }
        });

        const block_exceptx = new Set<string>(['minecraft:enchanting_table', 'minecraft:barrel', 'minecraft:grindstone', 'minecraft:brewing_stand',
            'minecraft:crafting_table', 'minecraft:smithing_table', 'minecraft:cartography_table', 'minecraft:lectern', 'minecraft:cauldron', 'minecraft:composter',
            'minecraft:acacia_door', 'minecraft:acacia_trapdoor', 'minecraft:bamboo_door', 'minecraft:bamboo_trapdoor', 'minecraft:birch_door', 'minecraft:birch_trapdoor',
            'minecraft:cherry_door', 'minecraft:cherry_trapdoor', 'minecraft:crimson_door', 'minecraft:crimson_trapdoor', 'minecraft:dark_oak_door', 'minecraft:dark_oak_trapdoor',
            'minecraft:jungle_door', 'minecraft:jungle_trapdoor', 'minecraft:mangrove_door', 'minecraft:mangrove_trapdoor', 'minecraft:spruce_door', 'minecraft:spruce_trapdoor',
            'minecraft:warped_door', 'minecraft:warped_trapdoor', 'minecraft:trapdoor', 'minecraft:wooden_door', 'minecraft:smoker', 'minecraft:blast_furnace', 'minecraft:furnace']);
        let item_except = new Set(['dec:iron_key', 'dec:frozen_power', 'dec:ash_key', 'dec:challenge_of_ash', 'dec:ice_ingot']);
        const block_except = new Set<string>(['minecraft:chest', 'minecraft:anvil', 'minecraft:black_shulker_box', 'minecraft:blue_shulker_box',
            'minecraft:brown_shulker_box', 'minecraft:cyan_shulker_box', 'minecraft:gray_shulker_box', 'minecraft:green_shulker_box', 'minecraft:light_blue_shulker_box',
            'minecraft:light_gray_shulker_box', 'minecraft:lime_shulker_box', 'minecraft:magenta_shulker_box', 'minecraft:orange_shulker_box', 'minecraft:pink_shulker_box',
            'minecraft:purple_shulker_box', 'minecraft:red_shulker_box', 'minecraft:undyed_shulker_box', 'minecraft:white_shulker_box', 'minecraft:yellow_shulker_box',
            'minecraft:ender_chest', 'minecraft:trapped_chest'].concat(Array.from(block_exceptx.values())));
        this.getEvents().events.beforePlayerInteractWithBlock.subscribe(e => {
            const entity = ExEntity.getInstance(e.player);
            //防放方块
            if (entity.getScoresManager().getScore(this.i_soft) > 0) {
                if (e.player.isSneaking) {
                    e.cancel = true
                } else {
                    if ((block_except.has(e.block.typeId) || item_except.has(e.itemStack?.typeId ?? "")) == false) {
                        e.cancel = true
                    }
                }
            } else if (entity.getScoresManager().getScore(this.i_softx) > 0) {
                if (e.player.isSneaking) {
                    e.cancel = true
                } else {
                    if ((block_exceptx.has(e.block.typeId) || item_except.has(e.itemStack?.typeId ?? "")) == false) {
                        e.cancel = true
                    }
                }
            } else if ((e.itemStack?.typeId ?? "") in multiple_blocks_items && place_block_wait_tick <= 0) {
                let b = e.block
                place_block_wait_tick = 2
                //e.source.playAnimation('')
                b.dimension.runCommandAsync('playsound use.stone @a ' + String(e.block.location.x) + ' ' + String(e.block.location.y) + ' ' + String(e.block.location.z))
                if (e.blockFace == Direction.East) {
                    b = <Block>e.block.dimension.getBlock(new Vector3(b.location.x + 1, b.location.y, b.location.z))
                } else if (e.blockFace == Direction.West) {
                    b = <Block>e.block.dimension.getBlock(new Vector3(b.location.x - 1, b.location.y, b.location.z))
                } else if (e.blockFace == Direction.North) {
                    b = <Block>e.block.dimension.getBlock(new Vector3(b.location.x, b.location.y, b.location.z - 1))
                } else if (e.blockFace == Direction.South) {
                    b = <Block>e.block.dimension.getBlock(new Vector3(b.location.x, b.location.y, b.location.z + 1))
                } else if (e.blockFace == Direction.Up) {
                    b = <Block>e.block.dimension.getBlock(new Vector3(b.location.x, b.location.y + 1, b.location.z))
                }
                if (e.blockFace != Direction.Down) {
                    let repeat_times = multiple_blocks[multiple_blocks_items[e.itemStack?.typeId ?? ""]]['height'] + 1
                    let repeat_times_jud = repeat_times
                    let place_admit = true
                    let test_block = b
                    while (repeat_times_jud > 0) {
                        if (!test_block.isAir) {
                            place_admit = false
                            break
                        } else {
                            test_block = <Block>test_block.dimension.getBlock(new Vector3(test_block.location.x, test_block.location.y + 1, test_block.location.z))
                            repeat_times_jud -= 1
                        }
                    }
                    test_block = b
                    let loc = 0
                    if (place_admit) {
                        while (repeat_times > 0) {
                            let states_str = ''
                            if (multiple_blocks[multiple_blocks_items[e.itemStack?.typeId ?? ""]]?.['facing']) {
                                states_str = ' ["dec:location"=' + String(loc) + ',"dec:facing"="' + get_direction_str(e.player) + '"]'
                            } else {
                                states_str = ' ["dec:location"=' + String(loc) + ']'
                            }
                            test_block.dimension.runCommandAsync('setblock ' + String(test_block.location.x) + ' ' + String(test_block.location.y) + ' ' + String(test_block.location.z) + ' ' + multiple_blocks_items[e.itemStack?.typeId ?? ""] + states_str)
                            test_block = <Block>test_block.dimension.getBlock(new Vector3(test_block.location.x, test_block.location.y + 1, test_block.location.z))
                            loc += 1
                            repeat_times -= 1
                        }
                        let p = ExPlayer.getInstance(e.player);
                        if (p.gamemode == GameMode.Survival || p.gamemode == GameMode.Adventure) {
                            p.getBag().clearItem(e.itemStack?.typeId ?? "", 1)
                        }
                    }
                }
            }
        });
        const get_direction_str = (p: Player) => {
            let r = p.getRotation().y
            if (-45 < r && r <= 45) {
                return 'south'
            } else if (45 < r && r <= 135) {
                return 'west'
            } else if (-135 < r && r <= -45) {
                return 'east'
            } else {
                return 'north'
            }
        }
        this.getEvents().events.afterPlayerPlaceBlock.subscribe(e => {
            const block = e.block
            //种植架
            if (e.block.typeId == 'dec:trellis') {
                this.state_set_keep(block, { 'dec:is_top': true })
                const bottom_block = (<Block>block.dimension.getBlock(new Vector3(block.location.x, block.location.y - 1, block.location.z)))
                if (bottom_block.typeId == 'minecraft:farmland') {
                    this.state_set_keep(block, { 'dec:is_bottom': true })
                } else if (bottom_block.typeId == 'dec:trellis') {
                    this.state_set_keep(block, { 'dec:is_bottom': false })
                    this.state_set_keep(bottom_block, { 'dec:is_top': false })
                }
            }
        })

        this.getEvents().events.afterProjectileHitEntity.subscribe(e => {
            if(e.projectile.isValid && ignorn(() => e.projectile.getComponent('type_family')?.hasTypeFamily('remove_on_hit'))){
                e.projectile.remove()
            }
        });

        this.getEvents().events.afterProjectileHitBlock.subscribe(e => {
            if(e.projectile.isValid && ignorn(() => e.projectile.getComponent('type_family')?.hasTypeFamily('remove_on_hit') || e.projectile.getComponent('type_family')?.hasTypeFamily('remove_on_hit_ground'))){
                e.projectile.remove()
            }
        });

        this.getEvents().exEvents.tick.subscribe(e => {
            //诅咒时间减少
            this.getExDimension(MinecraftDimensionTypes.Overworld).command.runAsync([
                "scoreboard players remove @e[scores={i_inviolable=1..}] i_inviolable 1",
                "scoreboard players remove @e[scores={i_damp=1..}] i_damp 1",
                "scoreboard players remove @e[scores={i_soft=1..}] i_soft 1",
                "scoreboard players remove @e[scores={i_heavy=1..}] i_heavy 1",
                //由于隔壁太耗时间，所以迁移过来了
                "execute as @e[scores={i_heavy=1..}] at @s run tag @e[r=10,type=ender_pearl] add no_ender_pearl",
                "scoreboard players remove @e[scores={harmless=1..}] harmless 1"
            ]);

        });
        this.getEvents().exEvents.onLongTick.subscribe(e => {
            //死亡模式
            if (world.getDynamicProperty('DieMode')) {
                world.gameRules.sendCommandFeedback = false
                world.gameRules.keepInventory = false
                world.getDimension('overworld').runCommandAsync('difficulty hard')
                world.getAllPlayers().forEach(p => {
                    if (<boolean>p.getDynamicProperty('AlreadyDie')) {
                        p.setGameMode(GameMode.Spectator)
                        ExPlayer.getInstance(p).titleActionBar('{ "rawtext" : [ { "translate" : "text.dec:diemode_spectator.name" } ] }')
                    } else if (<boolean>p.getDynamicProperty('GmCheat')) {
                        p.setGameMode(GameMode.Spectator)
                        ExPlayer.getInstance(p).titleActionBar('{ "rawtext" : [ { "translate" : "text.dec:diemode_spectator_gmcheat.name" } ] }')
                    }
                })
            }
            //Dec魔法显示
            if (DecGlobal.isDec() && this.globalscores.getNumber('MagicDisplay') === 1) {
                try {
                    world.scoreboard.removeObjective('magicdisplay')
                    let magic_display = world.scoreboard.addObjective('magicdisplay', '§bMagicPoint§r')
                    world.getAllPlayers().forEach(p => {
                        magic_display.setScore(p, <number>(<ScoreboardObjective>world.scoreboard.getObjective('magicpoint')).getScore(p))
                    })
                    let dec_magic_display: ScoreboardObjectiveDisplayOptions = {
                        objective: magic_display
                    }
                    world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, dec_magic_display)
                } catch (error) {

                }
            }

            if (place_block_wait_tick > 0) {
                place_block_wait_tick -= 1
            }
            let night_event = this.globalscores.getNumber("NightRandom");
            const nightEvent = (fog: string, eventEntity: string, maxSpawn: number) => {
                this.getExDimension(MinecraftDimensionTypes.Overworld).command.runAsync(['fog @a[tag=dOverworld] push ' + fog + ' "night_event"']);
                let i = 0;
                for (let p of this.getExDimension(MinecraftDimensionTypes.Overworld).getPlayers()) {
                    if (i >= maxSpawn) break;
                    this.getExDimension(MinecraftDimensionTypes.Overworld).spawnEntity(eventEntity, p.location);
                    i += 1;
                }
            }
            if (e.currentTick % 80 === 0) {
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
            if (e.currentTick % 40 === 0) {
                switch (night_event) {
                    case 4:
                        //寒潮
                        nightEvent('dec:event_cold_wave', 'dec:event_cold_wave', 7)
                        break;
                }
            }

            if (e.currentTick % 20 === 0) {
                //夜晚事件
                this.nightEventListener.upDate(new ExEnvironment().isNight());
            }
        });

        //实体监听器，用于播放bgm、完成任务判断
        this.addEntityController("dec:leaves_golem", DecLeavesGolemBoss);
        this.addEntityController("dec:king_of_pillager", DecCommonBossLastStage);
        this.addEntityController("dec:abyssal_controller", DecCommonBossLastStage);
        this.addEntityController("dec:predators", DecCommonBossLastStage);
        this.addEntityController("dec:enchant_illager", DecBossController);
        this.addEntityController("dec:enchant_illager_1", DecBossController);
        this.addEntityController("dec:enchant_illager_2", DecCommonBossLastStage);
        this.addEntityController("dec:escaped_soul", DecBossController);
        this.addEntityController("dec:escaped_soul_1", DecEscapeSoulBoss3);
        this.addEntityController("dec:escaped_soul_2", DecEscapeSoulBoss4);
        this.addEntityController("dec:escaped_soul_entity", DecEscapeSoulBoss5);
        this.addEntityController("dec:host_of_deep", DecHostOfDeepBoss1);
        this.addEntityController("dec:host_of_deep_1", DecHostOfDeepBoss2);
        this.addEntityController("dec:host_of_deep_2", DecHostOfDeepBoss3);
        this.addEntityController("dec:ash_knight", DecCommonBossLastStage);
        this.addEntityController("dec:everlasting_winter_ghast", DecEverlastingWinterGhastBoss1);
        this.addEntityController("dec:everlasting_winter_ghast_1", DecEverlastingWinterGhastBoss2);
        this.addEntityController("dec:nuke", DecNukeController);

        //植物
        
        
        
        ExGame.scriptEventReceive.addMonitor(e => {
            if (e.id == 'dec:trellis') {
                
            } else if (e.id == 'dec:sprint') {
                let power = Number(e.message)
                let p = (<Entity>e.sourceEntity)
                let r = p.getViewDirection()
                if (power < 0) {
                    p.applyKnockback({x: r.x, z:r.z}, power)
                } else {
                    p.applyKnockback({x: -r.x, z: -r.z}, -power)
                }
            } else if (e.id == 'dec:sustain_particle') {
                //格式：粒子id;重复生成次数;生成间隔刻
                let para_arr = message_split(e.message)
                let dim = <Dimension>script_event_location(e)[0]
                let i = 0
                while (i < Number(para_arr[1])) {
                    system.runTimeout(() => {
                        let loc = <Vector3>script_event_location(e)[1]
                        dim.spawnParticle(para_arr[0].toString(), loc)
                    }, i * Number(para_arr[2]))
                    i++
                }
            } else if (e.id == 'dec:sustain_damage') {
                //格式：伤害类型;伤害大小;重复判断次数;判断间隔刻;排除tag
                let para_arr = message_split(e.message)
                let dim = <Dimension>script_event_location(e)[0]
                let damage_type: EntityDamageCause = EntityDamageCause[para_arr[0].toString() as keyof typeof EntityDamageCause]
                const damage_option: EntityApplyDamageOptions = {
                    cause: damage_type,
                    damagingEntity: e.sourceEntity
                }
                let i = 0
                e.sourceEntity?.addTag(para_arr[4].toString())
                while (i < Number(para_arr[2])) {
                    system.runTimeout(() => {
                        let loc = <Vector3>script_event_location(e)[1]
                        const attackable_entity_option: EntityQueryOptions = {
                            location: loc,
                            maxDistance: 2,
                            excludeTypes: ['minecraft:item', 'minecraft:painting', 'minecraft:armor_stand'],
                            excludeTags: [para_arr[4].toString()]
                        }
                        dim.getEntities(attackable_entity_option).forEach(ent => {
                            ent.applyDamage(Number(para_arr[1]), damage_option)
                        })
                    }, i * Number(para_arr[3]))
                    i++
                }
                system.runTimeout(() => {
                    e.sourceEntity?.removeTag(para_arr[4].toString())
                }, Number(para_arr[2]) * Number(para_arr[3]))
            }
        })
        const script_event_location = (source: ScriptEventCommandMessageAfterEvent) => {
            let loc: Vector3
            let dim = world.getDimension('overworld')
            if (source.sourceType == ScriptEventSource.Block) {
                loc = <Vector3>source.sourceBlock?.location
                dim = <Dimension>source.sourceBlock?.dimension
            } else {
                loc = <Vector3>source.sourceEntity?.location
                dim = <Dimension>source.sourceEntity?.dimension
            }
            return [dim, loc]
        }
        const message_split = (message: String) => {
            let arr = new Array<String>();
            let cache = ''
            for (let m of message) {
                if (m == ';') {
                    arr.push(cache)
                    cache = ''
                } else {
                    cache += m
                }
            }
            arr.push(cache)
            return arr
        }

    }

    @receiveMessage('dec:trellis')
    trellis(eblock: Block,emessage: string){
        const trellis_cover_wither_spread = (block: Block) => {
            if (block.typeId == 'dec:trellis_cover' && block.permutation.getAllStates()['dec:crop_type'] != 'empty') {
                this.state_set_keep(block, { 'dec:may_wither': true })
            }
        }
        const block_around_judge = (arr: Block[], block: Block, targetId: string, stateMatchMap: { [x: string]: (string | number | boolean) }) => {
            if (block.typeId == targetId) {
                if (stateMatchMap) {
                    let states = block.permutation.getAllStates();
                    for (let k in stateMatchMap) {
                        if (states[k] !== stateMatchMap[k]) return;
                    }
                }
                arr.push(block)
            }
        }
        //种植架
        const block = eblock;
        const tmpV = new Vector3();
        const block_above = block.dimension.getBlock(tmpV.set(block.location.x, block.location.y + 1, block.location.z))!;
        const block_xp = block.dimension.getBlock(tmpV.set(block.location.x + 1, block.location.y, block.location.z))!;
        const block_xn = block.dimension.getBlock(tmpV.set(block.location.x - 1, block.location.y, block.location.z))!;
        const block_zp = block.dimension.getBlock(tmpV.set(block.location.x, block.location.y, block.location.z + 1))!;
        const block_zn = block.dimension.getBlock(tmpV.set(block.location.x, block.location.y, block.location.z - 1))!;
        if (block_above?.typeId == 'dec:trellis' && emessage == 'wither') {
            let block_above_n = block_above;
            while (block_above_n.typeId == 'dec:trellis') {
                this.state_set_keep(block_above_n, { 'dec:may_wither': true });
                block_above_n = <Block>block.dimension.getBlock(tmpV.set(block_above_n.location.x, block_above_n.location.y + 1, block_above_n.location.z))
            }
        }
        if (emessage == 'grow_spread') {
            let may_grow_block: Block[] = [];
            block_around_judge(may_grow_block, block_xp, 'dec:trellis_cover', { 'dec:crop_type': 'empty' });
            block_around_judge(may_grow_block, block_xn, 'dec:trellis_cover', { 'dec:crop_type': 'empty' })
            block_around_judge(may_grow_block, block_zp, 'dec:trellis_cover', { 'dec:crop_type': 'empty' })
            block_around_judge(may_grow_block, block_zn, 'dec:trellis_cover', { 'dec:crop_type': 'empty' })
            block_around_judge(may_grow_block, block_above, 'dec:trellis', { 'dec:crop_type': 'empty' });
            if (may_grow_block.length > 0) {
                this.state_set_keep(may_grow_block[MathUtil.randomInteger(0, may_grow_block.length - 1)], { 'dec:may_wither': false, 'dec:growth_stage': 0, 'dec:crop_type': <string>block.permutation.getState('dec:crop_type' as any) })
            }
        }
        if (emessage == 'wither_spread') {
            trellis_cover_wither_spread(block_xp)
            trellis_cover_wither_spread(block_xn)
            trellis_cover_wither_spread(block_zp)
            trellis_cover_wither_spread(block_zn)
        }
    }

    @receiveMessage('dec:flesh_block_spread')
    fleshBlockSpread(block:Block) {
        const dim = block.dimension;
        const loc = new Vector3(block.location);
        let blocks = [
            dim.getBlock(loc.cpy().add(1, 0, 0)),
            dim.getBlock(loc.cpy().add(-1, 0, 0)),
            dim.getBlock(loc.cpy().add(0, 1, 0)),
            dim.getBlock(loc.cpy().add(0, -1, 0)),
            dim.getBlock(loc.cpy().add(0, 0, 1)),
            dim.getBlock(loc.cpy().add(0, 0, -1))
        ]
        let age_ori = <number>block.permutation.getState('dec:age' as any)
        if (age_ori == 15) {
            //这里写死亡
            block.setType('minecraft:air')//后面改成死亡的方块
        }
        let can_grow_on = [
            'minecraft:air',
            'minecraft:water',
            'minecraft:flowing_water',
            'minecraft:grass',
            'minecraft:tall_grass'
        ]
        blocks = blocks.filter(b => can_grow_on.includes(b?.typeId ?? ''));
        if (blocks) {
            let b = <Block>blocks[Math.floor(Math.random() * blocks.length)]
            // 以后这可以写长其他东西
            b.setType('dec:flesh_block')
            this.state_set_keep(b, { 'dec:age': age_ori + 1 })
        }
    }

    override newClient(id: string, player: Player): ExGameClient {
        return new DecClient(this, id, player);
    }
}