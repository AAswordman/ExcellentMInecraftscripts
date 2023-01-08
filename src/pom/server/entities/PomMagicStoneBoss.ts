import { Entity } from '@minecraft/server';
import ExGameServer from '../../../modules/exmc/server/ExGameServer.js';
import ExEntityController from '../../../modules/exmc/server/entity/ExEntityController.js';
import ExGameConfig from '../../../modules/exmc/server/ExGameConfig.js';

export default class PomMagicStoneBoss extends ExEntityController{
    constructor(e:Entity,server:ExGameServer) {
        super(e,server);
    }
    override onSpawn(): void {
        super.onSpawn();
    }
    
}