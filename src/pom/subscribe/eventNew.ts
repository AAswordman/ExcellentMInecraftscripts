import { world, BlockPermutation, Block, Player, Entity, ItemStack } from '@minecraft/server';
import { MinecraftBlockTypes } from '@minecraft/vanilla-data';
import { fileProvider, JSONObject } from '../../filepack/index.js';
import ExPlayer from '../../modules/exmc/server/entity/ExPlayer.js';
import Vector3 from '../../modules/exmc/utils/math/Vector3.js';
import ExEntity from '../../modules/exmc/server/entity/ExEntity.js';


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
}
const foodCompName = "food";





type onStepOnCompType = {
    "target": string,
    "event": string
}
const onStepOnCompName = "on_step_on";

type onInteractCompType = {
    "condition": string,
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

function molangCalculate(molang: string, option: TriggerOption) {
    molang = molang.replace(/q\./g, "query.");
    const query = {
        "block_state": (name: string) => {
            return option.triggerBlock?.permutation.getState(name);
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
        }
    }
    let res = eval("(" + molang + ")");
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
        launch_power: number;
    }

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
                per = per.withState(i, molangCalculate(eventUser.set_block_state[i], option));
            }
            option.triggerBlock.setPermutation(per);
        }
        if (eventUser.set_block) {
            option.triggerBlock.transTo(eventUser.set_block.block_type);
        }
        if (eventUser.add_mob_effect && option.triggerEntity) {
            option.triggerEntity.addEffect(eventUser.add_mob_effect.effect, eventUser.add_mob_effect.duration * 20, {
                "amplifier": eventUser.add_mob_effect.amplifier
            });
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
            ExEntity.getInstance(option.triggerEntity).shootProj(eventUser.shoot.projectile, {
                "speed": eventUser.shoot.launch_power
            });
        }
        if (eventUser.damage) {
            let damageComp = option.triggerItem.getComponent("durability");
            if (damageComp) damageComp.damage += eventUser.damage.amount;
            ExEntity.getInstance(option.triggerEntity).getBag().itemOnMainHand;
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

const idBlockMap = new Map<string, JSONObject>();
const idItemMap = new Map<string, JSONObject>();

export default () => {
    for (let fpath of fileProvider.listAll("ex_items")) {
        let f = fileProvider.get(fpath)!;
        idItemMap.set(((f["minecraft:item"] as JSONObject).description as JSONObject).identifier as string, f);
    }
    for (let fpath of fileProvider.listAll("ex_blocks")) {
        let f = fileProvider.get(fpath)!;
        idBlockMap.set(((f["minecraft:block"] as JSONObject).description as JSONObject).identifier as string, f);
    }
    world.beforeEvents.worldInitialize.subscribe(initEvent => {
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
                    if (triggerComp && molangCalculate(triggerComp.condition, option)) {
                        emitEvent(triggerComp.event, option);
                    }
                }
            }
        });
        initEvent.blockComponentRegistry.registerCustomComponent(ex(onPlayerPlacingCompName), {
            onPlace: e => {
                if (e) {
                    let option = { triggerBlock: e.block, triggerType: onPlayerPlacingCompName };
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
    world.afterEvents.itemUse.subscribe(e => {
        if (e) {
            let option = { triggerItem: e.itemStack, triggerEntity: e.source, triggerType: onUseCompName }
            const triggerComp = findTriggerComp(option) as onUseCompType | undefined;
            if (triggerComp) {
                emitEvent(triggerComp.on_use.event, option);
            }
        }
    });
    world.afterEvents.entityHitEntity.subscribe(e => {
        if (!(e.damagingEntity instanceof Player)) return;
        let item = ExPlayer.getInstance(e.damagingEntity).getBag().itemOnMainHand;
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
        if (item) {
            let option = { triggerItem: item, triggerEntity: e.damagingEntity, triggerType: weaponCompName }
            const triggerComp = findTriggerComp(option) as weaponCompType | undefined;
            if (triggerComp && triggerComp.on_hit_block) {
                emitEvent(triggerComp.on_hit_block.event, option);
            }
        }
    });
    world.afterEvents.itemCompleteUse.subscribe(e => {
        if (e) {
            let option = { triggerItem: e.itemStack, triggerEntity: e.source, triggerType: chargeableCompName }
            const triggerComp = findTriggerComp(option) as chargeableCompType | undefined;
            if (triggerComp) {
                emitEvent(triggerComp.on_complete.event, option);
            }
        }
    });
    world.afterEvents.playerBreakBlock.subscribe(e => {
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
            let option = { triggerItem: e.itemStack, triggerEntity: e.source, triggerType: foodCompName }
            const triggerComp = findTriggerComp(option) as foodCompType | undefined;
            if (triggerComp) {
                emitEvent(triggerComp.on_consume.event, option);
            }
        }

    });
}