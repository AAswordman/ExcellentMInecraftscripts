import { Entity, EntityHurtAfterEvent } from "@minecraft/server";
import ExSound from "../../../modules/exmc/server/env/ExSound.js";
import DecServer from "../DecServer.js";
import DecBossController from "./DecBossController.js";

export class DecCommonBossLastStage extends DecBossController{
    constructor(e: Entity, server: DecServer) {
        super(e, server);
    }
    override onDestroy(): void {
        super.onDestroy();
    }
    override onSpawn(): void {
        super.onSpawn();
    }
    override onKilled(e: EntityHurtAfterEvent): void {
        this.onWin();
        super.onKilled(e);
    }
}