import { Entity, EntityHealthComponent, Vector, EntityInventoryComponent, Player, Dimension, EntityQueryOptions, EntityVariantComponent, EntityMarkVariantComponent, EntityIsBabyComponent, EntityIsChargedComponent, EntityDamageSource, EntityDamageCause, EquipmentSlot, TeleportOptions, EffectType, EntityEquipmentInventoryComponent, EntityAttributeComponent } from '@minecraft/server';
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
    [EntityEquipmentInventoryComponent.componentId]: EntityEquipmentInventoryComponent,
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
                if(!this.entity.isValid()) return;
                let health = this.getComponent("minecraft:health")!;
                if (health.currentValue > 0.01) health.setCurrentValue(Math.max(0.5, health.currentValue - (this._damage ?? 0)));
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

    addEffect(eff: EffectType|string, during: number, aml: number, par: boolean = true) {
        this.entity.addEffect(eff, during, {
            "showParticles": par,
            "amplifier": aml
        });
    }
    hasComponent<T extends keyof CompId>(key: T) {
        return this._entity.hasComponent(key);
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

    get movement(){
        return this.getComponent("minecraft:movement")!.currentValue;
    }
    set movement(num:number){
        this.getComponent("minecraft:movement")?.setCurrentValue(num);
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