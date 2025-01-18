import { Entity } from "@minecraft/server";
import ExMusic from "../../../modules/exmc/server/env/ExMusic.js";
import DecServer from "../DecServer.js";
import { DecCommonBossLastStage } from "./DecCommonBossLastStage.js";

export class DecLeavesGolemBoss extends DecCommonBossLastStage {
    music: ExMusic;
    constructor(e: Entity, server: DecServer, spawn: boolean) {
        super(e, server,spawn);
        this.music = server.getMusic("music.wb.wooden_heart");
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