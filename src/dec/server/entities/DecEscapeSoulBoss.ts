import { Entity, EntityDamageCause, EntityHurtAfterEvent } from "@minecraft/server";
import ExGameServer from "../../../modules/exmc/server/ExGameServer.js";
import ExEntityController from "../../../modules/exmc/server/entity/ExEntityController.js";
import ExMusic from "../../../modules/exmc/server/env/ExMusic.js";
import SetTimeOutSupport from "../../../modules/exmc/interface/SetTimeOutSupport.js";
import DecBossController from "./DecBossController.js";
import DecServer from '../DecServer.js';
import { DecCommonBossLastStage } from "./DecCommonBossLastStage.js";

export class DecEscapeSoulBoss3 extends DecBossController {
    music: ExMusic;
    constructor(e: Entity, server: DecServer, spawn: boolean) {
        super(e,server,spawn);
        this.music = server.getMusic("music.wb.chasing_stage1");
        this.music.trackPlayers(Array.from(this.barrier.getPlayers()));
        this.music.loop();
    }
    override onKilled(e: EntityHurtAfterEvent): void {
        super.onKilled(e);
        if (e.damageSource.cause === EntityDamageCause.suicide || e.damageSource.cause === EntityDamageCause.selfDestruct) {
            this.music.stop();
        }
    }
    override onFail(): void {
        this.music.stop();
        super.onFail();
    }
    override onAppear(spawn:boolean): void {
        super.onAppear(spawn);
    }
}
export class DecEscapeSoulBoss4 extends DecBossController {
    music: ExMusic;
    constructor(e: Entity, server: DecServer, spawn: boolean) {
        super(e, server,spawn);
        this.music = server.getMusic("music.wb.chasing_stage2");
        this.music.trackPlayers(Array.from(this.barrier.getPlayers()));
        this.music.loop();
    }
    override onKilled(e: EntityHurtAfterEvent): void {
        super.onKilled(e);
        if (e.damageSource.cause === EntityDamageCause.suicide || e.damageSource.cause === EntityDamageCause.selfDestruct) {
            this.music.stop();
        }
    }
    override onFail(): void {
        this.music.stop();
        super.onFail();
    }
    override onAppear(spawn:boolean): void {
        super.onAppear(spawn);
    }
}
export class DecEscapeSoulBoss5 extends DecCommonBossLastStage {
    music: ExMusic;
    constructor(e: Entity, server: DecServer, spawn: boolean) {
        super(e, server,spawn);
        this.music = server.getMusic("music.wb.chasing_stage3");
        this.music.trackPlayers(Array.from(this.barrier.getPlayers()));
        this.music.loop();
    }
    override onDestroy(): void {
        this.music.stop();
        super.onDestroy();
    }
    override onAppear(spawn:boolean): void {
        super.onAppear(spawn);
    }
}