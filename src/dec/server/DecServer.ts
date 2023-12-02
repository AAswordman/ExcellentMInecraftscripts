import { Player, MinecraftDimensionTypes, world, Block, Direction, GameMode } from '@minecraft/server';
import ExConfig from "../../modules/exmc/ExConfig.js";
import ExGameClient from "../../modules/exmc/server/ExGameClient.js";
import DecClient from "./DecClient.js";
import ExPlayer from '../../modules/exmc/server/entity/ExPlayer.js';
import { Objective } from '../../modules/exmc/server/entity/ExScoresManager.js';
import ExEntity from '../../modules/exmc/server/entity/ExEntity.js';
import commandAnalysis from '../../modules/exmc/utils/commandAnalysis.js';
import ExGameServer from '../../modules/exmc/server/ExGameServer.js';
import DecGlobal from './DecGlobal.js';
import Vector3 from '../../modules/exmc/math/Vector3.js';
import { DecEverlastingWinterGhastBoss1, DecEverlastingWinterGhastBoss2 } from './entities/DecEverlastingWinterGhastBoss.js';
import { DecCommonBossLastStage } from './entities/DecCommonBossLastStage.js';
import VarOnChangeListener from '../../modules/exmc/utils/VarOnChangeListener.js';
import ExEnvironment from '../../modules/exmc/server/env/ExEnvironment.js';
import { DecHostOfDeepBoss1, DecHostOfDeepBoss2, DecHostOfDeepBoss3 } from './entities/DecHostOfDeepBoss.js';
import GZIPUtil from '../../modules/exmc/utils/GZIPUtil.js';
import IStructureSettle from './data/structure/IStructureSettle.js';
import IStructureDriver from './data/structure/IStructureDriver.js';
import ExTaskRunner from '../../modules/exmc/server/ExTaskRunner.js';
import { MinecraftEffectTypes } from "@minecraft/vanilla-data";
import DecNukeController from './entities/DecNukeController.js';
import GlobalScoreBoardCache from '../../modules/exmc/server/storage/cache/GlobalScoreBoardCache.js';
import MathUtil from '../../modules/exmc/math/MathUtil.js';
import ExGame from '../../modules/exmc/server/ExGame.js';


export default class DecServer extends ExGameServer {
    i_inviolable: Objective;
    i_damp: Objective;
    i_soft: Objective;
    i_heavy: Objective;
    bullet_type: Objective;
    skill_count: Objective;

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
        this.skill_count = new Objective("skill_count").create("skill_count");
        let place_block_wait_tick = 0
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

