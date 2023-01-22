import { Entity } from '@minecraft/server';
import ExGameServer from '../../../modules/exmc/server/ExGameServer.js';
import ExEntityController from '../../../modules/exmc/server/entity/ExEntityController.js';
import ExGameConfig from '../../../modules/exmc/server/ExGameConfig.js';
import PomBossController from './PomBossController.js';
import PomServer from '../PomServer.js';

export default class PomMagicStoneBoss extends PomBossController{
    constructor(e:Entity,server:PomServer) {
        super(e,server);
    }
    override onSpawn(): void {
        super.onSpawn();
    }
    
}