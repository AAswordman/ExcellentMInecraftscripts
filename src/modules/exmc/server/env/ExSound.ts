import { world, MinecraftDimensionTypes, Dimension } from '@minecraft/server';
import TimeLoopTask from '../../utils/TimeLoopTask.js';
import ExEventManager from '../../interface/ExEventManager.js';
import Vector3, { IVector3 } from '../../math/Vector3.js';
import ExGameVector3 from '../math/ExGameVector3.js';
import { to } from '../ExErrorQueue.js';
import ExDimension from '../ExDimension.js';
import ExSystem from '../../utils/ExSystem.js';
export default class ExSound {
    soundId: string;
    long: number;
    looper?: TimeLoopTask;
    constructor(id: string, time: string) {
        this.soundId = id;
        let s = time.split(":");
        this.long = (parseInt(s[0]) * 60 + parseInt(s[1])) * 1000;
    }
    loop(manager: ExEventManager, dim: ExDimension, trackVector: IVector3) {
        this.play(dim,trackVector);
        this.looper = new TimeLoopTask(manager, () => {
            this.play(dim,trackVector);
        }).delay(this.long);
        this.looper.start();
    }
    stop() {
        this.looper?.stop();
        world.getDimension(MinecraftDimensionTypes.overworld).runCommandAsync("stopsound @a " + this.soundId);
    }
    play(dim: ExDimension,vec: IVector3) {
        // world.playSound(this.soundId, {
        //     location: ExGameVector3.getLocation(vec)
        // });
        to(dim.command.run(`playsound ${this.soundId} @a[r=64,x=${vec.x},y=${vec.y},z=${vec.z}] ${vec.x} ${vec.y} ${vec.z} 0.8 1 0.8`).then(
            e => {
                console.log(e);
            }
        ));
    }
}