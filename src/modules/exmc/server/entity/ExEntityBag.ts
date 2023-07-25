import ExEntity from './ExEntity.js';
import {
    EntityEquipmentInventoryComponent,
    EntityInventoryComponent,
    EquipmentSlot,
    ItemStack
} from "@minecraft/server";
import ExPlayer from './ExPlayer.js';

export default class ExEntityBag {
    private _entity: ExEntity;
    bagComponent: EntityInventoryComponent;
    equipmentComponent: EntityEquipmentInventoryComponent;
    constructor(entity: ExEntity) {
        this._entity = entity;
        this.bagComponent = entity.getComponent("minecraft:inventory")!;
        this.equipmentComponent = entity.getComponent("minecraft:equipment_inventory")!;
    }

    getItem(id: string): ItemStack | undefined;
    getItem(slot: EquipmentSlot): ItemStack | undefined;
    getItem(slot: number): ItemStack | undefined;
    getItem(arg: string | number) {
        if (typeof (arg) === "number") {
            return this.bagComponent.container.getItem(arg);
        }
        if(arg in EquipmentSlot){
            return this.getEquipment(arg as EquipmentSlot);
        }
        let search = this.searchItem(arg);
        if (search === -1) {
            return undefined;
        }
        return this.bagComponent.container.getItem(search);
    }
    searchItem(id: string) {
        let items = this.getAllItems();
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if (item === undefined) { continue; }
            if (item.typeId === id) {
                return i;
            }
        }
        return -1;
    }

    getAllItems() {
        let items = [];
        for (let i = 0; i < this.size(); i++) {
            items.push(this.bagComponent.container.getItem(i));
        };
        return items;
    }
    countAllItems() {
        let items = new Map<string, number>();
        for (let i = 0; i < this.size(); i++) {
            let item = this.getItem(i);
            if (item)
                items.set(item.typeId, item.amount + (items.get(item.typeId) ?? 0));
        };
        return items;
    }
    clearItem(msg: string | number, amount: number) {
        if (typeof msg === 'string') {
            let id = msg;
            let res = 0;
            for (let i = 0; i < this.size(); i++) {
                let item = this.getItem(i);
                if (item?.typeId === id) {
                    let suc = this.clearItem(i, amount);
                    res += suc;
                    amount -= suc;
                    if (amount <= 0) {
                        break;
                    }
                }
            }
            return res;
        } else {
            let item = this.getItem(msg);
            if (item) {
                if (amount >= item.amount) {
                    this.setItem(msg, undefined);
                    return item.amount;
                } else {
                    item.amount -= amount;
                    this.setItem(msg, item);
                    return amount;
                }
            }
            return 0;
        }
    }
    size() {
        return this.bagComponent.inventorySize;
    }

    type() {
        return this.bagComponent.containerType;
    }

    isPrivate() {
        return this.bagComponent.private;
    }

    isRestrictToOwner() {
        return this.bagComponent.restrictToOwner;
    }

    setItem(slot: number | EquipmentSlot, item: ItemStack | undefined) {
        if(typeof slot === 'string') {
            return this.setEquipment(slot,item);
        }
        return this.bagComponent.container.setItem(slot, <ItemStack>item);
    }

    hasItem(itemId: string,containsEq = false) {
        if(containsEq){
            //TTOD 懒得写了
        }
        return this.searchItem(itemId) !== -1;
    }
    addItem(item: ItemStack) {
        this.bagComponent.container.addItem(item);
    }
    getSlot(pos: number | EquipmentSlot) {
        if(typeof pos === 'string') {
            return this.getEquipmentSlot(pos);
        }
        return this.bagComponent.container.getSlot(pos);
    }

    getEquipment(slot: EquipmentSlot) {
        return this.equipmentComponent.getEquipment(slot);
    }
    setEquipment(slot: EquipmentSlot, equip: ItemStack | undefined) {
        return this.equipmentComponent.setEquipment(slot, equip);
    }
    getEquipmentSlot(slot: EquipmentSlot) {
        return this.equipmentComponent.getEquipmentSlot(slot);
    }

    
    get itemOnMainHand() {
        return this.getItem(EquipmentSlot.mainhand);
    }
    set itemOnMainHand(item: ItemStack | undefined) {
        this.setItem(EquipmentSlot.mainhand, item);
    }
    get itemOnOffHand() {
        return this.getItem(EquipmentSlot.offhand);
    }
    set itemOnOffHand(item: ItemStack | undefined) {
        this.setItem(EquipmentSlot.offhand, item);
    }
    get equipmentOnHead() {
        return this.getItem(EquipmentSlot.head);
    }
    set equipmentOnHead(item: ItemStack | undefined) {
        this.setItem(EquipmentSlot.head, item);
    }
    get equipmentOnChest() {
        return this.getItem(EquipmentSlot.chest);
    }
    set equipmentOnChest(item: ItemStack | undefined) {
        this.setItem(EquipmentSlot.chest, item);
    }
    get equipmentOnFeet() {
        return this.getItem(EquipmentSlot.feet);
    }
    set equipmentOnFeet(item: ItemStack | undefined) {
        this.setItem(EquipmentSlot.feet, item);
    }
    get equipmentOnLegs() {
        return this.getItem(EquipmentSlot.legs);
    }
    set equipmentOnLegs(item: ItemStack | undefined) {
        this.setItem(EquipmentSlot.legs, item);
    }
}