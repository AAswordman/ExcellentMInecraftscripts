
import { Entity, EntityHurtAfterEvent, world } from '@minecraft/server';
import PomBossController from './PomBossController.js';
import PomServer from '../PomServer.js';
import ExMusic from '../../../modules/exmc/server/env/ExMusic.js';

export default class PomHeadlessGuardBoss extends PomBossController {
    static typeId = "wb:headless_guard"
    music!: ExMusic;
    constructor(e: Entity, server: PomServer, spawn: boolean) {
        super(e, server,spawn);
        
    }
    override initBossEntity(): void {
        super.initBossEntity();
        this.music = this.server.getMusic("music.wb.unknown_world");
        this.music.trackPlayers(Array.from(this.barrier.getPlayers()));
        if(this.isFisrtCall) {
            this.server.say({ rawtext: [{ translate: "text.wb:summon_headless_guard.name" }] });
            this.music.loop();
        }
    }
    override onAppear(spawn:boolean): void {
        super.onAppear(spawn);
    }
    override onKilled(e: EntityHurtAfterEvent): void {
        //设置奖励
        super.onWin();
        this.server.say({ rawtext: [{ translate: "text.wb:defeat_headless_guard.name" }] });
        this.music.stop();
        super.onKilled(e);
    }
    override onFail(): void {
        this.music.stop();
        super.onFail();
    }

}