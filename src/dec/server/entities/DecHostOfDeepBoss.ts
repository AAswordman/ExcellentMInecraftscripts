import { Entity, EntityDamageCause, EntityHurtAfterEvent } from "@minecraft/server";
import ExGameServer from "../../../modules/exmc/server/ExGameServer.js";
import ExEntityController from "../../../modules/exmc/server/entity/ExEntityController.js";
import ExSound from "../../../modules/exmc/server/env/ExSound.js";
import SetTimeOutSupport from "../../../modules/exmc/interface/SetTimeOutSupport.js";
import DecBossController from "./DecBossController.js";
import DecServer from '../DecServer.js';
import { DecCommonBossLastStage } from "./DecCommonBossLastStage.js";
import { registerEvent } from "../../../modules/exmc/server/events/eventDecoratorFactory.js";

export class DecHostOfDeepBoss1 extends DecBossController {
    music: ExSound;
    constructor(e: Entity, server: DecServer) {
        super(e, server);
        this.music = server.getSound("music.wb.from_the_burning_deep", "4:18");
        this.setTimeout(() => {
            this.music.loop(this.exEntity.exDimension, this.entity.location);
        }, 500);
    }
    override onDestroy(): void {
        this.music.delayStop(800);
        super.onDestroy();
    }
    override onSpawn(): void {
        super.onSpawn();
    }
    override onKilled(e: EntityHurtAfterEvent): void {
        super.onKilled(e);
    }
}
export class DecHostOfDeepBoss2 extends DecBossController {
    music: ExSound;
    constructor(e: Entity, server: DecServer) {
        super(e, server);
        this.music = server.getSound("music.wb.from_the_burning_deep", "4:18");
        this.setTimeout(() => {
            this.music.loop(this.exEntity.exDimension, this.entity.location);
        }, 500);
    }
    override onDestroy(): void {
        this.music.delayStop(500);
        super.onDestroy();
    }
    override onSpawn(): void {
        super.onSpawn();
    }
    override onKilled(e: EntityHurtAfterEvent): void {
        super.onKilled(e);
    }
}
export class DecHostOfDeepBoss3 extends DecCommonBossLastStage {
    music: ExSound;
    constructor(e: Entity, server: DecServer) {
        super(e, server);
        this.music = server.getSound("music.wb.from_the_burning_deep", "4:18");
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