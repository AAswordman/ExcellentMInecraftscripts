
import { Entity, EntityHurtEvent, world, TickEvent } from '@minecraft/server';
import ExGameServer from '../../../modules/exmc/server/ExGameServer.js';
import ExEntityController from '../../../modules/exmc/server/entity/ExEntityController.js';
import ExGameConfig from '../../../modules/exmc/server/ExGameConfig.js';
import PomBossController from './PomBossController.js';
import PomServer from '../PomServer.js';
import PomClient from '../PomClient.js';
import ExSound from '../../../modules/exmc/server/env/ExSound.js';
import { registerEvent } from '../../../modules/exmc/server/events/eventDecoratorFactory.js';
import ExErrorQueue from '../../../modules/exmc/server/ExErrorQueue.js';
import VarOnChangeListener from '../../../modules/exmc/utils/VarOnChangeListener.js';

export class PomIntentionsBoss1 extends PomBossController {
    static typeId = "wb:intentions_first";
    constructor(e: Entity, server: PomServer) {
        super(e, server);
    }
    override initBossEntity(): void {
        for (let c of this.barrier.clientsByPlayer()) {
            c.ruinsSystem.causeDamageShow = true;
            c.ruinsSystem.causeDamageType.add(this.entity.typeId);
        }
        if (this.isFisrtCall) this.server.say({ rawtext: [{ translate: "text.wb:summon_intentions.name" }] });
        this.barrier.changeFog("wb:ruin_mind_1_boss");
    }
    override onSpawn(): void {
        super.onSpawn();
    }
    override onKilled(e: EntityHurtEvent): void {
        super.onKilled(e);
    }
    override onFail(): void {
        super.onFail();
    }

    @registerEvent("onLongTick")
    onLongTick(e: TickEvent) {
        try {
            if (this.exEntity.hasIsChargedComponent()) {
                this.barrier.particle("wb:ruin_mind_boss_resist_par");
            }
        } catch (e) {
            ExErrorQueue.throwError(e);
        }
    }

}

export class PomIntentionsBoss2 extends PomBossController {
    static typeId = "wb:intentions_second";
    constructor(e: Entity, server: PomServer) {
        super(e, server);
    }
    override initBossEntity(): void {
        for (let c of this.barrier.clientsByPlayer()) {
            c.ruinsSystem.causeDamageShow = true;
            c.ruinsSystem.causeDamageType.add(this.entity.typeId);
        }
        this.barrier.changeFog("wb:ruin_mind_2_boss");
    }
    override onSpawn(): void {
        super.onSpawn();
    }
    override onKilled(e: EntityHurtEvent): void {
        super.onKilled(e);
    }
    override onFail(): void {
        super.onFail();
    }

    @registerEvent("onLongTick")
    onLongTick(e: TickEvent) {
        try {
            if (this.exEntity.hasIsBabyComponent()) {
                this.barrier.particle("wb:ruin_mind_boss_floor_par");
                this.barrier.changeFog("wb:ruin_mind_3_boss");
            } else {
                this.barrier.changeFog("wb:ruin_mind_2_boss");
            }
        } catch (e) {
            ExErrorQueue.throwError(e);
        }
    }

}

export class PomIntentionsBoss3 extends PomBossController {
    static typeId = "wb:intentions_third";
    constructor(e: Entity, server: PomServer) {
        super(e, server);
    }
    override initBossEntity(): void {
        this.state = new VarOnChangeListener((n) => {
            switch (n) {
                case 9:
                    this.exEntity.getExDimension().spawnParticle("wb:ruin_mind_boss_third_par", this.exEntity.getPosition());
                    break;
                case 1:
                case 2:
                case 3:
                    this.exEntity.getExDimension().spawnParticle("wb:ruin_mind_boss_second_par", this.exEntity.getPosition());
                    break;
            }
        }, 1);
        this.changeFog = new VarOnChangeListener((n) => {
            if (n === "wb:ruin_mind_5_boss") {
                this.barrier.changeFog("wb:ruin_mind_4_boss");
                this.setTimeout(() => {
                    this.barrier.changeFog("wb:ruin_mind_5_boss");
                }, 5000);
            } else {
                this.barrier.changeFog(n);
            }
        }, "");
        for (let c of this.barrier.clientsByPlayer()) {
            c.ruinsSystem.causeDamageShow = true;
            c.ruinsSystem.causeDamageType.add(this.entity.typeId);
        }
        this.changeFog.upDate("wb:ruin_mind_5_boss");
    }
    changeFog!: VarOnChangeListener<string>; 
    state!: VarOnChangeListener<number>; 
    @registerEvent("onLongTick")
    onLongTick(e: TickEvent) {
        try {
            if (this.exEntity.hasIsBabyComponent()) {
                this.barrier.particle("wb:ruin_mind_boss_floor_par");
                this.changeFog.upDate("wb:ruin_mind_3_boss");

            } else {
                this.changeFog.upDate("wb:ruin_mind_5_boss");
            }
            this.state.upDate(this.exEntity.getVariant())
        } catch (e) {
            ExErrorQueue.throwError(e);
        }
    }
    override onSpawn(): void {
        super.onSpawn();
    }
    override onKilled(e: EntityHurtEvent): void {
        //设置奖励
        for (let c of this.barrier.clientsByPlayer()) {
            c.progressTaskFinish(this.entity.typeId, c.ruinsSystem.causeDamage);
            c.ruinsSystem.causeDamageShow = false;
        }
        this.server.say({ rawtext: [{ translate: "text.wb:defeat_intentions.name" }] });

        console.warn("onWin");
        this.stopBarrier();
        super.onKilled(e);
    }
    override onFail(): void {
        super.onFail();
    }

}