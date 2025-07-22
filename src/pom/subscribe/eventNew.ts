import { world, BlockPermutation, Block, Player, Entity, ItemStack, EquipmentSlot, Dimension, GameMode } from '@minecraft/server';
import { fileProvider, JSONObject } from '../../filepack/index.js';
import ExPlayer from '../../modules/exmc/server/entity/ExPlayer.js';
import Vector3 from '../../modules/exmc/utils/math/Vector3.js';
import ExEntity from '../../modules/exmc/server/entity/ExEntity.js';
import { idBlockMap, idItemMap, idEntityMap } from '../common/idMap.js';
import TickDelayTask from '../../modules/exmc/utils/TickDelayTask.js';
import ExGame from '../../modules/exmc/server/ExGame.js';
import ExSystem from '../../modules/exmc/utils/ExSystem.js';
import ExScoresManager, { Objective } from '../../modules/exmc/server/entity/ExScoresManager.js';
import PomServer from '../server/PomServer.js';
import ExContext from '../../modules/exmc/server/ExGameObject.js';
import ExGameConfig from '../../modules/exmc/server/ExGameConfig.js';
import DecGlobal from '../../dec/server/DecGlobal.js';

const ex = (name: string) => "ex:" + name;
const minecraft = (name: string) => "minecraft:" + name;
const fnamespace = (name: string) => name.split(":").slice(1).join(":");

type CompTriggerCommon = {
    "event": string;
    "target"?: string;
}

type onUseCompType = {
    "on_use": CompTriggerCommon;
}
const onUseCompName = "on_use";

type weaponCompType = {
    "on_hit_block"?: CompTriggerCommon;
    "on_hurt_entity"?: CompTriggerCommon;
}
const weaponCompName = "weapon";

type chargeableCompType = {
    "on_complete": CompTriggerCommon;
}
const chargeableCompName = "chargeable";

type diggerCompType = {
    "on_dig": CompTriggerCommon;
}
const diggerCompName = "digger";

type foodCompType = {
    "on_consume": CompTriggerCommon;
    "using_converts_to"?: string;
}
const foodCompName = "food";




type onStepOnCompType = {
    "target": string,
    "event": string
}
const onStepOnCompName = "on_step_on";

type onInteractCompType = {
    "condition"?: string,
    "event": string
}
const onInteractCompName = "on_interact";

type tickingCompType = {
    "on_tick": {
        "event": string;
    },
    "looping": boolean;
    "range": [number, number];
}
const tickingCompName = "ticking";

type randomTickingCompType = {
    "on_tick": {
        "event": string;
    }
}
const randomTickingCompName = "random_ticking";

type onPlayerPlacingCompType = onStepOnCompType;
const onPlayerPlacingCompName = "on_player_placing"
type onPlayerDestroyedCompType = onStepOnCompType;
const onPlayerDestroyedCompName = "on_player_destroyed"

