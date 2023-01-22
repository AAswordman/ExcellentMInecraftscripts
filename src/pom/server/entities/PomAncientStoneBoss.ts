import { Entity } from '@minecraft/server';
import ExGameServer from '../../../modules/exmc/server/ExGameServer.js';
import ExEntityController from '../../../modules/exmc/server/entity/ExEntityController.js';
import ExGameConfig from '../../../modules/exmc/server/ExGameConfig.js';
import PomBossController from './PomBossController.js';
import ExSound from '../../../modules/exmc/server/env/ExSound.js';
import PomServer from '../PomServer.js';

export default class PomAncientStoneBoss extends PomBossController{
    music: ExSound;
    constructor(e: Entity, server: PomServer) {
        super(e, server);
        this.music = new ExSound("music.wb.anger_of_ancient","2:24");
        this.setTimeout(()=>{
            this.music.loop(this.getEvents(),this.exEntity.getExDimension(),this.entity.location);
        },500);
    }
    override onDestroy(): void {
        this.music.stop();
        super.onDestroy();
    }
    override onSpawn(): void {
        super.onSpawn();
    }
}