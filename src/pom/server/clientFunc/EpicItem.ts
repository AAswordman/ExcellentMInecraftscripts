import { EntityDamageCause, ItemType, ItemStack, ItemTypes, MinecraftDimensionTypes, BiomeType, BiomeTypes, Entity, MolangVariableMap, world, EntityHealthComponent, EntityComponentTypes, EnchantmentTypes, Player, GameMode } from '@minecraft/server';
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

export default class EpicItemUse extends GameController {

  getItem(): ItemStack | undefined {
    return this.exPlayer.getBag().itemOnMainHand;
  }
  isHoldingItem(id: string): boolean {
    const item = this.getItem();
    return item?.typeId === id;
  }
  getEnchantLevel(id : string): number {
    const item = this.getItem();
    return item?.getComponentById("minecraft:enchantable")!.getEnchantment(id)?.level || 0;
  }
  getAttack(item : ItemStack | undefined): number {
    if (item != undefined)
    {
    const comp = new ItemTagComponent(item);
    return comp?.getComponentWithGroup("base_attack")+1;
    }
    else
    return 1
  }
  hasItemTag<T extends (keyof ItemTagComponentType)>(item : ItemStack,key: T): boolean {
    const comp = new ItemTagComponent(item);
    return comp?.hasComponent(key);
  }
  getCd(item : ItemStack): number {
    return this.player.getItemCooldown(item.getComponent('minecraft:cooldown')!.cooldownCategory);
  }
  getHealthComp(entity : Entity): EntityHealthComponent {
    return entity.getComponent(EntityComponentTypes.Health) as EntityHealthComponent;
  }
  rangeSector(user : Entity , point : Vector3, r : number, h : number, angle : number) {
        let view = new Vector3(user.getViewDirection());
        let q = new ExEntityQuery(user.dimension).at(point)
            .querySector(r, h, view, angle, 0, {
                excludeTags:["wbmsyh"],
                excludeTypes: ["item"]
            })
            .except(user)
        return q.getEntities();
     }
  rangeCircle(user : Entity , point : Vector3, r : number, h : number) {
      let q = new ExEntityQuery(user.dimension).at(point)
          .queryCircle(r, h,{
              excludeTags:["wbmsyh"],
              excludeTypes: ["item"]
          })
          .except(user)
      return q.getEntities();
   }
  rangeBall(user : Entity , point : Vector3, r : number) {
      let q = new ExEntityQuery(user.dimension).at(point)
          .queryBall(r, {
              excludeTags:["wbmsyh"],
              excludeTypes: ["item"]
          })
          .except(user)
      return q.getEntities();
   }
  applyDam(user : Player , target : Entity[] ,delay : number){
  }
  spawnPar(id : string , loc : Vector3 , offset ?: Vector3){
    let finloc = loc
    if (offset) {
      finloc = loc.add(offset)
    }
    this.getDimension().spawnParticle(id, finloc)
  }
  onJoin(): void {

    this.getEvents().exEvents.afterPlayerHitEntity.subscribe(event => {
      const item = this.getItem(); 
      const name = item?.typeId
      const target = event.hurtEntity;
      const wbfl = this.exPlayer.getScoresManager().getScore("wbfl");
     if(event.damageSource.cause === EntityDamageCause.entityAttack){
      const base_atk = this.getAttack(item);
      switch (name) {
        case "epic:echoing_scream_saber":
          const sharpness = this.getEnchantLevel("sharpness");
          const atk = base_atk + sharpness * 1.25;
          //主目标倍率
          const dam1 = 1.5 * atk
          //副目标倍率
          const dam2 = 0.5 * atk
          this.runTimeout(() => {
            const loc = new Vector3(target.location)
            for (let entity of this.rangeBall(this.player,loc,1.5)) { 
              try {
                let echoRecord = Number(entity.getDynamicProperty('echo_record')) || 0;
                let Dam = (entity === target) ? dam1 : dam2;
                //回声印记增伤
                Dam *= (1 + 0.1 * echoRecord)
                entity.applyDamage(Dam, {
                  "cause": EntityDamageCause.contact,
                  "damagingEntity": this.player
                });
                if (entity === target && echoRecord < 10) {
                  entity.setDynamicProperty('echo_record', echoRecord + 1);
                }
              } 
              catch (entity) {}
            }
          }, 0);
        break;
    }
    }
    });
    
    this.getEvents().exEvents.beforeItemUse.subscribe(event => {
      const item = event.itemStack; 
      const wbfl = this.exPlayer.getScoresManager().getScore("wbfl");

      if (this.isHoldingItem("epic:echoing_scream_saber")) {
        let cd = this.getCd(item);
        if (cd == 0) {
          const tmpV = new Vector3();
          const base_atk = this.getAttack(item);
          const sharpness = this.getEnchantLevel("sharpness");
          const atk = base_atk + sharpness * 1.25;
          //let eff_atk = base_atk*(1.25^strength)/(1.25^weakness)
          //切割倍率
          const dam1 = 2.0 * atk + 5;
          //回声爆破伤害（法术）
          const dam2 = 30;
          const loc = new Vector3(this.player.location);
          let shock_entity : Entity[] = [];
          //第一段切割
          this.runTimeout(() => {
            //this.exPlayer.getScoresManager().removeScore("wbfl", 25);
            this.player.startItemCooldown("saber", 2 * 20);
            for (let entity of this.rangeSector(this.player,loc,4.5,3,60)) {
              try {
                  let Dam = dam1
                  let echoRecord = Number(entity.getDynamicProperty('echo_record')) || 0;
                  //回声印记增伤
                  Dam *= (1 + 0.1 * echoRecord)
                  entity.applyDamage(Dam, {
                    "cause": EntityDamageCause.contact,
                    "damagingEntity": this.player
                  });
                  let direction = tmpV.set(entity.location).sub(this.player.location).normalize();
                  entity.applyKnockback(direction.x, direction.z, 1, 0.5);
                  if (echoRecord >= 3) {
                    entity.setDynamicProperty('echo_record', 0);
                    shock_entity.push(entity);
                    entity.addEffect("slowness",2 * 20,
                      {
                        "amplifier": 3,
                        "showParticles": false
                      })
                  }
                }
              catch (e) { }
            }
            }, 0);
            //二段引爆
            this.runTimeout(() => {
            for (let target of shock_entity) {
            let targetloc = new Vector3(target.location);
             this.spawnPar("minecraft:sonic_explosion",targetloc,new Vector3(0.1,0.6,0.1));
             this.spawnPar("minecraft:sonic_explosion",targetloc,new Vector3(0,0.4,0));
             this.spawnPar("minecraft:sonic_explosion",targetloc,new Vector3(-0.1,0.2,-0.1));
             this.runTimeout(() => {
            for (let entity of this.rangeBall(this.player,targetloc,3)) {
              try {
                  let echoRecord = Number(entity.getDynamicProperty('echo_record')) || 0;
                  if (entity === target) {
                    this.spawnPar("minecraft:critical_hit_emitter",targetloc,new Vector3(0,1.8,0))
                    this.getDimension().playSound("mob.warden.sonic_boom",target.location,{"volume":50});
                  }
                  let Dam = (entity === target) ? dam2 : (0.5 * dam2);
                  entity.applyDamage(Dam, {
                    "cause": EntityDamageCause.magic,
                    "damagingEntity": this.player
                  });
                  let direction = tmpV.set(entity.location).sub(this.player.location).normalize();
                  entity.applyKnockback(direction.x, direction.z, 1, 0.5);
              }
              catch (e) { }
            }
          },400)
        }
        },800);
        }      
      }
    });

  }
  onLoad(): void {
  }
  onLeave(): void {
  }

}