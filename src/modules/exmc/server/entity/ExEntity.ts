import { Entity, EntityHealthComponent, EntityInventoryComponent, Dimension, EntityVariantComponent, EntityMarkVariantComponent, EntityIsBabyComponent, EntityIsChargedComponent, EntityDamageSource, EntityDamageCause, EquipmentSlot, TeleportOptions, EffectType, EntityAttributeComponent, EntityEquippableComponent, Vector, EntityProjectileComponent, ProjectileShootOptions } from '@minecraft/server';
import { ExCommandNativeRunner } from '../../interface/ExCommandRunner.js';
import ExTagManager from '../../interface/ExTagManager.js';
import ExScoresManager from './ExScoresManager.js';
import Vector3, { IVector3 } from '../../math/Vector3.js';
import ExEntityBag from './ExEntityBag.js';
import SetTimeOutSupport from '../../interface/SetTimeOutSupport.js';
import ExGameVector3 from '../math/ExGameVector3.js';
import ExCommand from '../env/ExCommand.js';
import ExDimension from '../ExDimension.js';
import Vector2, { IVector2 } from '../../math/Vector2.js';
import { AlsoInstanceType } from '../../utils/tool.js';
import { EntityMovementComponent } from '@minecraft/server';


const compId = {
    [EntityIsBabyComponent.componentId]: EntityIsBabyComponent,
    [EntityMarkVariantComponent.componentId]: EntityMarkVariantComponent,
    [EntityVariantComponent.componentId]: EntityVariantComponent,
    [EntityInventoryComponent.componentId]: EntityInventoryComponent,
    [EntityEquippableComponent.componentId]: EntityEquippableComponent,
    [EntityIsChargedComponent.componentId]: EntityIsChargedComponent,
    [EntityMovementComponent.componentId]: EntityMovementComponent,
    [EntityHealthComponent.componentId]: EntityHealthComponent
};
type CompId = typeof compId;

export default class ExEntity implements ExCommandNativeRunner, ExTagManager {
    public command = new ExCommand(this);

    public damage(d: number, source?: EntityDamageSource) {
        this.entity.applyDamage(d, source)
    }
    public causeDamageTo(e: Entity | ExEntity, d: number) {
        if (e instanceof ExEntity) e = e.entity;
        e.applyDamage(d, {
            "cause": EntityDamageCause.entityAttack,
            "damagingEntity": this.entity
        })
    }

    private _damage: number | undefined;
    getPreRemoveHealth() {
        return this._damage;
    }
    removeHealth(timeout: SetTimeOutSupport, damage: number) {
        if (this._damage === undefined) {
            this._damage = damage;
            timeout.setTimeout(() => {
                if (!this.entity.isValid()) return;
                let health = this.getComponent("minecraft:health")!;
                if (health.currentValue > 0) health.setCurrentValue(Math.max(0.5, health.currentValue - (this._damage ?? 0)));
                this._damage = undefined;
            }, 0);
        } else {
            this._damage += damage;
        }
    }
    addHealth(timeout: SetTimeOutSupport, n: number) {
        this.removeHealth(timeout, -n);
    }
    static propertyNameCache = "exCache";
    private _entity: Entity;

    public get nameTag(): string {
        return this._entity.nameTag;
    }
    public set nameTag(value: string) {
        this._entity.nameTag = value;
    }

    public get entity(): Entity {
        return this._entity;
    }
    public set entity(value: Entity) {
        this._entity = value;
    }
    getVelocity() {
        return new Vector3(this._entity.getVelocity());
    }

    protected constructor(entity: Entity) {
        this._entity = entity;
        if (ExEntity.propertyNameCache in entity) {
            throw new Error("Already have a instance in entity.please use ExEntity.getInstance to get it.");
        } else {
            Reflect.set(entity, ExEntity.propertyNameCache, this);
        }
    }
    static getInstance(source: Entity): ExEntity {
        let entity = source;
        if (this.propertyNameCache in entity) {
            return Reflect.get(entity, this.propertyNameCache);
        }
        return (new ExEntity(entity));
    }
    get exDimension() {
        return ExDimension.getInstance(this.dimension);
    }
    set exDimension(ex: ExDimension) {
        this.dimension = ex.dimension;
    }