const tmpV = new Vector3();
function molangCalculate(molang: string | number, option: TriggerOption) {
    molang = (molang + "").replace(/q\./g, "query.");
    const sapi = {
        get position() {
            return new Vector3(option.triggerEntity?.location ?? option.triggerBlock ?? new Vector3());
        },
        get dimension() {
            return option.triggerEntity?.dimension ?? option.triggerBlock?.dimension;
        },
        get block() {
            return option.triggerBlock;
        },
        get isDec() {
            return DecGlobal.isDec();
        },
        get triggerEntity(){
            return option.triggerEntity;
        },
        get player() {
            return option.triggerEntity;
        }
    };
    const query = {
        "block_state": (name: string) => {
            return option.triggerBlock?.permutation.getState(name as any);
        },
        "get_equipped_item_name": (pos: string) => {
            if (option.triggerEntity && option.triggerEntity instanceof Player) {
                switch (pos) {
                    case "main_hand":
                        return fnamespace(ExPlayer.getInstance(option.triggerEntity).getBag().itemOnMainHand?.typeId ?? ":");
                    case "off_hand":
                        return fnamespace(ExPlayer.getInstance(option.triggerEntity).getBag().itemOnOffHand?.typeId ?? ":");
                    default:
                        return "";
                }
            } else {
                return "";
            }
        },
        "scoreboard": (name: string) => {
            if (!option.triggerEntity) return "";
            return ExEntity.getInstance(option.triggerEntity).getScoresManager().getScore(name);
        },

        "position": (index: number) => {
            if (option.triggerBlock) {
                return tmpV.set(option.triggerBlock).toArray()[index];
            } else if (option.triggerEntity) {
                return tmpV.set(option.triggerEntity.location).toArray()[index];
            } else {
                return 0;
            }
        },

        get time_of_day() {
            return world.getTimeOfDay() / 24000;
        },

        //custom
        "consume_scoreboard": (name: string, num: number) => {
            if (option.triggerEntity) {
                let obj = new Objective(name);
                if ((obj.getScore(option.triggerEntity) ?? 0) >= num) {
                    obj.addScore(option.triggerEntity, -num);
                    return true
                }
            }
            return false;
        },
        get cardinal_facing_2d() {
            if (!option.triggerEntity || !option.triggerBlock) return 6;
            let dis = ExEntity.getInstance(option.triggerEntity).position.sub(option.triggerBlock.location);
            let angle = dis.rotateAngleX() + 45;
            switch (Math.floor(angle / 90) % 4) {
                case 0:
                    return 2;
                case 1:
                    return 4;
                case 2:
                    return 3;
                case 3:
                    return 5;
                default:
                    return 6;
            }
        }
    }
    let res = eval("(" + molang + ")");
    //console.warn(molang + " -> "+  res);
    return res;
}


function findTriggerComp(option: TriggerOption) {
    if (option.triggerBlock) {
        if (idBlockMap.has(option.triggerBlock.typeId)) {
            const block = idBlockMap.get(option.triggerBlock.typeId)!["minecraft:block"] as JSONObject;

            const comp = { ...(block.components as JSONObject ?? {}) }
            if ("permutations" in block) {
                for (let part of block.permutations as JSONObject[]) {
                    if (molangCalculate(part.condition as string, option)) {
                        const partComp = part.components as JSONObject
                        for (let key in partComp) {
                            comp[key] = partComp[key]
                        }
                    }
                }
            }
            if (!option.triggerType) return undefined;
            const result = comp[minecraft(option.triggerType)];
            return result as JSONObject | undefined;
        }
    } else if (option.triggerItem && option.triggerEntity) {
        if (idItemMap.has(option.triggerItem.typeId)) {
            const block = idItemMap.get(option.triggerItem.typeId)!["minecraft:item"] as JSONObject;

            const comp = block["components"] as JSONObject;
            if (!option.triggerType) return undefined;
            const result = comp[minecraft(option.triggerType)];
            return result as JSONObject | undefined;
        }
    }
    return undefined;
}

type MinecraftUniformEvent = {

}
type EventUser = {
    run_command?: {
        command: string[];
        target?: string;
    };
    post_message?: {
        message: any[];
        sign?: string;
    };
    play_sound?: {
        target?: string;
        sound: string;
    };
    condition?: string;
    trigger?: {
        event: string
    }
    set_block_state?: {
        [key: string]: string;
    }
    set_block?: {
        block_type: string;
    }
    spawn_loot?: {
        table: string;
    }
    add_mob_effect?: {
        effect: string;
        amplifier: number;
        duration: number;
        target: string;
    }
    sequence?: SequenceEventUser;
    randomize?: RandomizeEventUser;

    damage?: {
        amount: number;
        type: string;
    }
    shoot?: {
        projectile: string;
        launch_power?: number;
    }
    script?: {
        output: string;
        args: unknown[];
    }
    decrement_stack?: {}

}

type RandomizeEventUser = (EventUser & { weight: number })[];
type SequenceEventUser = EventUser[];
type TriggerOption = {
    triggerBlock?: Block;
    triggerEntity?: Entity;
    hurtedEntity?: Entity;
    triggerItem?: ItemStack;
    triggerType?: string;
}

