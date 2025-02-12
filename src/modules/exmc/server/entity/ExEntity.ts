import { Entity, EntityHealthComponent, EntityInventoryComponent, Dimension, EntityVariantComponent, EntityMarkVariantComponent, EntityIsBabyComponent, EntityIsChargedComponent, EntityDamageSource, EntityDamageCause, EquipmentSlot, TeleportOptions, EffectType, EntityAttributeComponent, EntityEquippableComponent, EntityProjectileComponent, ProjectileShootOptions, EntityComponentTypeMap, Player } from '@minecraft/server';
import { ExCommandNativeRunner } from '../../interface/ExCommandRunner.js';
import ExTagManager from '../../interface/ExTagManager.js';
import ExScoresManager from './ExScoresManager.js';
import Vector3, { IVector3 } from '../../utils/math/Vector3.js';
import ExEntityBag from './ExEntityBag.js';
import SetTimeOutSupport from '../../interface/SetTimeOutSupport.js';
import ExCommand from '../env/ExCommand.js';
import ExDimension from '../ExDimension.js';
import Vector2, { IVector2 } from '../../utils/math/Vector2.js';
import Matrix4 from '../../utils/math/Matrix4.js';
import ExEntityQuery from '../env/ExEntityQuery.js';
import ExSystem from '../../utils/ExSystem.js';
import ExGame from '../ExGame.js';
import { falseIfError } from '../../utils/tool.js';

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
            timeout.runTimeout(() => {
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
    getHeadLocation() {
        return new Vector3(this._entity.getHeadLocation());
    }
    static propertyNameCache = "exCache";
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
    runCommand(str: string) {
        return this._entity.runCommand(str);
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
    hasComponent<T extends keyof EntityComponentTypeMap>(componentId: T): boolean {
        return this._entity.hasComponent(componentId);
    }

    getComponent<T extends keyof EntityComponentTypeMap>(componentId: T): EntityComponentTypeMap[T] | undefined {
        return this._entity.getComponent(componentId);
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

    shootProj(id: string, option: ExEntityShootOption, shoot_dir = this.viewDirection, loc =
        new Vector3(this._entity.getHeadLocation())
            .add(this.viewDirection.scl(option.spawnDistance ?? 1.5))) {
        let locx = loc;
        let q = new ExEntityQuery(this.entity.dimension).at(locx);
        if (option.absPosOffset) locx.add(option.absPosOffset);
        if (option.viewPosOffset) locx = q.facingByLTF(option.viewPosOffset, this.viewDirection).position;

        let view = new Vector3(shoot_dir);
        if (option.rotOffset) {
            // view.add(this.relateRotate(option.rotOffset.x, option.rotOffset.y, false));
            let mat = ExEntityQuery.getFacingMatrix(this.entity.getViewDirection());
            mat.cpy().invert().rmulVector(view);
            new Matrix4().idt().rotateX(option.rotOffset.x / 180 * Math.PI).rotateY(option.rotOffset.y / 180 * Math.PI).rmulVector(view);
            mat.rmulVector(view);
        }
        const proj = this.exDimension.spawnEntity(id, locx);
        let owner = (option.owner ?? this._entity);
        if (owner instanceof Player) {
            let tamemount = proj?.getComponent("tamemount")
            if (tamemount)
                tamemount.tameToPlayer(false, owner);
            let tame = proj?.getComponent("tameable")
            if (tame)
                tame.tame(owner);
        }
        if (!proj) return false;
        const proj_comp = proj.getComponent('minecraft:projectile');
        if (!proj_comp) {
            return false;
        }
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
        proj_comp.owner = owner;
        proj_comp.shouldBounceOnHit = option.shouldBounceOnHit ?? proj_comp.shouldBounceOnHit
        proj_comp.stopOnHit = option.stopOnHit ?? proj_comp.stopOnHit
        let v = new Vector3(view)
        if (option.delay) {
            console.warn('after2:'+proj_comp.owner.nameTag)
            proj_comp.shoot(view.normalize().scl(0.05), shootOpt);
            ExGame._runTimeout(() => {
                if (falseIfError(() => proj.isValid())) proj_comp.shoot(view.normalize().scl(option.speed), shootOpt);
            }, option.delay * 20);
        } else {
            proj_comp.shoot(view.normalize().scl(option.speed), shootOpt);
        }
        return true
    }

    relateRotate(x: number, y: number, take_effect = true) {
        let v_c = this._entity.getViewDirection();
        let l_0 = Math.pow(Math.pow(v_c.x, 2) + Math.pow(v_c.z, 2), 0.5);
        let phi_cur = - Math.atan(v_c.y / l_0) * 180 / Math.PI;
        let phi_ca = phi_cur + x;
        let phi = (phi_ca > 180 ? 180 : (phi_ca < -180 ? -180 : phi_ca)) * Math.PI / 180;
        v_c = new Vector3(v_c).mul(new Matrix4().rotateX(phi).rotateY(-y * Math.PI / 180));

        if (take_effect) {
            //这里有时间写个设置玩家视角
        }
        return v_c
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
/**
 * 实体射击选项
 */
export interface ExEntityShootOption {
    /**
     * 不确定性
     */
    uncertainty?: number;
    /**
     * 空气惯性
     */
    airInertia?: number;
    /**
     * 受伤时着火
     */
    catchFireOnHurt?: boolean;
    /**
     * 子弹伤害时产生暴击粒子
     */
    critParticlesOnProjectileHurt?: boolean;
    /**
     * 子弹伤害时销毁
     */
    destroyOnProjectileHurt?: boolean;
    /**
     * 重力
     */
    gravity?: number;
    /**
     * 击中实体声音
     */
    hitEntitySound?: string;
    /**
     * 击中地面声音
     */
    hitGroundSound?: string;
    /**
     * 击中粒子
     */
    hitParticle?: string;
    /**
     * 击中时产生闪电
     */
    lightningStrikeOnHit?: boolean;
    /**
     * 液体惯性
     */
    liquidInertia?: number;
    /**
     * 着火时间
     */
    onFireTime?: number;
    /**
     * 所有者
     */
    owner?: Entity;
    /**
     * 是否在击中时反弹
     */
    shouldBounceOnHit?: boolean;
    /**
     * 击中时停止
     */
    stopOnHit?: boolean;
    /**
     * 速度
     */
    speed: number;
    /**
     * 绝对位置偏移
     */
    absPosOffset?: Vector3;
    /**
     * 视图位置偏移
     */
    viewPosOffset?: Vector3;
    /**
     * 旋转偏移
     */
    rotOffset?: Vector2;
    /**
     * 生成点相对视角直线位移
     */
    spawnDistance?: number;

    facing?: boolean;
    delay?: number;
}