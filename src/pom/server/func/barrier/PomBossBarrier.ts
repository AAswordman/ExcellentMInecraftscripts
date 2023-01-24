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
import { Player, Entity, MinecraftEffectTypes } from '@minecraft/server';
import notUtillTask from "../../../../modules/exmc/utils/NotUtillTask.js";
import PomClient from "../../PomClient.js";
import PomBossController from "../../entities/PomBossController.js";
import { ignorn } from "../../../../modules/exmc/server/ExErrorQueue.js";
export default class PomBossBarrier implements DisposeAble {
    tickEvent: () => void;
    manager: ExEventManager;
    server: PomServer;
    boss: PomBossController;
    deathTimes: number = 0;
    static find(startPos: IVector3) {
        for (let [k, v] of this.map) {
            if (v.area.contains(startPos)) {
                return v;
            }
        }
    }
    setBoss(e: PomBossController) {
        this.boss = e;
    }
    static isInBarrier(e: Entity) {
        return PomBossBarrier.find(e.location) !== undefined;
    }
    area: ExBlockArea;
    static map = new Map<string, PomBossBarrier>();
    players: Map<Player, boolean> = new Map<Player, boolean>();
    dim: ExDimension;
    id: string;
    constructor(server: PomServer, dim: ExDimension, area: ExBlockArea, boss: PomBossController) {
        this.area = area;
        this.id = UUID.randomUUID();
        PomBossBarrier.map.set(this.id, this);
        this.dim = dim;
        for (let e of dim.getPlayers()) {
            if (area.contains(e.location)) {
                this.players.set(e, true);
                let c = <PomClient | undefined>server.findClientByPlayer(e);
                if (c) {
                    c.ruinsSystem.barrier = this;
                }
            }
        }
        this.tickEvent = this.update.bind(this);
        this.server = server;
        this.manager = server.getEvents();
        this.manager.register("onLongTick", this.tickEvent);
        this.boss = boss;
    }
    dispose(): void {
        PomBossBarrier.map.delete(this.id);
        this.manager.cancel("onLongTick", this.tickEvent);
        for(let c of this.clientsByPlayer()){
            c.ruinsSystem.barrier = undefined;
        }
    }
    *clientsByPlayer() {
        for (let e of this.players) {
            let c = <PomClient | undefined>this.server.findClientByPlayer(e[0]);
            if (c) {
                yield c;
            }
        }
    }

    notifyDeathAdd() {
        this.deathTimes += 1;
        for (let c of this.clientsByPlayer()) {
            c.ruinsSystem.deathTimes = this.deathTimes;
        }
        if (this.deathTimes >= 3) {
            this.boss.onFail();
        }
    }
    update() {
        this.dim.spawnParticle("wb:boss_barrier", this.area.center());
        for (let e of this.server.getPlayers()) {
            if (!e.location) continue;
            // console.warn(this.area.contains(e.location))
            if (this.players.has(e)) {
                if (!this.area.contains(e.location)) {
                    if (this.players.get(e)) {
                        // notUtillTask(this.server,() => ExPlayer.getInstance(e).getHealth()>0,()=>{
                        if (this.dim.dimension !== e.dimension) e.addEffect(MinecraftEffectTypes.resistance, 14 * 20, 10, true);
                        this.server.setTimeout(() => ExPlayer.getInstance(e).setPosition(this.area.center(), this.dim.dimension), 2000);
                        // });
                        this.players.set(e, false);
                    }
                } else {
                    this.players.set(e, true);
                }
            } else {
                if (this.area.contains(e.location)) {
                    e.kill();
                }
            }
        }

        if (ignorn(() => this.boss.entity.location) && !this.area.contains(this.boss.entity.location)) {
            this.boss.exEntity.setPosition(this.area.center());
        }

    }
    stop() {
        this.dispose();
    }
}