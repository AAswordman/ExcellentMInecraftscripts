import { Entity } from "@minecraft/server";
import ExGameServer from "../../../modules/exmc/server/ExGameServer.js";
import ExEntityController from "../../../modules/exmc/server/entity/ExEntityController.js";
import ExSound from "../../../modules/exmc/server/env/ExSound.js";
import SetTimeOutSupport from "../../../modules/exmc/interface/SetTimeOutSupport.js";

export class DecEverlastingWinterGhastBoss1 extends ExEntityController{
    music: ExSound;
    constructor(e: Entity, server: ExGameServer) {
        super(e, server);
        this.music = new ExSound("music.wb.ghost_tears","2:16");
    }
    override onDestroy(): void {
        this.music.stop();
        super.onDestroy();
    }
    override onSpawn(): void {
        this.setTimeout(()=>{
            this.music.loop(this.getEvents(),this.exEntity.getExDimension(),this.entity.location);
        },500);
        super.onSpawn();
    }
}
export class DecEverlastingWinterGhastBoss2 extends ExEntityController{
    music: ExSound;
    constructor(e: Entity, server: ExGameServer) {
        super(e, server);
        this.music = new ExSound("music.wb.the_peotry_of_ghost","3:12");
    }
    override onDestroy(): void {
        this.music.stop();
        super.onDestroy();
    }
    override onSpawn(): void {
        this.setTimeout(()=>{
            this.music.loop(this.getEvents(),this.exEntity.getExDimension(),this.entity.location);
        },500);
        super.onSpawn();
    }
}