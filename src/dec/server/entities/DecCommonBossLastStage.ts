import { Entity, EntityDieAfterEvent, EntityHurtAfterEvent } from "@minecraft/server";
import ExMusic from "../../../modules/exmc/server/env/ExMusic.js";
import DecServer from "../DecServer.js";
import DecBossController from "./DecBossController.js";

export class DecCommonBossLastStage extends DecBossController{
    constructor(e: Entity, server: DecServer, spawn: boolean) {
        super(e, server,spawn);
    }
    override onDestroy(): void {
        super.onDestroy();
    }
    override onAppear(spawn:boolean): void {
        super.onAppear(spawn);
    }
    override onKilled(e: EntityDieAfterEvent): void {
        this.onWin();
        super.onKilled(e);
    }
}