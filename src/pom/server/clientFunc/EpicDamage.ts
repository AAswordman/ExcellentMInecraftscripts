import { EntityDamageCause, ItemType, ItemStack, ItemTypes, MinecraftDimensionTypes, BiomeType, BiomeTypes, Entity, MolangVariableMap, world, EntityHealthComponent, EntityComponentTypes, EnchantmentTypes, Player, GameMode, Effect } from '@minecraft/server';
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
  rangeSector(user : Entity , point : Vector3, r : number, h : number, angle : number , dis : number) {
        let view = new Vector3(user.getViewDirection());
        let q = new ExEntityQuery(user.dimension)
            .at(point)
            .facingByDirection(view,dis)
            .querySector(r, h, view, angle, 0, {
                excludeTags:["wbmsyh"],
                excludeTypes: ["item"]
            })
            .except(user)
        return q.getEntities();
     }
  rangeCircle(user : Entity , point : Vector3, r : number, h : number , dis : number) {
      let view = new Vector3(user.getViewDirection());
      let q = new ExEntityQuery(user.dimension)
          .at(point)
          .facingByDirection(view,dis) 
          .queryCircle(r, h,{
              excludeTags:["wbmsyh"],
              excludeTypes: ["item"]
          })
          .except(user)
          
      return q.getEntities();
   }
  rangeBall(user : Entity , point : Vector3, r : number , dis : number) {
      let view = new Vector3(user.getViewDirection());
      let q = new ExEntityQuery(user.dimension).at(point)
          .at(point)
          .facingByDirection(view,dis)
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

      let sharpness = this.getEnchantLevel("sharpness");
      let atk = base_atk + sharpness * 1.25;
      switch (name) {
        case "epic:echoing_scream_saber":
          {
          //主目标倍率zzbcasd
          const dam1 = 1.25* atk
          //副目标倍率
          const dam2 = 0.5 * atk
          this.runTimeout(() => {
            const loc = new Vector3(target.location)
            const face = new Vector3(target.getViewDirection());
            for (let entity of this.rangeBall(this.player,loc,1.25,0)) { 
              try {
                let targetLoc = new Vector3(entity.location)
                let echoRecord = Number(entity.getDynamicProperty('echo_record')) || 0;
                let Dam = (entity === target) ? dam1 : dam2;
                //回声印记增伤
                Dam *= (1 + 0.1 * echoRecord)
                  entity.applyDamage(Dam, {
                    "cause": EntityDamageCause.contact,
                    "damagingEntity": this.player
                  });
                if (entity === target && echoRecord < 10) {
                  echoRecord += 1;
                  entity.setDynamicProperty('echo_record', echoRecord);
                }
                if (entity === target && echoRecord > 0) {
                  this.spawnPar("epic:echo_record_" + echoRecord,targetLoc, new Vector3(0,0,0))
                }
              } 
              catch (entity) {}
            }
          }, 0);
        }
        break;
        case "epic:wither_sword":
        {
          //倍率
          const dam1 = 1.0* atk;
          this.runTimeout(() => {
            const loc = new Vector3(target.location)
            const face = new Vector3(target.getViewDirection());
            const lv = target.getEffect("wither")?.amplifier || 0;
            const dur = target.getEffect("wither")?.duration || 0;
            if (dur > 0) {
            let s = dur + 6 * 20;
            target.addEffect("wither",s,{"amplifier": 1,"showParticles":true})
            }
            else
            {
            target.addEffect("wither",6 * 20,{"amplifier": 1,"showParticles":true})
            }
          }, 0);
          
        }
        break
    }
    }
    });
    
    this.getEvents().exEvents.beforeItemUse.subscribe(event => {
      const item = event.itemStack; 
      const wbfl = this.exPlayer.getScoresManager().getScore("wbfl");

      if (this.isHoldingItem("epic:echoing_scream_saber")) {
        let cd = this.getCd(item);
        const tmpV = new Vector3();
        const base_atk = this.getAttack(item);
        const sharpness = this.getEnchantLevel("sharpness");
        const atk = base_atk + sharpness * 1.25;
        //let eff_atk = base_atk*(1.25^strength)/(1.25^weakness)
        //重击
        if (cd == 0 && this.player.isSneaking == false) {
          //切割倍率200%+5
          const dam1 = 1.5 * atk + 4;
          //回声爆破伤害35（法术）
          const dam2 = 35;
          const loc = new Vector3(this.player.location);
          const face = new Vector3(this.player.getViewDirection());
          let shock_entity : Entity[] = [];
          //第一段切割
          this.runTimeout(() => {
            //this.exPlayer.getScoresManager().removeScore("wbfl", 25);
            this.player.startItemCooldown("saber", 2 * 20);
            for (let entity of this.rangeSector(this.player,loc,4,2.5,30,-0.5)) {
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
                    entity.setDynamicProperty('echo_record', echoRecord-3);
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
             //this.getDimension().playSound("mob.warden.sonic_charge",targetloc,{"volume":50});

            this.runTimeout(() => {
            for (let entity of this.rangeBall(this.player,targetloc,3.5,0)) {
              try {
                let targetloc = new Vector3(target.location);
                  let echoRecord = Number(entity.getDynamicProperty('echo_record')) || 0;
                  if (entity === target) {
                    this.spawnPar("minecraft:critical_hit_emitter",targetloc,new Vector3(0,1.8,0))
                    this.getDimension().playSound("mob.warden.sonic_boom",targetloc,{"volume":50});
                  }
                  let Dam = (entity === target) ? dam2 : (0.5 * dam2);
                  entity.applyDamage(Dam, {
                    "cause": EntityDamageCause.magic,
                    "damagingEntity": this.player
                  });
                  let direction = tmpV.set(entity.location).sub(this.player.location).normalize();
                  entity.applyKnockback(direction.x, direction.z, 1.0, 0.5);
              }
              catch (e) { }
            }
            },400);
          }
        },800);
      }
        if (cd == 0 && this.player.isSneaking) {
          const dam1 = 2.25 * atk + 4;
          let dam2 = 10;
          const loc = new Vector3(this.player.location);
          const face = new Vector3(this.player.getViewDirection());
          let locFin = new Vector3(loc.x+face.x*2,loc.y+face.y*2,loc.z+face.z*2)
          let shock_entity : Entity[] = [];
          //第一段切割
          this.runTimeout(() => {
            //this.exPlayer.getScoresManager().removeScore("wbfl", 25);
            this.player.startItemCooldown("saber", 5 * 20);
            for (let entity of this.rangeBall(this.player,loc,2.5,2)) {
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
                  entity.applyKnockback(direction.x, direction.z, 0.5, 0.2);
                  if (echoRecord >= 5) {
                    shock_entity.push(entity);
                    entity.addEffect("slowness",4 * 20,
                      {
                        "amplifier": 5,
                        "showParticles": false
                      })
                  }
                }
              catch (e) { }
            }
            }, 0);
            this.runTimeout(() => {
              for (let target of shock_entity) {
              let tloc = new Vector3(target.location);
              const targetloc = tloc as Vector3;
              let echoRecord = Number(target.getDynamicProperty('echo_record')) || 0;
              const TimeLine = ExSystem.timeLine(this, {
                "0.1": (time) => { 
                  this.getDimension().playSound("mob.warden.sonic_charge",targetloc,{"volume":1,"pitch":2.5});
                 },

                "0.5": (time) => { 
                  this.spawnPar("epic:echoing_scream_saber_particle3",targetloc,new Vector3(0,0,0));
                 },
                "0.65": (time) => { 
                  this.getDimension().playSound("mob.warden.dig",targetloc,{"volume":0.8,"pitch":2.0});
                 },
                "1.0": (time) => {
                  this.spawnPar("minecraft:critical_hit_emitter",targetloc,new Vector3(0,1.8,0));
                  this.getDimension().playSound("item.trident.thunder",targetloc,{"volume":2.0,"pitch":1.5});
                  this.getDimension().playSound("item.trident.thunder",loc,{"volume":1.0,"pitch":3});
                 },
                "1.1": (time) => {
                  this.player.runCommand("/camerashake add @s 0.4 0.08 rotational");
                  this.player.runCommand("/camerashake add @s 1.5 0.15 positional");
                },
                "1.2": (time) => {
                  try {
                    let Dam = ((echoRecord>5) ? dam2 + 2*(echoRecord-5) : dam2)*echoRecord;
                    target.applyDamage(Dam, {
                      "cause": EntityDamageCause.magic,
                      "damagingEntity": this.player
                    });
                    target.setDynamicProperty('echo_record', 0);
                 }
                 catch (e) { }
                 },
                 "1.3": (time) => {
                  this.getDimension().playSound("item.trident.thunder",targetloc,{"volume":1.0,"pitch":2.0});
                 },
              });
              TimeLine.start();
            }
        },400);
      }
    }
  //End 
  });

  }
  onLoad(): void {
  }
  onLeave(): void {
  }

}