import { Entity, EntityHealthComponent, Vector, EntityInventoryComponent, Player, Dimension, EntityQueryOptions, EntityVariantComponent, EntityMarkVariantComponent, EntityIsBabyComponent, EntityIsChargedComponent, EntityDamageSource, EntityDamageCause, EquipmentSlot, TeleportOptions, EffectType } from '@minecraft/server';
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
                let health = this.getHealthComponent();
                if (health.currentValue > 0.5) health.setCurrentValue(Math.max(0.5, health.currentValue - (this._damage ?? 0)));
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

    async detectArmor(head: string, chest: string, legs: string, boots: string) {
        const bag = this.getBag();
        return bag.getEquipment(EquipmentSlot.head)?.typeId == head &&
            bag.getEquipment(EquipmentSlot.chest)?.typeId == chest &&
            bag.getEquipment(EquipmentSlot.legs)?.typeId == legs &&
            bag.getEquipment(EquipmentSlot.feet)?.typeId == boots;
    }

    getScoresManager() {
        return new ExScoresManager(this._entity);
    }
    triggerEvent(name: string) {
        this._entity.triggerEvent(name);
    }

    getPosition() {
        return new Vector3(this.entity.location);
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
        this.teleport(this.getPosition(), {
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
        this.setPosition(this.getPosition(), dimension);
    }
    get dimension() {
        return this._entity.dimension;
    }

    get viewDirection() {
        return new Vector3(this.entity.getViewDirection());
    }
    set viewDirection(ivec: Vector3) {
        this.teleport(this.getPosition(), {
            "keepVelocity": true,
            "rotation": {
                x: ivec.rotateAngleX(),
                y: ivec.rotateAngleY()
            }
        })
    }

    addEffect(eff: string | EffectType, during: number, aml: number, par: boolean = true) {
        this.entity.addEffect(eff, during, {
            "showParticles": par,
            "amplifier": aml
        })
    }

    hasComponent(name: string) {
        return this._entity.hasComponent(name);
    }

    getComponent(name: string) {
        return this._entity.getComponent(name);
    }

    hasHealthComponent() {
        return this.hasComponent(EntityHealthComponent.componentId);
    }
    getHealthComponent() {
        return (<EntityHealthComponent>this.getComponent(EntityHealthComponent.componentId));
    }
    get health() {
        return this.getHealthComponent().currentValue;
    }
    set health(h: number) {
        this.getHealthComponent().setCurrentValue(h);
    }
    getMaxHealth() {
        return this.getHealthComponent().defaultValue;
    }



    getBag() {
        return new ExEntityBag(this);
    }

    hasVariantComponent() {
        return this.hasComponent(EntityVariantComponent.componentId);
    }
    getVariantComponent() {
        return <EntityVariantComponent>this.getComponent(EntityVariantComponent.componentId);
    }
    getVariant() {
        return this.getVariantComponent()?.value ?? 0;
    }
    hasMarkVariantComponent() {
        return this.hasComponent(EntityMarkVariantComponent.componentId);
    }
    getMarkVariantComponent() {
        return <EntityMarkVariantComponent>this.getComponent(EntityMarkVariantComponent.componentId);
    }
    getMarkVariant() {
        return this.getMarkVariantComponent()?.value ?? 0;
    }
    hasIsBabyComponent() {
        return this.hasComponent(EntityIsBabyComponent.componentId);
    }
    hasIsChargedComponent() {
        return this.hasComponent(EntityIsChargedComponent.componentId);
    }
}