import { Player } from '@minecraft/server';
import TimeLoopTask from '../../utils/TimeLoopTask.js';
import { IVector3 } from '../../math/Vector3.js';
import ExDimension from '../ExDimension.js';
import ExGameServer from '../ExGameServer.js';
export default class ExMusic {
    soundId: string;
    long: number;
    looper?: TimeLoopTask;
    manager: ExGameServer;
    trackPlayers?: Player[];
    constructor(manager: ExGameServer, id: string, time: string, trackPlayers?: Player[]) {
        this.soundId = id;
        let s = time.split(":");
        this.long = (parseInt(s[0]) * 60 + parseInt(s[1])) * 1000;
        this.manager = manager;
        trackPlayers = trackPlayers;
    }
    isInDelayStop = false;
    loop(dim: ExDimension, vec: IVector3) {
        console.warn(`play ${this.soundId} at ${vec.x} ${vec.y} ${vec.z}`);
        if (this.isInDelayStop) {
            this.isInDelayStop = false;
        } else {
            if (!this.trackPlayers) {
                this.trackPlayers = [];
                for (let p of dim.getPlayers({
                    maxDistance: 64,
                    location: vec
                })) {
                    this.trackPlayers.push(p);
                    p.playMusic(this.soundId, {
                        "fade": 1,
                        "loop": true,
                        "volume": 0.5
                    })
                }
            }
        }
    }
    stop() {
        console.warn(`stop ${this.soundId}`);
        if (!this.trackPlayers) return;
        for (let p of this.trackPlayers) {
            p.stopMusic();
        }
    }
    delayStop(time: number) {
        this.isInDelayStop = true;
        this.manager.setTimeout(() => {
            if (this.isInDelayStop) {
                this.stop();
            }
            this.isInDelayStop = false;
        }, time);
    }
    play(dim: ExDimension, vec: IVector3) {
        console.warn(`play ${this.soundId} at ${vec.x} ${vec.y} ${vec.z}`);
        if (!this.trackPlayers) {
            this.trackPlayers = [];
            for (let p of dim.getPlayers({
                maxDistance: 64,
                location: vec
            })) {
                this.trackPlayers.push(p);
                p.queueMusic(this.soundId, {
                    "fade": 1,
                    "loop": false,
                    "volume": 0.5
                })
            }
        }
    }
}