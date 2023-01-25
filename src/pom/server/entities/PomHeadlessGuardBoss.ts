
import { Entity, EntityHurtEvent, world } from '@minecraft/server';
import ExGameServer from '../../../modules/exmc/server/ExGameServer.js';
import ExEntityController from '../../../modules/exmc/server/entity/ExEntityController.js';
import ExGameConfig from '../../../modules/exmc/server/ExGameConfig.js';
import PomBossController from './PomBossController.js';
import PomServer from '../PomServer.js';
import PomClient from '../PomClient.js';
import ExSound from '../../../modules/exmc/server/env/ExSound.js';

export default class PomHeadlessGuardBoss extends PomBossController {
    static typeId = "wb:headless_guard"
    music: ExSound;
    constructor(e: Entity, server: PomServer) {
        super(e, server);
        this.music = new ExSound("music.wb.unknown_world", "2:16");
        this.setTimeout(() => {
            this.music.loop(this.getEvents(), this.exEntity.getExDimension(), this.entity.location);
        }, 500);
        for (let c of this.barrier.clientsByPlayer()) {
            c.ruinsSystem.causeDamageShow = true;
            c.ruinsSystem.causeDamageType.add(this.entity.typeId);
        }
        if(this.barrier.players.size !== 0) this.server.say({ rawtext: [{ translate: "text.wb:summon_headless_guard.name" }] })
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
        this.server.say({ rawtext: [{ translate: "text.wb:defeat_headless_guard.name" }] });

        console.warn("onWin");
        this.stopBarrier();
        this.music.stop();
        super.onKilled(e);
    }
    override onFail(): void {
        this.music.stop();
        super.onFail();
    }

}