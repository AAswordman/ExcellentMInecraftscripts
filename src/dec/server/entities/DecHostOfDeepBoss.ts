import { Entity, EntityHurtEvent } from "@minecraft/server";
import ExGameServer from "../../../modules/exmc/server/ExGameServer.js";
import ExEntityController from "../../../modules/exmc/server/entity/ExEntityController.js";
import ExSound from "../../../modules/exmc/server/env/ExSound.js";
import SetTimeOutSupport from "../../../modules/exmc/interface/SetTimeOutSupport.js";
import DecBossController from "./DecBossController.js";
import DecServer from '../DecServer.js';
import { DecCommonBossLastStage } from "./DecCommonBossLastStage.js";

export class DecHostOfDeepBoss1 extends DecBossController {
    music: ExSound;
    constructor(e: Entity, server: DecServer) {
        super(e, server);
        this.music = server.getSound("music.wb.from_the_burning_deep", "4:18");
        this.setTimeout(() => {
            this.music.loop(this.exEntity.getExDimension(), this.entity.location);
        }, 500);
    }
    override onDestroy(): void {
        if(!this.isKilled) this.music.stop();
        super.onDestroy();
    }
    override onSpawn(): void {
        super.onSpawn();
    }
    isKilled = false;
    override onKilled(e: EntityHurtEvent): void {
        this.isKilled = true;
        super.onKilled(e);
    }
}
export class DecHostOfDeepBoss2 extends DecBossController {
    music: ExSound;
    constructor(e: Entity, server: DecServer) {
        super(e, server);
        this.music = server.getSound("music.wb.from_the_burning_deep", "4:18");
        this.setTimeout(() => {
            this.music.loop(this.exEntity.getExDimension(), this.entity.location);
        }, 500);
    }
    override onDestroy(): void {
        if(!this.isKilled) this.music.stop();
        super.onDestroy();
    }
    override onSpawn(): void {
        super.onSpawn();
    }
    isKilled = false;
    override onKilled(e: EntityHurtEvent): void {
        this.isKilled = true;
        super.onKilled(e);
    }
}
export class DecHostOfDeepBoss3 extends DecCommonBossLastStage {
    music: ExSound;
    constructor(e: Entity, server: DecServer) {
        super(e, server);
        this.music = server.getSound("music.wb.from_the_burning_deep", "4:18");
        this.setTimeout(() => {
            this.music.loop(this.exEntity.getExDimension(), this.entity.location);
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