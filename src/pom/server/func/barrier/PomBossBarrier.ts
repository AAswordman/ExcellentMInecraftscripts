import { ExBlockArea } from "../../../../modules/exmc/server/block/ExBlockArea.js";
import UUID from "../../../../modules/exmc/utils/UUID.js";
import ExEntity from '../../../../modules/exmc/server/entity/ExEntity.js';
import ExDimension from "../../../../modules/exmc/server/ExDimension.js";
import DisposeAble from '../../../../modules/exmc/interface/DisposeAble.js';
import ExPlayer from "../../../../modules/exmc/server/entity/ExPlayer.js";
import ExGameVector3 from "../../../../modules/exmc/server/math/ExGameVector3.js";
import Vector3, { IVector3 } from "../../../../modules/exmc/math/Vector3.js";
import ExEventManager from '../../../../modules/exmc/interface/ExEventManager.js';
import PomServer from "../../PomServer.js";
import { Player, Entity } from '@minecraft/server';

export default class PomBossBarrier implements DisposeAble {
    tickEvent: () => void;
    manager: ExEventManager;
    server: PomServer;
    static find(startPos: IVector3) {
        for (let [k, v] of this.map) {
            if (v.area.contains(startPos)) {
                return v;
            }
        }
    }
    static isInBarrier(e:Entity){
        return PomBossBarrier.find(e.location) !== undefined;
    }
    area: ExBlockArea;
    static map = new Map<string, PomBossBarrier>();
    players: Set<Player> = new Set();
    dim: ExDimension;
    id: string;
    constructor(server: PomServer, dim: ExDimension, area: ExBlockArea) {
        this.area = area;
        this.id = UUID.randomUUID();
        PomBossBarrier.map.set(this.id, this);
        this.dim = dim;
        for (let e of dim.getPlayers()) {
            if (area.contains(e.location)) {
                this.players.add(e);
            }
        }
        this.tickEvent = this.update.bind(this);
        this.server = server;
        this.manager = server.getEvents();
        this.manager.register("onLongTick", this.tickEvent);
    }
    dispose(): void {
        PomBossBarrier.map.delete(this.id);
        this.manager.cancel("onLongTick", this.tickEvent);
    }

    update() {
        this.dim.spawnParticle("wb:boss_barrier",this.area.center());
        for (let e of this.server.getPlayers()) {
            if (!e.location) continue;
            // console.warn(this.area.contains(e.location))
            if (this.players.has(e)) {
                if (!this.area.contains(e.location)) {
                    ExPlayer.getInstance(e).setPosition(this.area.center(), this.dim.dimension);
                }
            } else {
                if (this.area.contains(e.location)) {
                    e.kill();
                }
            }

        }

    }
    stop() {
        this.dispose();
    }
}