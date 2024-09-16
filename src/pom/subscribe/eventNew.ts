import { world, BlockPermutation, Block, Player, Entity } from '@minecraft/server';
import { MinecraftBlockTypes } from '@minecraft/vanilla-data';
import { fileProvider, JSONObject } from '../../filepack/index.js';
import ExPlayer from '../../modules/exmc/server/entity/ExPlayer.js';


const ex = (name: string) => "ex:" + name;
const minecraft = (name: string) => "minecraft:" + name;
const fnamespace = (name: string) => name.split(":").slice(1).join(":");

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

function molangCalculate(molang: string, triggerBlock: Block, triggerEntity: Entity | undefined) {
    molang = molang.replace(/q\./g, "query.");
    const query = {
        "block_state": (name: string) => {
            return triggerBlock.permutation.getState(name);
        },
        "get_equipped_item_name": (pos: string) => {
            if (triggerEntity && triggerEntity instanceof Player) {
                switch (pos) {
                    case "main_hand":
                        return fnamespace(ExPlayer.getInstance(triggerEntity).getBag().itemOnMainHand?.typeId ?? ":");
                    case "off_hand":
                        return fnamespace(ExPlayer.getInstance(triggerEntity).getBag().itemOnOffHand?.typeId ?? ":");
                    default:
                        return "";
                }
            } else {
                return "";
            }
        }
    }
    console.warn(molang);
    let res = eval("(" + molang + ")");
    return res;
}


function findTriggerComp(triggerBlock: Block, triggerEntity: Entity | undefined, triggerType: string) {
    if (idMap.has(triggerBlock.typeId)) {
        const block = idMap.get(triggerBlock.typeId)!["minecraft:block"] as JSONObject;

        const comp = { ...(block.components as JSONObject ?? {}) }
        if ("permutations" in block) {
            for (let part of block.permutations as JSONObject[]) {
                if (molangCalculate(part.condition as string, triggerBlock, triggerEntity)) {
                    const partComp = part.components as JSONObject
                    for (let key in partComp) {
                        comp[key] = partComp[key]
                    }
                }
            }
        }
        const result = comp[minecraft(triggerType)];
        return result as JSONObject | undefined;
    }
    return undefined;
}

type MinecraftUniformEvent = {

}

function emitEvent(eventName: string, triggerBlock: Block, triggerEntity: Entity | undefined) {
    if (idMap.has(triggerBlock.typeId)) {
        const block = idMap.get(triggerBlock.typeId)!["minecraft:block"] as JSONObject;

        const events = (block.events as JSONObject ?? {});
        const event = events[eventName];
        if (event) {
            console.warn("event:" + eventName)
        }
    }
    return undefined;
}

const idMap = new Map<string, JSONObject>();

export default () => {
    for (let fpath of fileProvider.listAll("ex_blocks")) {
        let f = fileProvider.get(fpath)!;
        idMap.set(((f["minecraft:block"] as JSONObject).description as JSONObject).identifier as string, f);
    }
    world.beforeEvents.worldInitialize.subscribe(initEvent => {
        initEvent.blockComponentRegistry.registerCustomComponent(ex(onStepOnCompName), {
            onStepOn: e => {
                if (e.entity) {
                    const triggerComp = findTriggerComp(e.block, e.entity, onStepOnCompName) as onStepOnCompType | undefined;
                    if (triggerComp) {
                        emitEvent(triggerComp.event, e.block, e.entity);
                    }
                }
            }
        });
        initEvent.blockComponentRegistry.registerCustomComponent(ex(onInteractCompName), {
            onPlayerInteract: e => {
                if (e.player) {
                    const triggerComp = findTriggerComp(e.block, undefined, onInteractCompName) as onInteractCompType | undefined;
                    if (triggerComp && molangCalculate(triggerComp.condition, e.block, e.player)) {
                        emitEvent(triggerComp.event, e.block, e.player);
                    }
                }
            }
        });
        initEvent.blockComponentRegistry.registerCustomComponent(ex(onPlayerPlacingCompName), {
            onPlace: e => {
                if (e) {
                    const triggerComp = findTriggerComp(e.block, undefined, onPlayerPlacingCompName) as onPlayerPlacingCompType | undefined;
                    if (triggerComp) {
                        emitEvent(triggerComp.event, e.block, undefined);
                    }
                }
            }
        });
        initEvent.blockComponentRegistry.registerCustomComponent(ex(onPlayerDestroyedCompName), {
            onPlayerDestroy: e => {
                if (e) {
                    const triggerComp = findTriggerComp(e.block, e.player, onPlayerDestroyedCompName) as onPlayerDestroyedCompType | undefined;
                    if (triggerComp) {
                        emitEvent(triggerComp.event, e.block, e.player);
                    }
                }
            }
        });
        initEvent.blockComponentRegistry.registerCustomComponent(ex(tickingCompName), {
            onTick: e => {
                if (e) {
                    const triggerComp = findTriggerComp(e.block, undefined, tickingCompName) as tickingCompType | undefined;
                    if (triggerComp) {
                        emitEvent(triggerComp.on_tick.event, e.block, undefined);
                    }
                }
            }
        });
        initEvent.blockComponentRegistry.registerCustomComponent(ex(randomTickingCompName), {
            onRandomTick: e => {
                if (e) {
                    const triggerComp = findTriggerComp(e.block, undefined, randomTickingCompName) as randomTickingCompType | undefined;
                    if (triggerComp) {
                        emitEvent(triggerComp.on_tick.event, e.block, undefined);
                    }
                }
            }
        });
    });
}