import { Entity, EntityDamageCause, EntityHurtAfterEvent, world } from '@minecraft/server';
import ExGameServer from '../../../modules/exmc/server/ExGameServer.js';
import ExEntityController from '../../../modules/exmc/server/entity/ExEntityController.js';
import ExGameConfig from '../../../modules/exmc/server/ExGameConfig.js';
import PomBossController from './PomBossController.js';
import PomServer from '../PomServer.js';
import PomClient from '../PomClient.js';
import ExSound from '../../../modules/exmc/server/env/ExSound.js';
import VarOnChangeListener from '../../../modules/exmc/utils/VarOnChangeListener.js';
import { TickEvent } from '../../../modules/exmc/server/events/events.js';
import Vector3 from '../../../modules/exmc/math/Vector3.js';

export default class PomAncientStoneBoss extends PomBossController {
    static typeId = "wb:ancient_stone"
    music: ExSound;
    private viewTime = 0;
    cannonView = new VarOnChangeListener((n, l) => {
        if (n) {
            const f = (e: TickEvent) => {
                this.viewTime += e.deltaTime;
                if (this.viewTime >= 0.4) {
                    const view = new Vector3();
                    const pos = new Vector3();
                    for(let e of this.barrier.getPlayers()){
                        view.set(e.getViewDirection());
                        view.y = 0;
                        view.normalize();
                        pos.set(e.getViewDirection());
                        pos.y = 0;
                        pos.normalize();
                        e.runCommand(`camera @s set minecraft:free ease ${this.viewTime} linear pos ${view
                            .scl(-8).add(0, 5, 0).add(e.location).toArray().join(" ")} facing ${pos
                                .scl(8).add(0, 1, 0).add(e.location).toArray().join(" ")}`);
                    }
                    this.viewTime = 0;
                }
            };
            this.getEvents().exEvents.tick.subscribe(f);
            this.setTimeout(() => {
                this.getEvents().exEvents.tick.unsubscribe(f);
            }, 5000);
            for(let e of this.barrier.getPlayers()){
                const c = this.server.findClientByPlayer(e);
                c?.setTimeout(() => {
                    c.exPlayer.command.run(`camera @s clear`);
                }, 5200);
            }
        } else {

        }
    }, false);
    constructor(e: Entity, server: PomServer) {
        super(e, server);
        this.music = server.getSound("music.wb.anger_of_ancient", "2:24");
    }
    override initBossEntity(): void {
        for (let c of this.barrier.clientsByPlayer()) {
            c.ruinsSystem.causeDamageShow = true;
            c.ruinsSystem.causeDamageType.add(this.entity.typeId);
        }
        if (!this.exEntity.hasComponent("minecraft:is_baby") && this.isFisrtCall) {
            this.server.say({ rawtext: [{ translate: "text.wb:summon_ancient_stone.name" }] });
            this.setTimeout(() => {
                this.music.loop(this.exEntity.exDimension, this.entity.location);
            }, 500);

        }
        this.getEvents().exEvents.onLongTick.subscribe(e => {
            this.cannonView.upDate(this.exEntity.hasTag("cannon"));
        });
    }
    override onSpawn(): void {
        super.onSpawn();
    }
    override onKilled(e: EntityHurtAfterEvent): void {
        //设置奖励
        if (this.exEntity.hasComponent("minecraft:is_baby")) {
            for (let c of this.barrier.clientsByPlayer()) {
                c.progressTaskFinish(this.entity.typeId, c.ruinsSystem.causeDamage);
                c.ruinsSystem.causeDamageShow = false;
            }
            this.server.say({ rawtext: [{ translate: "text.wb:defeat_ancient_stone.name" }] });
            this.exEntity.command.run(`camera @a[r=128] clear`);
            console.warn("onWin");
            this.stopBarrier();
            this.music.stop();
        }
        if (e.damageSource.cause === EntityDamageCause.suicide) {
            this.music.stop();
        }
        super.onKilled(e);
    }
    override onFail(): void {
        this.music.stop();
        let pos = this.entity.location;
        this.exEntity.command.run(`camera @a[r=128] clear`);
        super.onFail();
    }

}