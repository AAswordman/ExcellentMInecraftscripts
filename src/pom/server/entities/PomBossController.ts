import { Entity, EntityHurtEvent, TickEvent, EntityDamageCause } from '@minecraft/server';
import ExGameServer from '../../../modules/exmc/server/ExGameServer.js';
import ExEntityController from '../../../modules/exmc/server/entity/ExEntityController.js';
import ExGameConfig from '../../../modules/exmc/server/ExGameConfig.js';
import ExGameVector3 from '../../../modules/exmc/server/math/ExGameVector3.js';
import PomBossBarrier from '../func/barrier/PomBossBarrier.js';
import { ExBlockArea } from '../../../modules/exmc/server/block/ExBlockArea.js';
import PomServer from '../PomServer.js';
import Vector3 from '../../../modules/exmc/math/Vector3.js';

export default class PomBossController extends ExEntityController {
    startPos: Vector3;
    barrier: PomBossBarrier;
    isFisrtCall = false;
    constructor(e: Entity, server: PomServer) {
        super(e, server);
        this.startPos = this.exEntity.getPosition();
        let barrier = PomBossBarrier.find(this.startPos);

        if (!barrier) {
            this.isFisrtCall = true;
            barrier = new PomBossBarrier(server, this.exEntity.getExDimension(),
                new ExBlockArea(this.startPos.clone().sub(32, 32, 32), this.startPos.clone().add(32, 32, 32), true),
                this);
        } else {
            barrier.setBoss(this);
        }
        this.barrier = barrier;

        if (barrier.players.size === 0) {
            this.despawn();
            this.stopBarrier();
            this.destroyBossEntity();
        }else{
            this.initBossEntity();
        }
    }
    despawn() {
        this.entity.triggerEvent("minecraft:despawn");
    }
    onFail() {
        console.warn("onFail");
        for (let c of this.barrier.clientsByPlayer()) {
            c.ruinsSystem.causeDamageShow = false;
        }
        this.stopBarrier();
        this.destroyBossEntity();
        this.server.say({ rawtext: [{ translate: "text.dec:killed_by_boss.name" }] });
        this.despawn();
    }

    override onKilled(e: EntityHurtEvent): void {
        this.destroyBossEntity();
        if (e.cause === EntityDamageCause.suicide) {
            this.stopBarrier();
        }
        super.onKilled(e);
    }

    override onSpawn(): void {
        super.onSpawn();
    }

    stopBarrier() {
        this.barrier.stop();
    }
    destroyBossEntity(){

    }
    initBossEntity(){

    }
}