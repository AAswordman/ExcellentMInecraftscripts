import { EntityDamageCause, ItemType, ItemStack, ItemTypes, BiomeType, BiomeTypes, Entity, MolangVariableMap, world, EntityHealthComponent, EntityComponentTypes, EnchantmentTypes, Player, GameMode, Effect } from '@minecraft/server';
import { ModalFormData } from "@minecraft/server-ui";
import Vector3 from '../../../modules/exmc/utils/math/Vector3.js';
import ExDimension from '../../../modules/exmc/server/ExDimension.js';
import ExErrorQueue from '../../../modules/exmc/server/ExErrorQueue.js';
import menuFunctionUI from "../data/menuFunctionUI.js";
import MenuUIAlert from "../ui/MenuUIAlert.js";
import GameController from "./GameController.js";
import RuinsLoaction from '../serverFunc/ruins/RuinsLoaction.js';
import { MinecraftCameraPresetsTypes, MinecraftEffectTypes } from '../../../modules/vanilla-data/lib/index.js';
import { MinecraftBiomeTypes } from '../../../modules/vanilla-data/lib/index.js';
import ExEntity from '../../../modules/exmc/server/entity/ExEntity.js';
import ExSystem from '../../../modules/exmc/utils/ExSystem.js';
import TickDelayTask from '../../../modules/exmc/utils/TickDelayTask.js';
import { MinecraftEntityTypes } from '../../../modules/vanilla-data/lib/index.js';
import { falseIfError } from '../../../modules/exmc/utils/tool.js';
import ExEntityQuery from '../../../modules/exmc/server/env/ExEntityQuery.js';
import MathUtil from '../../../modules/exmc/utils/math/MathUtil.js';
import { TickEvent } from '../../../modules/exmc/server/events/events.js';
import ItemTagComponent, { ItemTagComponentType } from '../data/ItemTagComponent.js';
import { get } from 'http';
import { IVector3 } from '../../../modules/exmc/utils/math/Vector3';
import Vector2 from '../../../modules/exmc/utils/math/Vector2.js';

// Status.ts

export abstract class Status {
    public id: string;
    public duration: number; // 状态持续时间
    public elapsedTime: number = 0;

    constructor(id: string, duration: number) {
        this.id = id;
        this.duration = duration;
    }

    // 每帧调用，用于更新状态逻辑
    public abstract update(deltaTime: number): void;

    // 判断状态是否已经结束
    public isExpired(): boolean {
        return this.elapsedTime >= this.duration;
    }
}

export class PoisonStatus extends Status {
    private damagePerSecond: number;

    constructor(duration: number) {
        super("Poison", duration);
        this.damagePerSecond = 5;
    }

    public update(deltaTime: number): void {
        console.warn(`毒伤害：造成 ${this.damagePerSecond * deltaTime} 点伤害`);
        this.elapsedTime += deltaTime;
    }
}