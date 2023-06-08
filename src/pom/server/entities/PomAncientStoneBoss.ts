import { Entity, EntityDamageCause, EntityHurtAfterEvent, world } from '@minecraft/server';
import ExGameServer from '../../../modules/exmc/server/ExGameServer.js';
import ExEntityController from '../../../modules/exmc/server/entity/ExEntityController.js';
import ExGameConfig from '../../../modules/exmc/server/ExGameConfig.js';
import PomBossController from './PomBossController.js';
import PomServer from '../PomServer.js';
import PomClient from '../PomClient.js';
import ExSound from '../../../modules/exmc/server/env/ExSound.js';

export default class PomAncientStoneBoss extends PomBossController {
    static typeId = "wb:ancient_stone"
    music: ExSound;
    constructor(e: Entity, server: PomServer) {
        super(e, server);
        this.music = server.getSound("music.wb.anger_of_ancient", "2:24");
    }
    override initBossEntity(): void {
        for (let c of this.barrier.clientsByPlayer()) {
            c.ruinsSystem.causeDamageShow = true;
            c.ruinsSystem.causeDamageType.add(this.entity.typeId);
        }
        if (!this.exEntity.hasIsBabyComponent() && this.isFisrtCall){
            this.server.say({ rawtext: [{ translate: "text.wb:summon_ancient_stone.name" }] });
            this.setTimeout(() => {
                this.music.loop(this.exEntity.exDimension, this.entity.location);
            }, 500);
        }
    }
    override onSpawn(): void {
        super.onSpawn();
    }
    override onKilled(e: EntityHurtAfterEvent): void {
        //设置奖励
        if (this.exEntity.hasIsBabyComponent()) {
            for (let c of this.barrier.clientsByPlayer()) {
                c.progressTaskFinish(this.entity.typeId, c.ruinsSystem.causeDamage);
                c.ruinsSystem.causeDamageShow = false;
            }
            this.server.say({ rawtext: [{ translate: "text.wb:defeat_ancient_stone.name" }] });

            console.warn("onWin");
            this.stopBarrier();
            this.music.stop();
        }
        if (e.damageSource.cause === EntityDamageCause.suicide) {
            this.music.stop();
        }
        super.onKilled(e);
    }
    override onFail(): void {
        this.music.stop();
        super.onFail();
    }

}