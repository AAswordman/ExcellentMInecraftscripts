import { Entity, EntityDamageCause, EntityDieAfterEvent, EntityHurtAfterEvent } from "@minecraft/server";
import ExGameServer from "../../../modules/exmc/server/ExGameServer.js";
import ExEntityController from "../../../modules/exmc/server/entity/ExEntityController.js";
import ExMusic from "../../../modules/exmc/server/env/ExMusic.js";
import SetTimeOutSupport from "../../../modules/exmc/interface/SetTimeOutSupport.js";
import DecBossController from "./DecBossController.js";
import DecServer from '../DecServer.js';
import { DecCommonBossLastStage } from "./DecCommonBossLastStage.js";
import { registerEvent } from "../../../modules/exmc/server/events/eventDecoratorFactory.js";

export class DecHostOfDeepBoss1 extends DecBossController {
    music: ExMusic;
    constructor(e: Entity, server: DecServer, spawn: boolean) {
        super(e, server,spawn);
        this.music = server.getMusic("music.wb.from_the_burning_deep");
        this.music.trackPlayers(Array.from(this.barrier.getPlayers()));
        this.music.loop();
    }
    override onAppear(spawn:boolean): void {
        super.onAppear(spawn);
    }
    override onFail(): void {
        this.music.stop();
        super.onFail();
    }
    override onKilled(e: EntityDieAfterEvent): void {
        super.onKilled(e);
        if (e.damageSource.cause === EntityDamageCause.selfDestruct) {
            this.music.stop();
        }
    }
}
export class DecHostOfDeepBoss2 extends DecBossController {
    music: ExMusic;
    constructor(e: Entity, server: DecServer, spawn: boolean) {
        super(e, server,spawn);
        this.music = server.getMusic("music.wb.from_the_burning_deep");
        this.music.trackPlayers(Array.from(this.barrier.getPlayers()));

    }
    override onAppear(spawn:boolean): void {
        super.onAppear(spawn);
    }
    override onFail(): void {
        this.music.stop();
        super.onFail();
    }
    override onKilled(e: EntityDieAfterEvent): void {
        super.onKilled(e);
        if (e.damageSource.cause === EntityDamageCause.selfDestruct) {
            this.music.stop();
        }
    }
}
export class DecHostOfDeepBoss3 extends DecCommonBossLastStage {
    music: ExMusic;
    constructor(e: Entity, server: DecServer, spawn: boolean) {
        super(e, server,spawn);
        this.music = server.getMusic("music.wb.from_the_burning_deep");
        this.music.trackPlayers(Array.from(this.barrier.getPlayers()));

    }
    override onDestroy(): void {
        this.music.stop();
        super.onDestroy();
    }
    override onAppear(spawn:boolean): void {
        super.onAppear(spawn);
    }
}