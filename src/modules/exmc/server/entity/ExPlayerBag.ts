import {
    Player,
    EntityInventoryComponent,
    ItemStack
} from "@minecraft/server";
import ExPlayer from "./ExPlayer.js";
import ExEntityBag from './ExEntityBag.js';

export default class ExPlayerBag extends ExEntityBag{
    private _player: ExPlayer;
    override bagComponent: EntityInventoryComponent;
    constructor(player: ExPlayer) {
        super(player);
        this._player = player;
        this.bagComponent = player.getInventoryComponent();
    }

    getItemOnHand() {
        return this.getItem(this._player.selectedSlot);
    }
    setItemOnHand(item:ItemStack) {
        return this.setItem(this._player.selectedSlot,item);
    }
}