    addTag(str: string) {
        this._entity.addTag(str);
        return str;
    }
    get tags() {
        return this._entity.getTags();
    }
    getTags(): string[] {
        return this.tags;
    }
    hasTag(str: string) {
        return this._entity.hasTag(str);
    }
    removeTag(str: string) {
        this._entity.removeTag(str);
        return str;
    }
    runCommandAsync(str: string) {
        return this._entity.runCommandAsync(str);
    }

    detectAllArmor(head?: string, chest?: string, legs?: string, boots?: string) {
        const bag = this.getBag();
        return bag.equipmentOnHead?.typeId == head &&
            bag.equipmentOnChest?.typeId == chest &&
            bag.equipmentOnLegs?.typeId == legs &&
            bag.equipmentOnFeet?.typeId == boots;
    }
    detectAnyArmor(head?: string, chest?: string, legs?: string, boots?: string) {
        const bag = this.getBag();
        return bag.equipmentOnHead?.typeId == head ||
            bag.equipmentOnChest?.typeId == chest ||
            bag.equipmentOnLegs?.typeId == legs ||
            bag.equipmentOnFeet?.typeId == boots;
    }

    getScoresManager() {
        return new ExScoresManager(this._entity);
    }
    triggerEvent(name: string) {
        // console.warn(name+' trigger event');
        this._entity.triggerEvent(name);
    }

    get position() {
        return new Vector3(this.entity.location);
    }
    set position(position: Vector3) {
        this.setPosition(position);
    }
    setPosition(position: Vector3, dimension?: Dimension) {
        this.entity.teleport(position, {
            "dimension": dimension,
            "keepVelocity": true
        });
    }

    get rotation() {
        return this.entity.getRotation();
    }
    set rotation(ivec: IVector2) {
        this.teleport(this.position, {
            "keepVelocity": true,
            "rotation": ivec
        });
    }

    teleport(location: Vector3, teleportOptions?: TeleportOptions) {
        this.entity.teleport(location, teleportOptions);
    }
    tryTeleport(location: Vector3, teleportOptions?: TeleportOptions) {
        this.entity.tryTeleport(location, teleportOptions);
    }
    set dimension(dimension: Dimension) {
        this.setPosition(this.position, dimension);
    }
    get dimension() {
        return this._entity.dimension;
    }

    get viewDirection() {
        return new Vector3(this.entity.getViewDirection());
    }
    set viewDirection(ivec: Vector3) {
        this.teleport(this.position, {
            "keepVelocity": true,
            "rotation": {
                x: ivec.rotateAngleX(),
                y: ivec.rotateAngleY()
            }
        })
    }

    addEffect(eff: EffectType | string, during: number, aml: number, par: boolean = true) {
        this.entity.addEffect(eff, during, {
            "showParticles": par,
            "amplifier": aml
        });
    }
    hasComponent<T extends keyof CompId>(key: T) {
        return this._entity.hasComponent(<string>key);
    }

    getComponent<T extends keyof CompId>(key: T): AlsoInstanceType<CompId[T]> | undefined {
        return this._entity.getComponent(key);
    }
    get health() {
        return this.getComponent("minecraft:health")!.currentValue;
    }
    set health(h: number) {
        this.getComponent("minecraft:health")!.setCurrentValue(Math.max(0, h));
    }
    getMaxHealth() {
        return this.getComponent("minecraft:health")!.defaultValue;
    }

    get movement() {
        return this.getComponent("minecraft:movement")!.currentValue;
    }
    set movement(num: number) {
        this.getComponent("minecraft:movement")?.setCurrentValue(num);
    }