let lastSelectItemSlot = new WeakMap<Player, [number, string]>();
function emitEvent(eventName: string, option: TriggerOption) {
    if (option.triggerBlock) {
        if (idBlockMap.has(option.triggerBlock.typeId)) {
            const block = idBlockMap.get(option.triggerBlock.typeId)!["minecraft:block"] as JSONObject;

            const events = (block.events as JSONObject ?? {});
            const event = events[eventName] as EventUser | undefined;
            if (event) {
                handleEventUser(event, option);
            }
        }
    } else if (option.triggerItem && option.triggerEntity) {
        if (option.triggerEntity instanceof Player) {
            if (lastSelectItemSlot.get(option.triggerEntity)?.[0] !== option.triggerEntity.selectedSlotIndex
                || lastSelectItemSlot.get(option.triggerEntity)?.[1] !== option.triggerItem.typeId) {
                return true;
            }
        }
        if (idItemMap.has(option.triggerItem.typeId)) {
            const item = idItemMap.get(option.triggerItem.typeId)!["minecraft:item"] as JSONObject;
            const events = (item.events as JSONObject ?? {});
            const event = events[eventName] as EventUser | undefined;
            if (event) {
                handleEventUser(event, option);
            }
        }
    }
    return undefined;
}

function handleEventUser(eventUser: EventUser, option: TriggerOption) {
    if (option.triggerBlock) {
        if (eventUser.condition) {
            if (!molangCalculate(eventUser.condition, option)) {
                return;
            }
        }
        if (eventUser.trigger) {
            emitEvent(eventUser.trigger.event, option);
        }
        let pos = new Vector3(option.triggerBlock.location);
        let posStr = pos.toArray().join(" ")
        if (eventUser.run_command) {
            for (let cmd of eventUser.run_command.command) {
                if (eventUser.run_command.target == "other" && option.triggerEntity) {
                    option.triggerEntity.runCommand(`${cmd}`);
                } else {
                    option.triggerBlock.dimension.runCommand(`execute positioned ${posStr} run ${cmd}`);
                }
            }
        }
        if (eventUser.play_sound) {
            option.triggerBlock.dimension.playSound(eventUser.play_sound.sound, pos);
        }
        if (eventUser.set_block_state) {
            let per = option.triggerBlock.permutation;
            for (let i in eventUser.set_block_state) {
                per = per.withState(i as any, molangCalculate((eventUser.set_block_state[i]), option));
            }
            option.triggerBlock.setPermutation(per);
        }
        if (eventUser.set_block) {
            option.triggerBlock.transTo(eventUser.set_block.block_type);
        }
        if (eventUser.spawn_loot) {
            option.triggerBlock.dimension.runCommand(`loot spawn ${new Vector3(option.triggerBlock).add(0.5).toArray().join(' ')} loot "${eventUser.spawn_loot.table.split('/')
                .slice(1).join('/').slice(0, -5)
                }"`);
        }
        if (eventUser.add_mob_effect && option.triggerEntity) {
            option.triggerEntity.addEffect(eventUser.add_mob_effect.effect, eventUser.add_mob_effect.duration * 20, {
                "amplifier": eventUser.add_mob_effect.amplifier
            });
        }
        if (eventUser.decrement_stack && option.triggerEntity instanceof Player) {
            let bag = ExPlayer.getInstance(option.triggerEntity).getBag();
            let item = bag.itemOnMainHand;
            if (item) {
                let damageComp = item.getComponent("durability");
                if (damageComp) {
                    let damage = damageComp.damage;
                    damage += 1;
                    if (damage >= damageComp.maxDurability) {
                        bag.clearItem(item.typeId, 1);
                    } else {
                        damageComp.damage = damage;
                        bag.itemOnMainHand = item;
                    }
                } else {
                    bag.clearItem(item.typeId, 1);
                }
            }
        }
        if (eventUser.post_message) {
            const post = ExSystem.deepClone(eventUser.post_message);
            for (let [i, e] of post.message.entries()) {
                post.message[i] = typeof e === "string" ? molangCalculate(e, option) : e;
            }
            if(post.sign) ExGame.postMessageToServer(post.sign, post.message);
        }
    } else if (option.triggerItem && option.triggerEntity) {
        if (eventUser.condition) {
            if (!molangCalculate(eventUser.condition, option)) {
                return;
            }
        }
        if (eventUser.trigger) {
            emitEvent(eventUser.trigger.event, option);
        }
        let pos = new Vector3(option.triggerEntity.location);
        // let posStr = pos.toArray().join(" ")
        if (eventUser.run_command) {
            for (let cmd of eventUser.run_command.command) {
                if (eventUser.run_command.target == "other" && option.hurtedEntity) {
                    option.hurtedEntity.runCommand(`${cmd}`);
                } else {
                    option.triggerEntity.runCommand(`${cmd}`);
                }
            }
        }
        if (eventUser.play_sound) {
            option.triggerEntity.dimension.playSound(eventUser.play_sound.sound, pos);
        }

        if (eventUser.shoot) {
            let proj = (idEntityMap.get(eventUser.shoot.projectile) as any)?.["minecraft:entity"]?.["components"]?.['minecraft:projectile'];
            let power = proj?.['power']
            let uncertaintyBase = proj?.['uncertaintyBase']
            ExEntity.getInstance(option.triggerEntity).shootProj(eventUser.shoot.projectile, {
                "speed": (eventUser.shoot.launch_power ?? 1) *
                    (power ?? 1),
                "uncertainty": uncertaintyBase ?? 0
            });
        }
        if (eventUser.damage) {
            let damageComp = option.triggerItem.getComponent("durability");
            if (damageComp && !(option.triggerEntity instanceof Player && option.triggerEntity.getGameMode() == GameMode.Creative)) {
                let bag = ExEntity.getInstance(option.triggerEntity).getBag();
                let damage = damageComp.damage;
                damage += eventUser.damage.amount;
                if (damage >= damageComp.maxDurability) {
                    bag.clearItem(option.triggerItem.typeId, 1);
                } else {
                    damageComp.damage = damage;
                    bag.itemOnMainHand = option.triggerItem;
                }
            }

        }
        if (eventUser.add_mob_effect) {
            if (eventUser.add_mob_effect.target == "other" && option.hurtedEntity) {
                option.hurtedEntity.addEffect(eventUser.add_mob_effect.effect, eventUser.add_mob_effect.duration * 20, {
                    "amplifier": eventUser.add_mob_effect.amplifier
                });
            } else {
                option.triggerEntity.addEffect(eventUser.add_mob_effect.effect, eventUser.add_mob_effect.duration * 20, {
                    "amplifier": eventUser.add_mob_effect.amplifier
                });
            }
        }

        if (eventUser.script && option.triggerEntity instanceof Player) {
            ExGame.postMessageBetweenClient(option.triggerEntity, PomServer, eventUser.script.output, eventUser.script.args ?? [])
        }
    }
    if (eventUser.sequence) {
        handleSequenceEventUser(eventUser.sequence, option);
    }
    if (eventUser.randomize) {
        handleRandomizeEventUser(eventUser.randomize, option);
    }
}

