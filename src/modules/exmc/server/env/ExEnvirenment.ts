import { world } from "@minecraft/server";
import MathUtil from "../../math/MathUtil.js";

export default class ExEnvirenment {
    time: number;
    constructor(time?: number) {
        this.time = time ?? world.getAbsoluteTime();
    }
    print() {
        world.say("time is " + this.time);
    }
    isDay(){
        return this.days() < 12000;
    }
    isNight(){
        return this.days() > 12000;
    }
    days(){
        return  this.time - (24000 * Math.floor(this.time / 24000));
    }
}