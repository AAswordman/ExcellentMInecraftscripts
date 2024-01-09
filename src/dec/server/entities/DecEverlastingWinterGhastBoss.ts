import { Entity } from "@minecraft/server";
import ExGameServer from "../../../modules/exmc/server/ExGameServer.js";
import ExEntityController from "../../../modules/exmc/server/entity/ExEntityController.js";
import ExMusic from "../../../modules/exmc/server/env/ExMusic.js";
import SetTimeOutSupport from "../../../modules/exmc/interface/SetTimeOutSupport.js";
import DecBossController from "./DecBossController.js";
import DecServer from '../DecServer.js';
import { DecCommonBossLastStage } from "./DecCommonBossLastStage.js";

export class DecEverlastingWinterGhastBoss1 extends DecBossController {
    music: ExMusic;
    constructor(e: Entity, server: DecServer) {
        super(e, server);
        this.music = server.getMusic("music.wb.ghost_tears", "2:16");
        this.setTimeout(() => {
            this.music.loop(this.exEntity.exDimension, this.entity.location);
        }, 500);
    }
    override onDestroy(): void {
        this.music.stop();
        super.onDestroy();
    }
    override onSpawn(): void {
        super.onSpawn();
    }
}
export class DecEverlastingWinterGhastBoss2 extends DecCommonBossLastStage {
    music: ExMusic;
    constructor(e: Entity, server: DecServer) {
        super(e, server);
        this.music = server.getMusic("music.wb.the_peotry_of_ghost", "3:12");
        this.setTimeout(() => {
            this.music.loop(this.exEntity.exDimension, this.entity.location);
        }, 500);
    }
    override onDestroy(): void {
        this.music.stop();
        super.onDestroy();
    }
    override onSpawn(): void {
        super.onSpawn();
    }
}