        // this.getEvents().events.beforePistonActivate.subscribe(e => {
        //     e.piston
        // });



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
                    sender.command.run(`tellraw @s { "rawtext" : [ { "text" : "Command Error: ${errMsg}" } ] }`);
                }
                e.cancel = true;
            }
        });

        let multiple_blocks_items: { [key: string]: string }
        multiple_blocks_items = {
            'dec:patterned_vase_red': 'dec:patterned_vase_red_block'
        }
        let multiple_blocks: { [key: string]: { 'height': number, 'sound': string } }
        multiple_blocks = {
            'dec:patterned_vase_red_block': {
                'height': 3,
                'sound': 'stone'
            }
        }
        this.getEvents().events.afterPlayerBreakBlock.subscribe(e => {
            const entity = ExPlayer.getInstance(e.player);
            const block_before_id = e.brokenBlockPermutation.type.id
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
            //种植架
            const block = e.block
            function print(s: any) {
                s = String(s)
                world.getDimension('overworld').runCommandAsync('say ' + s)
            }
            if (block_before_id == 'dec:trellis') {
                const bottom_block = (<Block>block.dimension.getBlock(new Vector3(block.location.x, block.location.y - 1, block.location.z)))
                if (bottom_block.typeId == 'dec:trellis') {
                    state_set_keep(bottom_block, { 'dec:is_top': true })
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

        const block_except = new Set(['minecraft:chest', 'minecraft:anvil', 'minecraft:enchanting_table', 'minecraft:black_shulker_box', 'minecraft:blue_shulker_box',
            'minecraft:brown_shulker_box', 'minecraft:cyan_shulker_box', 'minecraft:gray_shulker_box', 'minecraft:green_shulker_box', 'minecraft:light_blue_shulker_box',
            'minecraft:light_gray_shulker_box', 'minecraft:lime_shulker_box', 'minecraft:magenta_shulker_box', 'minecraft:orange_shulker_box', 'minecraft:pink_shulker_box',
            'minecraft:purple_shulker_box', 'minecraft:red_shulker_box', 'minecraft:undyed_shulker_box', 'minecraft:white_shulker_box', 'minecraft:yellow_shulker_box',
            'minecraft:ender_chest', 'minecraft:trapped_chest', 'minecraft:barrel', 'minecraft:grindstone', 'minecraft:brewing_stand',
            'minecraft:crafting_table', 'minecraft:smithing_table', 'minecraft:cartography_table', 'minecraft:lectern', 'minecraft:cauldron', 'minecraft:composter',
            'minecraft:acacia_door', 'minecraft:acacia_trapdoor', 'minecraft:bamboo_door', 'minecraft:bamboo_trapdoor', 'minecraft:birch_door', 'minecraft:birch_trapdoor',
            'minecraft:cherry_door', 'minecraft:cherry_trapdoor', 'minecraft:crimson_door', 'minecraft:crimson_trapdoor', 'minecraft:dark_oak_door', 'minecraft:dark_oak_trapdoor',
            'minecraft:jungle_door', 'minecraft:jungle_trapdoor', 'minecraft:mangrove_door', 'minecraft:mangrove_trapdoor', 'minecraft:spruce_door', 'minecraft:spruce_trapdoor',
            'minecraft:warped_door', 'minecraft:warped_trapdoor', 'minecraft:trapdoor', 'minecraft:wooden_door', 'minecraft:smoker', 'minecraft:blast_furnace', 'minecraft:furnace']);
        let item_except = new Set(['dec:iron_key', 'dec:frozen_power', 'dec:ash_key', 'dec:challenge_of_ash', 'dec:ice_ingot']);
        this.getEvents().events.beforeItemUseOn.subscribe(e => {
            const entity = ExEntity.getInstance(e.source);
            //防放方块
            if (entity.getScoresManager().getScore(this.i_soft) > 0) {
                if (e.source.isSneaking) {
                    e.cancel = true
                } else {
                    // console.warn(block_except.has(e.block.typeId) || item_except.has(e.itemStack.typeId));
                    if ((block_except.has(e.block.typeId) || item_except.has(e.itemStack.typeId)) == false) {
                        e.cancel = true
                    }
                }
            } else if (e.itemStack.typeId in multiple_blocks_items && place_block_wait_tick <= 0) {
                //三格的方块
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
                    let repeat_times = multiple_blocks[multiple_blocks_items[e.itemStack.typeId]]['height'] + 1
                    let repeat_times_jud = repeat_times
                    let place_admit = true
                    let test_block = b
                    while (repeat_times_jud > 0){
                        if(!test_block.isAir){
                            place_admit = false
                            break
                        } else {
                            test_block = <Block>test_block.dimension.getBlock(new Vector3(test_block.location.x, test_block.location.y+1, test_block.location.z))
                            repeat_times_jud -= 1
                        }
                    }
                    test_block = b
                    let loc = 0
                    if (place_admit){
                        while (repeat_times > 0){
                            test_block.dimension.runCommandAsync('setblock ' + String(test_block.location.x) + ' ' + String(test_block.location.y) + ' ' + String(test_block.location.z) + ' '+multiple_blocks_items[e.itemStack.typeId]+' ["dec:location"='+String(loc)+']')
                            test_block = <Block>test_block.dimension.getBlock(new Vector3(test_block.location.x, test_block.location.y+1, test_block.location.z))
                            loc +=1
                            repeat_times -= 1
                        }
                        let p = ExPlayer.getInstance(<Player>e.source)
                        if (p.getGameMode() == GameMode.survival && p.getGameMode() == GameMode.adventure) {
                            p.getBag().clearItem('dec:patterned_vase_red', 1)
                        }
                    }
                }
            }
        });
        this.getEvents().events.afterPlayerPlaceBlock.subscribe(e => {
            const block = e.block
            //种植架
            if (e.block.typeId == 'dec:trellis') {
                state_set_keep(block, { 'dec:is_top': true })
                const bottom_block = (<Block>block.dimension.getBlock(new Vector3(block.location.x, block.location.y - 1, block.location.z)))
                if (bottom_block.typeId == 'minecraft:farmland') {
                    state_set_keep(block, { 'dec:is_bottom': true })
                } else if (bottom_block.typeId == 'dec:trellis') {
                    state_set_keep(block, { 'dec:is_bottom': false })
                    state_set_keep(bottom_block, { 'dec:is_top': false })
                }
            }
        })

        this.getEvents().exEvents.tick.subscribe(e => {
            //诅咒时间减少
            this.getExDimension(MinecraftDimensionTypes.overworld).command.run([
                "scoreboard players remove @e[scores={i_inviolable=1..}] i_inviolable 1",
                "scoreboard players remove @e[scores={i_damp=1..}] i_damp 1",
                "scoreboard players remove @e[scores={i_soft=1..}] i_soft 1",
                "scoreboard players remove @e[scores={i_heavy=1..}] i_heavy 1",
                "scoreboard players remove @e[scores={harmless=1..}] harmless 1"
            ]);


        });
        this.getEvents().exEvents.onLongTick.subscribe(e => {
            if (place_block_wait_tick > 0) {
                place_block_wait_tick -= 1
            }
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


        //植物
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
        const state_set_keep = (block: Block, stateMatchMap: { [x: string]: (string | number | boolean) }) => {
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

            this.getExDimension(block.dimension).command.run('setblock ' + (block.location.x) + ' ' + (block.location.y) + ' ' + (block.location.z) + ' ' + block.typeId + ' ' + states_string);
        }

        const trellis_cover_wither_spread = (block: Block) => {
            if (block.typeId == 'dec:trellis_cover' && block.permutation.getAllStates()['dec:crop_type'] != 'empty') {
                state_set_keep(block, { 'dec:may_wither': true })
            }
        }
        ExGame.scriptEventReceive.addMonitor(e => {
            if (e.id == 'dec:trellis') {
                //种植架
                const block = <Block>e.sourceBlock;
                const tmpV = new Vector3();
                const block_above = block.dimension.getBlock(tmpV.set(block.location.x, block.location.y + 1, block.location.z))!;
                const block_xp = block.dimension.getBlock(tmpV.set(block.location.x + 1, block.location.y, block.location.z))!;
                const block_xn = block.dimension.getBlock(tmpV.set(block.location.x - 1, block.location.y, block.location.z))!;
                const block_zp = block.dimension.getBlock(tmpV.set(block.location.x, block.location.y, block.location.z + 1))!;
                const block_zn = block.dimension.getBlock(tmpV.set(block.location.x, block.location.y, block.location.z - 1))!;
                if (block_above?.typeId == 'dec:trellis' && e.message == 'wither') {
                    let block_above_n = block_above;
                    while (block_above_n.typeId == 'dec:trellis') {
                        state_set_keep(block_above_n, { 'dec:may_wither': true });
                        block_above_n = <Block>block.dimension.getBlock(tmpV.set(block_above_n.location.x, block_above_n.location.y + 1, block_above_n.location.z))
                    }
                }
                if (e.message == 'grow_spread') {
                    let may_grow_block: Block[] = [];
                    block_around_judge(may_grow_block, block_xp, 'dec:trellis_cover', { 'dec:crop_type': 'empty' });
                    block_around_judge(may_grow_block, block_xn, 'dec:trellis_cover', { 'dec:crop_type': 'empty' })
                    block_around_judge(may_grow_block, block_zp, 'dec:trellis_cover', { 'dec:crop_type': 'empty' })
                    block_around_judge(may_grow_block, block_zn, 'dec:trellis_cover', { 'dec:crop_type': 'empty' })
                    block_around_judge(may_grow_block, block_above, 'dec:trellis', { 'dec:crop_type': 'empty' });
                    if (may_grow_block.length > 0) {
                        state_set_keep(may_grow_block[MathUtil.randomInteger(0, may_grow_block.length - 1)], { 'dec:may_wither': false, 'dec:growth_stage': 0, 'dec:crop_type': <string>block.permutation.getState('dec:crop_type') })
                    }
                }
                if (e.message == 'wither_spread') {
                    trellis_cover_wither_spread(block_xp)
                    trellis_cover_wither_spread(block_xn)
                    trellis_cover_wither_spread(block_zp)
                    trellis_cover_wither_spread(block_zn)
                }
            }
        })

    }

    override newClient(id: string, player: Player): ExGameClient {
        return new DecClient(this, id, player);
    }
}
