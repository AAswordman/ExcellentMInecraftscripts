import { Entity, Player } from '@minecraft/server';
import ExGameServer from '../../../modules/exmc/server/ExGameServer.js';
import ExEntityController from '../../../modules/exmc/server/entity/ExEntityController.js';
import ExGameConfig from '../../../modules/exmc/server/ExGameConfig.js';
import { SimulatedPlayer } from '@minecraft/server-gametest';
import ExPlayerController from '../../../modules/exmc/server/entity/ExPlayerController.js';

export default class PomFakePlayer extends ExPlayerController{
    // constructor(p:SimulatedPlayer,server:ExGameServer) {
    //     super(p,server);
    // }
    // override onSpawn(): void {
    //     super.onSpawn();
    // }
    // override get entity(){
    //     return super.entity as unknown as SimulatedPlayer;
    // }
    // override set entity(p:SimulatedPlayer){
    //     super.entity = p as unknown as Player;
    // }
    
}