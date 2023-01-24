import { Entity, EntityHurtEvent } from "@minecraft/server";
import ExSound from "../../../modules/exmc/server/env/ExSound";
import DecServer from "../DecServer";
import DecBossController from "./DecBossController";

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
    override onKilled(e: EntityHurtEvent): void {
        this.onWin();
        super.onKilled(e);
    }
}