import { Entity } from "@minecraft/server";
import DecServer from "../DecServer.js";
import ExEntityController from "../../../modules/exmc/server/entity/ExEntityController.js";
import ExGameVector3 from "../../../modules/exmc/server/math/ExGameVector3.js";
import DecClient from "../DecClient.js";
import ExGame from "../../../modules/exmc/server/ExGame.js";
import PomServer from "../../../pom/server/PomServer.js";
import DecGlobal from '../DecGlobal';

export default class DecBossController extends ExEntityController {
    constructor(e: Entity, server: DecServer) {
        super(e, server);
    }
    despawn() {
        this.entity.triggerEvent("minecraft:despawn");
    }
    onFail() {
        this.server.say({ rawtext: [{ translate: "text.dec:killed_by_boss.name" }] });
        this.despawn();
    }

    //发信息给pom，判断完成任务
    onWin() {
        if (!DecGlobal.isDec()) {
            for (let p of this.entity.dimension.getPlayers({
                location: ExGameVector3.getLocation(this.entity.location),
                maxDistance: 32
            })) {
                let c = <DecClient | undefined>this.server.findClientByPlayer(p);
                if (c) {
                    ExGame.postMessageBetweenClient(c, PomServer, "progressTaskFinish", [this.entity.typeId, 1000]);
                }
            }
        }
    }
}