function handleSequenceEventUser(eventUser: SequenceEventUser, option: TriggerOption) {
    for (let i of eventUser) {
        handleEventUser(i, option);
    }
}
function handleRandomizeEventUser(eventUser: RandomizeEventUser, option: TriggerOption) {
    let pool: number[] = [];
    let base = 0;
    let sum = eventUser.reduce((a, b) => a + b.weight, 0);
    let rand = Math.random();
    for (let i of eventUser) {
        pool.push(base + i.weight / sum);
        base += i.weight / sum;
    }
    let index = 0;
    while (rand > pool[index] && index < pool.length - 1) {
        index++;
    }
    handleEventUser(eventUser[index], option);
}



export default (context: ExContext) => {
    for (let fpath of fileProvider.listAll("ex_items")) {
        let f = fileProvider.get(fpath)!;
        idItemMap.set(((f["minecraft:item"] as JSONObject).description as JSONObject).identifier as string, f);
    }
    for (let fpath of fileProvider.listAll("ex_blocks")) {
        let f = fileProvider.get(fpath)!;
        idBlockMap.set(((f["minecraft:block"] as JSONObject).description as JSONObject).identifier as string, f);
    }
    for (let fpath of fileProvider.listAll("entities")) {
        let f = fileProvider.get(fpath)!;
        if (f) {
            idEntityMap.set(((f["minecraft:entity"] as JSONObject).description as JSONObject).identifier as string, f);
        } else {
            console.warn(fpath);
        }
    }
    world.afterEvents.worldLoad.subscribe(initEvent => {
        initEvent.blockComponentRegistry.registerCustomComponent(ex(onStepOnCompName), {
            onStepOn: e => {
                if (e.entity) {
                    let option = { triggerBlock: e.block, triggerEntity: e.entity, triggerType: onStepOnCompName };
                    const triggerComp = findTriggerComp(option) as onStepOnCompType | undefined;
                    if (triggerComp) {
                        emitEvent(triggerComp.event, option);
                    }
                }
            }
        });
        initEvent.blockComponentRegistry.registerCustomComponent(ex(onInteractCompName), {
            onPlayerInteract: e => {
                if (e.player) {
                    let option = { triggerBlock: e.block, triggerEntity: e.player, triggerType: onInteractCompName };
                    const triggerComp = findTriggerComp(option) as onInteractCompType | undefined;
                    if (triggerComp &&
                        (triggerComp.condition ? molangCalculate(triggerComp.condition, option) : true)
                    ) {
                        emitEvent(triggerComp.event, option);
                    }
                }
            }
        });
        initEvent.blockComponentRegistry.registerCustomComponent(ex(onPlayerPlacingCompName), {
            onPlace: e => {
                if (e) {
                    let players = e.block.dimension.getPlayers({
                        "maxDistance": 5,
                        "closest": 1,
                        "location": e.block.location
                    });

                    let option = { triggerBlock: e.block, triggerType: onPlayerPlacingCompName, triggerEntity: players.length > 0 ? players[0] : undefined };
                    const triggerComp = findTriggerComp(option) as onPlayerPlacingCompType | undefined;
                    if (triggerComp) {
                        emitEvent(triggerComp.event, option);
                    }
                }
            }
        });
        initEvent.blockComponentRegistry.registerCustomComponent(ex(onPlayerDestroyedCompName), {
            onPlayerDestroy: e => {
                if (e) {
                    let option = { triggerBlock: e.block, triggerEntity: e.player, triggerType: onPlayerDestroyedCompName };
                    const triggerComp = findTriggerComp(option) as onPlayerDestroyedCompType | undefined;
                    if (triggerComp) {
                        emitEvent(triggerComp.event, option);
                    }
                }
            }
        });
        initEvent.blockComponentRegistry.registerCustomComponent(ex(tickingCompName), {
            onTick: e => {
                if (e) {
                    let option = { triggerBlock: e.block, triggerType: tickingCompName };
                    const triggerComp = findTriggerComp(option) as tickingCompType | undefined;
                    if (triggerComp) {
                        emitEvent(triggerComp.on_tick.event, option);
                    }
                }
            }
        });
        initEvent.blockComponentRegistry.registerCustomComponent(ex(randomTickingCompName), {
            onRandomTick: e => {
                if (e) {
                    let option = { triggerBlock: e.block, triggerType: randomTickingCompName }
                    const triggerComp = findTriggerComp(option) as randomTickingCompType | undefined;
                    if (triggerComp) {
                        emitEvent(triggerComp.on_tick.event, option);
                    }
                }
            }
        });
    });

    let useMap = new WeakMap<Player, TickDelayTask>();

    world.afterEvents.itemStopUse.subscribe(e => {
        if (useMap.has(e.source)) {
            useMap.get(e.source)!.stop();
            useMap.delete(e.source);
        }
    });
    world.afterEvents.entityDie.subscribe(e => {
        if (e.deadEntity instanceof Player) {
            useMap.get(e.deadEntity)?.stop();
            useMap.delete(e.deadEntity);
        }
    });
    world.afterEvents.itemStartUse.subscribe(e => {
        const player = e.source;
        const item = e.itemStack;
        lastSelectItemSlot.set(player, [player.selectedSlotIndex, item.typeId]);
        if (e) {
            let tryUse = (category?: string, cooldown?: number) => {
                let option = { triggerItem: item, triggerEntity: player, triggerType: onUseCompName }
                const triggerComp = findTriggerComp(option) as onUseCompType | undefined;
                if (category && cooldown) {
                    player.startItemCooldown(category, cooldown);
                }
                if (triggerComp) {
                    return emitEvent(triggerComp.on_use.event, option);
                }
            }
            let cooling = findTriggerComp({ triggerItem: e.itemStack, triggerEntity: e.source, triggerType: "cooldown" }) as JSONObject | undefined;
            if (cooling) {
                let cate = cooling.category as string;
                let duration = cooling.duration as number;
                if (duration * 20 - 1 == player.getItemCooldown(cate)) {
                    tryUse();
                    useMap.set(player, ExSystem.tickTask(context, () => {
                        if (!tryUse(cate, Math.floor(duration * 20))) {
                            useMap.get(player)?.startOnce();
                        } else {
                            useMap.delete(player);
                        }
                    }).delay(Math.ceil(duration * 20)).startOnce());
                }
            } else {
                tryUse();
                useMap.set(player, ExSystem.tickTask(context, () => {
                    tryUse();
                }).delay(5).start());
            }
        }
    });

    world.afterEvents.entityHitEntity.subscribe(e => {
        if (!(e.damagingEntity instanceof Player)) return;
        let item = ExPlayer.getInstance(e.damagingEntity).getBag().itemOnMainHand;
        lastSelectItemSlot.set(e.damagingEntity, [e.damagingEntity.selectedSlotIndex, item?.typeId ?? '']);
        if (e) {
            let option = { triggerItem: item, triggerEntity: e.damagingEntity, triggerType: weaponCompName, hurtedEntity: e.hitEntity }
            const triggerComp = findTriggerComp(option) as weaponCompType | undefined;
            if (triggerComp && triggerComp.on_hurt_entity) {
                emitEvent(triggerComp.on_hurt_entity.event, option);
            }
        }
    });
    world.afterEvents.entityHitBlock.subscribe(e => {
        if (!(e.damagingEntity instanceof Player)) return;
        let item = ExPlayer.getInstance(e.damagingEntity).getBag().itemOnMainHand;
        lastSelectItemSlot.set(e.damagingEntity, [e.damagingEntity.selectedSlotIndex, item?.typeId ?? '']);

        if (item) {
            let option = { triggerItem: item, triggerEntity: e.damagingEntity, triggerType: weaponCompName }
            const triggerComp = findTriggerComp(option) as weaponCompType | undefined;
            if (triggerComp && triggerComp.on_hit_block) {
                emitEvent(triggerComp.on_hit_block.event, option);
            }
        }
    });
    world.afterEvents.itemCompleteUse.subscribe(e => {
        lastSelectItemSlot.set(e.source, [e.source.selectedSlotIndex, e.itemStack.typeId]);
        if (e) {
            let option = { triggerItem: e.itemStack, triggerEntity: e.source, triggerType: chargeableCompName }
            const triggerComp = findTriggerComp(option) as chargeableCompType | undefined;
            if (triggerComp) {
                emitEvent(triggerComp.on_complete.event, option);
            }
        }
    });
    world.afterEvents.playerBreakBlock.subscribe(e => {
        lastSelectItemSlot.set(e.player, [e.player.selectedSlotIndex, e.itemStackBeforeBreak?.typeId ?? ""]);
        if (e.itemStackBeforeBreak) {
            let option = { triggerItem: e.itemStackBeforeBreak, triggerEntity: e.player, triggerType: diggerCompName }
            const triggerComp = findTriggerComp(option) as diggerCompType | undefined;
            if (triggerComp) {
                emitEvent(triggerComp.on_dig.event, option);
            }
        }
    });
    world.afterEvents.itemStopUse.subscribe(e => {
        if (e.useDuration > 0) return;
        if (e.itemStack) {
            lastSelectItemSlot.set(e.source, [e.source.selectedSlotIndex, e.itemStack.typeId]);
            let option = { triggerItem: e.itemStack, triggerEntity: e.source, triggerType: foodCompName }
            const triggerComp = findTriggerComp(option) as foodCompType | undefined;
            if (triggerComp) {
                emitEvent(triggerComp.on_consume.event, option);
            }
            if (triggerComp?.using_converts_to) {
                ExPlayer.getInstance(e.source).getBag().itemOnMainHand = new ItemStack(triggerComp.using_converts_to);
            }
        }
    });
}