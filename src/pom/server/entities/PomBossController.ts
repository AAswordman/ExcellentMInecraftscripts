import { Entity, EntityHurtAfterEvent, EntityDamageCause } from '@minecraft/server';
import ExEntityController from '../../../modules/exmc/server/entity/ExEntityController.js';
import PomBossBarrier from './barrier/PomBossBarrier.js';
import { ExBlockArea } from '../../../modules/exmc/server/block/ExBlockArea.js';
import PomServer from '../PomServer.js';
import Vector3 from '../../../modules/exmc/utils/math/Vector3.js';
import ExGameServer from '../../../modules/exmc/server/ExGameServer.js';

export default class PomBossController extends ExEntityController {
    startPos!: Vector3;
    barrier!: PomBossBarrier;
    isFisrtCall = false;
    despawn() {
        this.entity.remove();
    }
    onFail() {
        console.warn("onFail");
        this.stopBattle();
        this.destroyBossEntity();
        this.server.say({ rawtext: [{ translate: "text.dec:killed_by_boss.name" }] });
        this.despawn();
    }
    onWin() {
        //设置奖励
        for (let c of this.barrier.clientsByPlayer()) {
            c.progressTaskFinish(this.entity.typeId, c.ruinsSystem.causeDamage);
            c.ruinsSystem.causeDamageShow = false;
        }
        this.stopBarrier();

        console.warn("onWin");
    }

    override onKilled(e: EntityHurtAfterEvent): void {
        this.destroyBossEntity();
        if (e.damageSource.cause === EntityDamageCause.suicide || e.damageSource.cause === EntityDamageCause.selfDestruct) {
            this.stopBattle();
        }
        super.onKilled(e);
    }

    override onAppear(spawn: boolean): void {
        super.onAppear(spawn);
        this.startPos = this.exEntity.position;
        let barrier = PomBossBarrier.find(this.startPos);
        this.isFisrtCall = spawn;
        if (!barrier) {
            barrier = new PomBossBarrier(this.server as PomServer, this.exEntity.exDimension,
                new ExBlockArea(this.startPos.cpy().sub(32, 32, 32), this.startPos.cpy().add(32, 32, 32), true),
                this);
        } else {
            barrier.setBoss(this);
        }
        this.barrier = barrier;

        if (barrier.players.size === 0) {
            this.despawn();
            this.stopBarrier();
            this.destroyBossEntity();
        } else {
            this.initBossEntity();
        }
    }

    stopBarrier() {
        this.barrier.stop();
    }

    stopBattle() {
        for (let c of this.barrier.clientsByPlayer()) {
            c.ruinsSystem.causeDamageShow = false;
        }
        this.stopBarrier();
    }

    destroyBossEntity() {

    }
    initBossEntity() {
        for (let c of this.barrier.clientsByPlayer()) {
            c.ruinsSystem.causeDamageShow = true;
            c.ruinsSystem.causeDamageType.add(this.entity.typeId);
        }
    }
}