import { Entity, EntityHurtAfterEvent, EntityDamageCause, EntityDieAfterEvent } from '@minecraft/server';
import ExEntityController from '../../../modules/exmc/server/entity/ExEntityController.js';
import PomBossBarrier from './barrier/PomBossBarrier.js';
import { ExBlockArea } from '../../../modules/exmc/server/block/ExBlockArea.js';
import PomServer from '../PomServer.js';
import Vector3 from '../../../modules/exmc/utils/math/Vector3.js';
import ExGameServer from '../../../modules/exmc/server/ExGameServer.js';
import TickDelayTask from '../../../modules/exmc/utils/TickDelayTask.js';
import ExSystem from '../../../modules/exmc/utils/ExSystem.js';
import { registerEvent } from '../../../modules/exmc/server/events/eventDecoratorFactory.js';
import { ExOtherEventNames, TickEvent } from '../../../modules/exmc/server/events/events.js';

export default class PomBossController extends ExEntityController {
    startPos!: Vector3;
    barrier!: PomBossBarrier;
    isFisrtCall = false;
    onFail() {
        console.info("onFail");
        this.stopBattle();
        this.server.say({ rawtext: [{ translate: "text.dec:killed_by_boss.name" }] });
        this.destroyTrigger();
    }
    onWin() {
        //设置奖励
        for (let c of this.barrier.clientsByPlayer()) {
            c.progressTaskFinish(this.entity.typeId, c.ruinsSystem.causeDamage);
            c.ruinsSystem.causeDamageShow = false;
        }

        this.stopBarrier();
        console.info("onWin");
    }

    override onKilled(e: EntityDieAfterEvent): void {
        if (e.damageSource.cause === EntityDamageCause.selfDestruct) {
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
            this.destroyTrigger();
            this.stopBarrier();
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
    initBossEntity() {
        for (let c of this.barrier.clientsByPlayer()) {
            c.ruinsSystem.causeDamageShow = true;
            c.ruinsSystem.causeDamageType.add(this.entity.typeId);
        }
    }

    lastPosition = new Vector3(this.barrier.center);
    @registerEvent(ExOtherEventNames.onLongTick)
    _lastPositionUpdater(e: TickEvent) {
        this.lastPosition.set(this.entity.location);
    }

    autoJudgeTimer?: TickDelayTask;
    override onMemoryRemove(): void {
        super.onMemoryRemove();
        const dim = this.exEntity.exDimension;
        this.autoJudgeTimer?.stop();
        this.autoJudgeTimer = ExSystem.tickTask(this.server, () => {
            if (this.isKilled || this.isDestroyed) {
                this.autoJudgeTimer?.stop();
                return;
            }
            if (dim.chunkIsLoaded(this.lastPosition)) {
                this.autoJudgeTimer?.stop();
                console.info("onKilled - by autoJudge");
                this.onKilled({
                    "damageSource": {
                        "cause": EntityDamageCause.suffocation
                    },
                    "deadEntity": this.entity
                });
            }
        }).delay(20 * 2).start();
    }
    override onMemoryLoad(): void {
        super.onMemoryLoad();
        if (this.autoJudgeTimer) {
            this.autoJudgeTimer.stop();
            this.autoJudgeTimer = undefined;
        }
    }
}