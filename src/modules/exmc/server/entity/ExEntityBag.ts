import ExEntity from './ExEntity.js';
import {
    Container,
    ContainerSlot,
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
        if (arg in EquipmentSlot) {
            return this.getEquipment(arg as EquipmentSlot);
        }
        let search = this.searchItem(arg);
        if (!search) {
            return undefined;
        }
        return search.getItem();
    }
    searchItem(id: string) {
        let slots = this.getAllSlots();
        for (let i of slots) {
            if (i.getItem() === undefined) { continue; }
            if (i.typeId === id) {
                return i;
            }
        }
        return undefined;
    }
    searchItems(items: Array<string>) {
        let slots = this.getAllSlots();
        let result: {
            [key: string]: ContainerSlot | undefined;
        }
        result = {}
        for (let i of items) {
            result[i] = undefined
        }
        for (let i of slots) {
            if (i.getItem() !== undefined && items.indexOf(<string>i.typeId) !== -1 && result[<string>i.typeId] === undefined) {
                result[<string>i.typeId] = i
            }
        }
        return result;
    }
    searchProjectile(items: Array<string>): undefined | string
    searchProjectile(items: string): boolean
    searchProjectile(arg: string | Array<string>) {
        if (typeof (arg) === 'string') {
            let slots = this.getAllSlots();
            for (let i of slots) {
                if (i.getItem() !== undefined && i.typeId === arg) {
                    return true
                }
            }
            return false
        } else {
            let slots = this.getAllSlots();
            for (let i of slots) {
                if (i.getItem() !== undefined && arg.indexOf(<string>i.typeId) !== -1) {
                    return i.typeId
                }
            }
            return undefined
        }
    }
    indexOf(id: string) {
        for (let i = 0; i < this.size(); i++) {
            if ((<Container>this.bagComponent.container).getItem(i)?.typeId === id) {
                return i;
            }
        }
        return -1;
    }
    getAllItems() {
        let items: (ItemStack | undefined)[] = [];
        items.push(this.itemOnOffHand);
        if (this.bagComponent.container) {
            for (let i = 0; i < this.size(); i++) {
                items.push((<Container>this.bagComponent.container).getItem(i));
            };
        }
        items.push(this.equipmentOnHead);
        items.push(this.equipmentOnChest);
        items.push(this.equipmentOnLegs);
        items.push(this.equipmentOnFeet);
        return items;
    }
    getAllSlots() {
        let items: ContainerSlot[] = [];
        items.push(this.getSlot(EquipmentSlot.Offhand));
        if (this.bagComponent.container) {
            for (let i = 0; i < this.size(); i++) {
                items.push((<Container>this.bagComponent.container).getSlot(i));
            };
        }
        items.push(this.getSlot(EquipmentSlot.Head));
        items.push(this.getSlot(EquipmentSlot.Chest));
        items.push(this.getSlot(EquipmentSlot.Legs));
        items.push(this.getSlot(EquipmentSlot.Feet));
        return items;
    }
    countAllItems() {
        let items = new Map<string, number>();
        for (let i of this.getAllItems()) {
            if (i) {
                items.set(i.typeId, i.amount + (items.get(i.typeId) ?? 0));
            }
        };
        return items;
    }
    clearItem(msg: string | number, amount: number) {
        //lly写完后发现，好像不用把副手弄成-1，不然每次都会检测是不是-1，似乎刚开始检测一下就好（但不知道怎么改qwq
        if (typeof msg === 'string') {
            let id = msg;
            let res = 0;
            for (let i = -1; i < this.size(); i++) {
                let item: ItemStack | undefined
                if (i === -1) {
                    item = this.itemOnOffHand
                } else {
                    item = this.getItem(i);
                }
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
            let item: ItemStack | undefined;
            if (msg === -1) {
                item = this.itemOnOffHand;
            } else {
                item = this.getItem(msg);
            }
            if (item) {
                if (amount >= item.amount) {
                    this.setItem(msg === -1 ? EquipmentSlot.Offhand : msg, undefined);
                    return item.amount;
                } else {
                    item.amount -= amount;
                    this.setItem(msg === -1 ? EquipmentSlot.Offhand : msg, item);
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
        if (typeof slot === 'string') {
            return this.setEquipment(slot, item);
        }
        return (<Container>this.bagComponent.container).setItem(slot, <ItemStack>item);
    }

    hasItem(itemId: string) {
        return this.searchItem(itemId) !== undefined;
    }
    addItem(item: ItemStack) {
        (<Container>this.bagComponent.container).addItem(item);
    }
    getSlot(pos: number | EquipmentSlot) {
        if (typeof pos === 'string') {
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