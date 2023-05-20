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
        this.bagComponent = entity.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent;
        this.equipmentComponent = entity.getComponent(EntityEquipmentInventoryComponent.componentId) as EntityEquipmentInventoryComponent;
    }

    getItem(id: string): ItemStack | undefined;
    getItem(slot: number): ItemStack | undefined;
    getItem(arg: string | number) {
        if (typeof (arg) === "number") {
            return this.bagComponent.container.getItem(arg);
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
            if (items[i] === undefined) { continue; }
            if (items[i].typeId === id) {
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

    setItem(slot: number, item: ItemStack | undefined) {
        return this.bagComponent.container.setItem(slot, <ItemStack>item);
    }

    hasItem(itemId: string) {
        return this.searchItem(itemId) !== -1;
    }
    addItem(item: ItemStack) {
        this.bagComponent.container.addItem(item);
    }
    getSlot(pos: number) {
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
}