    shootProj(id: string, option: ExEntityShootOption, velocity: Vector3) {
        let lo = Vector.add(
            Vector.add(this._entity.getHeadLocation(), new Vector3(0, 0, -1)),//这里z-1才是实际的head位置，可能是ojang的bug吧
            Vector.multiply(this._entity.getViewDirection(), 1.5)
        )//等会写offset
        if (option.absPosOffset !== undefined) {
            lo = Vector.add(lo,option.absPosOffset)
        }
        if (option.viewPosOffset !== undefined) {
            lo = Vector.add(lo,this.getViewVector(option.viewPosOffset))
        }
        let view = this._entity.getViewDirection()
        let proj = this._entity.dimension.spawnEntity(id, lo)
        let proj_comp = proj.getComponent('minecraft:projectile')
        if (proj_comp === undefined) {
            proj.remove()
            return false
        } else {
            let shootOpt: ProjectileShootOptions = {
                uncertainty: option.uncertainty ?? 0
            }
            proj_comp.airInertia = option.airInertia ?? proj_comp.airInertia
            proj_comp.catchFireOnHurt = option.catchFireOnHurt ?? proj_comp.catchFireOnHurt
            proj_comp.critParticlesOnProjectileHurt = option.critParticlesOnProjectileHurt ?? proj_comp.critParticlesOnProjectileHurt
            proj_comp.destroyOnProjectileHurt = option.destroyOnProjectileHurt ?? proj_comp.destroyOnProjectileHurt
            proj_comp.gravity = option.gravity ?? proj_comp.gravity
            proj_comp.hitEntitySound = option.hitEntitySound ?? proj_comp.hitEntitySound
            proj_comp.hitGroundSound = option.hitGroundSound ?? proj_comp.hitGroundSound
            proj_comp.hitParticle = option.hitParticle ?? proj_comp.hitParticle
            proj_comp.lightningStrikeOnHit = option.lightningStrikeOnHit ?? proj_comp.lightningStrikeOnHit
            proj_comp.liquidInertia = option.liquidInertia ?? proj_comp.liquidInertia
            proj_comp.onFireTime = option.onFireTime ?? proj_comp.onFireTime
            proj_comp.owner = option.owner ?? this._entity
            proj_comp.shouldBounceOnHit = option.shouldBounceOnHit ?? proj_comp.shouldBounceOnHit
            proj_comp.stopOnHit = option.stopOnHit ?? proj_comp.stopOnHit
            proj_comp.shoot(Vector.multiply(view,option.speed),shootOpt)
            return true
        }
        //马上开写
    }

    relateRotate(x:number,y:number,take_effect=true){
        let v_c = this._entity.getViewDirection()

        //竖直转动，xRot，90纯竖直向下，-90纯竖直向上
        let l_0 = Math.pow(Math.pow(v_c.x,2) + Math.pow(v_c.z,2),0.5)
        let phi_cur = - Math.atan( v_c.y / l_0) * 180 / Math.PI
        let phi_ca = phi_cur + x
        let phi = (phi_ca > 180 ? 180 : (phi_ca < -180 ? -180 : phi_ca)) * Math.PI / 180
        v_c.y = - Math.sin(phi)
        let l_1 = Math.cos(phi)
        v_c.x = l_1 * v_c.x / l_0
        v_c.y = l_1 * v_c.y / l_0

        //横向转动，yRot，~+向右，即xOz平面中逆时针转，~-向左
        
    }

    getViewVectorBase() {
        let c = this._entity.getViewDirection()
        let b = Vector.cross(new Vector3(0,1,0),c)
        let a = Vector.cross(c,b)
        let base = [
            a,b,c
        ]
        return base
    }

    getViewVector(v:Vector3){
        let base = this.getViewVectorBase()
        let x = base[0].x * v.x + base[0].y * v.y + base[0].z * v.z
        let y = base[1].x * v.x + base[1].y * v.y + base[1].z * v.z
        let z = base[2].x * v.x + base[2].y * v.y + base[2].z * v.z
        let new_v = new Vector3(x,y,z)
        return new_v
    }

    getBag() {
        return new ExEntityBag(this);
    }
    getVariant() {
        return this.getComponent("minecraft:variant")?.value ?? 0;
    }
    getMarkVariant() {
        return this.getComponent("minecraft:variant")?.value ?? 0;
    }
}

export interface ExEntityShootOption {
    uncertainty?: number,
    airInertia?: number,
    catchFireOnHurt?: boolean
    critParticlesOnProjectileHurt?: boolean,
    destroyOnProjectileHurt?: boolean,
    gravity?: number,
    hitEntitySound?: string,
    hitGroundSound?: string,
    hitParticle?: string,
    lightningStrikeOnHit?: boolean,
    liquidInertia?: number,
    onFireTime?: number,
    owner?: Entity,//如果是undefined就设置为这个实体
    shouldBounceOnHit?: boolean,
    stopOnHit?: boolean,
    
    speed: number,

    absPosOffset?: Vector3,
    viewPosOffset?: Vector3,
    rotOffset?: Vector2
} 