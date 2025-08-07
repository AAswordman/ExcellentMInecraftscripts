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

import { Status } from './EpicStatus.js';

export class StatusManager {

 private statusList: Status[] = [];
 public owner: ExEntity

    constructor(owner: ExEntity) {
        this.owner = owner;
    }

    public addStatus(status: Status): void {
        this.statusList.push(status);
        this.owner.runCommand("/say 添加毒") 
    }

    public removeStatus(status: Status): void {
        const index = this.statusList.indexOf(status);
        if (index > -1) {
            this.statusList.splice(index, 1);
        }
    }

    public update(deltaTime: number): void {
        for (let i = this.statusList.length - 1; i >= 0; i--) {
            const s = this.statusList[i];
            s.update(deltaTime);

            if (s.isExpired()) {
                this.removeStatus(s);
            }
        }
    }
}
