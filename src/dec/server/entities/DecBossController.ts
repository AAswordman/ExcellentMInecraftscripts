import { Entity, EntityDamageCause, EntityDieAfterEvent, EntityHurtAfterEvent } from "@minecraft/server";
import DecServer from "../DecServer.js";
import ExEntityController from "../../../modules/exmc/server/entity/ExEntityController.js";
import DecClient from "../DecClient.js";
import ExGame from "../../../modules/exmc/server/ExGame.js";
import PomServer from "../../../pom/server/PomServer.js";
import DecGlobal from '../DecGlobal.js';
import { ExBlockArea } from "../../../modules/exmc/server/block/ExBlockArea.js";
import DecBossBarrier from "./DecBossBarrier.js";
import Vector3 from "../../../modules/exmc/utils/math/Vector3.js";
import { ExOtherEventNames, TickEvent } from "../../../modules/exmc/server/events/events.js";
import { registerEvent } from "../../../modules/exmc/server/events/eventDecoratorFactory.js";
import TickDelayTask from "../../../modules/exmc/utils/TickDelayTask.js";
import ExSystem from "../../../modules/exmc/utils/ExSystem.js";
import ExServerTickDelayTask from "../../../modules/exmc/server/ExServerTickDelayTask.js";

export default class DecBossController extends ExEntityController {
    startPos: Vector3;
    barrier: DecBossBarrier;
    isFisrtCall = false;
    constructor(e: Entity, server: DecServer, spawn: boolean) {
        super(e, server, spawn);
        this.startPos = this.exEntity.position;
        let barrier = DecBossBarrier.find(this.startPos);

        if (!barrier) {
            this.isFisrtCall = true;
            barrier = new DecBossBarrier(server, this.exEntity.exDimension,
                new ExBlockArea(this.startPos.cpy().sub(32, 32, 32), this.startPos.cpy().add(32, 32, 32), true),
                this);
        } else {
            barrier.setBoss(this);
        }
        this.barrier = barrier;

        if (barrier.players.size === 0) {
            this.destroyTrigger();
            this.stopBarrier();
        } else {
            this.initBossEntity();
        }
    }
    despawn() {
        this.entity.triggerEvent("minecraft:despawn");
    }

    override onAppear(spawn: boolean): void {
        super.onAppear(spawn);
    }

    stopBarrier() {
        this.barrier.stop();
    }
    initBossEntity() {

    }
    override onKilled(e: EntityDieAfterEvent): void {
        if (e.damageSource.cause === EntityDamageCause.selfDestruct) {
            this.stopBarrier();
        }
        super.onKilled(e);
    }
    onFail() {
        this.stopBarrier();
        this.server.say({ rawtext: [{ translate: "text.dec:killed_by_boss.name" }] });
        this.destroyTrigger();
    }

    //发信息给pom，判断完成任务
    onWin() {
        this.stopBarrier();
        if (!DecGlobal.isDec()) {
            for (let c of this.barrier.clientsByPlayer()) {
                ExGame.postMessageBetweenClient(c, PomServer, "progressTaskFinish", [this.getTypeId(), 1000]);
            }
        }
    }


    lastPosition = new Vector3();
    @registerEvent(ExOtherEventNames.onLongTick)
    _lastPositionUpdater(e: TickEvent) {
        this.lastPosition.set(this.entity.location);
    }

    autoJudgeTimer?: TickDelayTask;
    override onMemoryRemove(): void {
        super.onMemoryRemove();
        const dim = this.exEntity.exDimension;
        this.autoJudgeTimer?.stop();
        this.autoJudgeTimer = ExSystem.tickTask(this.server, () => {
            if (this.isKilled || this.isDestroyed) {
                this.autoJudgeTimer?.stop();
                return;
            }
            if (dim.chunkIsLoaded(this.lastPosition)) {
                this.autoJudgeTimer?.stop();
                this.onKilled({
                    "damageSource": {
                        "cause": EntityDamageCause.suffocation
                    },
                    "deadEntity": this.entity,
                });
            }
        }).delay(20 * 2).start();
    }
    override onMemoryLoad(): void {
        super.onMemoryLoad();
        if (this.autoJudgeTimer) {
            this.autoJudgeTimer.stop();
            this.autoJudgeTimer = undefined;
        }
    }
}
