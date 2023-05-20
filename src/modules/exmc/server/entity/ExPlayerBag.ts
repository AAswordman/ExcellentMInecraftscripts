import {
    Player,
    EntityInventoryComponent,
    ItemStack
} from "@minecraft/server";
import ExPlayer from "./ExPlayer.js";
import ExEntityBag from './ExEntityBag.js';

export default class ExPlayerBag extends ExEntityBag{
    private _player: ExPlayer;
    constructor(player: ExPlayer) {
        super(player);
        this._player = player;
    }

    getItemOnHand() {
        return this.getItem(this.getSelectedSlot());
    }
    setItemOnHand(item:ItemStack) {
        return this.setItem(this.getSelectedSlot(),item);
    }
    getSelectedSlot(){
        return this._player.selectedSlot;
    }
}