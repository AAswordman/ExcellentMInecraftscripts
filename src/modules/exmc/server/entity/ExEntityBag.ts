import ExEntity from './ExEntity.js';
import {
    Container,
    EntityEquippableComponent,
    EntityInventoryComponent,
    EquipmentSlot,
    ItemStack
} from "@minecraft/server";
import ExPlayer from './ExPlayer.js';

export default class ExEntityBag {
    private _entity: ExEntity;
    bagComponent: EntityInventoryComponent;
    equipmentComponent: EntityEquippableComponent;
    constructor(entity: ExEntity) {
        this._entity = entity;
        this.bagComponent = entity.getComponent("minecraft:inventory")!;
        this.equipmentComponent = entity.getComponent("minecraft:equippable")!;
    }

    getItem(id: string): ItemStack | undefined;
    getItem(slot: EquipmentSlot): ItemStack | undefined;
    getItem(slot: number): ItemStack | undefined;
    getItem(arg: string | number) {
        if (typeof (arg) === "number") {
            return (<Container>this.bagComponent.container).getItem(arg);
        }
        if(arg in EquipmentSlot){
            return this.getEquipment(arg as EquipmentSlot);
        }
        let search = this.searchItem(arg);
        if (search === -1) {
            return undefined;
        }
        return (<Container>this.bagComponent.container).getItem(search);
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
            items.push((<Container>this.bagComponent.container).getItem(i));
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
        return (<Container>this.bagComponent.container).setItem(slot, <ItemStack>item);
    }

    hasItem(itemId: string,containsEq = false) {
        if(containsEq){
            //TTOD 懒得写了
        }
        return this.searchItem(itemId) !== -1;
    }
    addItem(item: ItemStack) {
        (<Container>this.bagComponent.container).addItem(item);
    }
    getSlot(pos: number | EquipmentSlot) {
        if(typeof pos === 'string') {
            return this.getEquipmentSlot(pos);
        }
        return (<Container>this.bagComponent.container).getSlot(pos);
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
        return this.getItem(EquipmentSlot.Mainhand);
    }
    set itemOnMainHand(item: ItemStack | undefined) {
        this.setItem(EquipmentSlot.Mainhand, item);
    }
    get itemOnOffHand() {
        return this.getItem(EquipmentSlot.Offhand);
    }
    set itemOnOffHand(item: ItemStack | undefined) {
        this.setItem(EquipmentSlot.Offhand, item);
    }
    get equipmentOnHead() {
        return this.getItem(EquipmentSlot.Head);
    }
    set equipmentOnHead(item: ItemStack | undefined) {
        this.setItem(EquipmentSlot.Head, item);
    }
    get equipmentOnChest() {
        return this.getItem(EquipmentSlot.Chest);
    }
    set equipmentOnChest(item: ItemStack | undefined) {
        this.setItem(EquipmentSlot.Chest, item);
    }
    get equipmentOnFeet() {
        return this.getItem(EquipmentSlot.Feet);
    }
    set equipmentOnFeet(item: ItemStack | undefined) {
        this.setItem(EquipmentSlot.Feet, item);
    }
    get equipmentOnLegs() {
        return this.getItem(EquipmentSlot.Legs);
    }
    set equipmentOnLegs(item: ItemStack | undefined) {
        this.setItem(EquipmentSlot.Legs, item);
    }
}