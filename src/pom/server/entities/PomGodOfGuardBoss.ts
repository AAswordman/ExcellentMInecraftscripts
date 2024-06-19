import { Dimension, Entity, EntityHurtAfterEvent, MolangVariableMap, Direction, EntityDamageCause } from '@minecraft/server';
import { registerEvent } from '../../../modules/exmc/server/events/eventDecoratorFactory.js';
import { TickEvent } from '../../../modules/exmc/server/events/events.js';
import ExErrorQueue from '../../../modules/exmc/server/ExErrorQueue.js';
import Vector3, { IVector3 } from '../../../modules/exmc/utils/math/Vector3.js';
import KDTree, { KDPoint } from '../../../modules/exmc/utils/tree/KDTree.js';
import VarOnChangeListener from '../../../modules/exmc/utils/VarOnChangeListener.js';
import PomServer from '../PomServer.js';
import PomBossController from './PomBossController.js';
import UUID from '../../../modules/exmc/utils/UUID.js';
import ExSystem from '../../../modules/exmc/utils/ExSystem.js';
import TickDelayTask from '../../../modules/exmc/utils/TickDelayTask.js';

export class PomGodOfGuardBossState {
    constructor(public centers: PomGodOfGuardShootCenters, public ctrl: PomBossController) {

    }
    onEnter() {

    }
    onTick(e: TickEvent) {
        return false;
    }
    onExit() {

    }
}
export class PomGodOfGuardBossState1 extends PomGodOfGuardBossState {
    tickNum = 0;
    center1!: PomGodOfGuardShootCenter;
    override onEnter() {
        this.center1 = this.centers.addCenter(this.ctrl.entity.location);
    }
    override onTick(e: TickEvent) {
        if(this.tickNum++ > 100){
            return true;
        }
        let x = Math.PI*this.tickNum/10;
        let y = Math.PI*this.tickNum/100 + Math.random()*Math.PI*2;
        this.center1.add(8,{
            x:Math.cos(x),
            z:Math.sin(x),
            y:0
        },6*1000);
        this.center1.add(8,{
            x:Math.cos(y),
            z:Math.sin(y),
            y:0
        },6*1000);
        this.center1.add(4,{
            x:Math.cos(x),
            z:Math.sin(x),
            y:0
        },10*1000);
        return false;
    }
    override onExit() {
        this.centers.remove(this.center1);
    }
}

export class PomGodOfGuardBossStates {
    state?: PomGodOfGuardBossState;
    centers: PomGodOfGuardShootCenters;
    constructor(public ctrl: PomBossController) {
        this.centers = new PomGodOfGuardShootCenters(ctrl.entity.dimension);
    }
    onTick(e: TickEvent) {
        this.centers.tick(e.deltaTime, Array.from(this.ctrl.barrier.getPlayers()), this.ctrl.entity);
        if (this.state) {
            if (this.state.onTick(e)) {
                this.state.onExit();
                this.state = undefined;
            }
        }
    }
    set(istate: typeof PomGodOfGuardBossState) {
        if (this.state) {
            return;
        }
        this.state = (new (istate)(this.centers, this.ctrl));
        this.state.onEnter();
    }
    
}

export class PomGodOfGuardBoss1 extends PomBossController {
    static typeId = "wb:god_of_guard_first";
    states: PomGodOfGuardBossStates;
    timer: TickDelayTask;
    constructor(e: Entity, server: PomServer) {
        super(e, server);
        this.states = new PomGodOfGuardBossStates(this);
        this.timer = ExSystem.tickTask(() => {
            this.states.set(PomGodOfGuardBossState1);
        });
        this.timer.delay(5*20);
        this.timer.start();
    }
    override initBossEntity(): void {
        super.initBossEntity();
        if (this.isFisrtCall) this.server.say({ rawtext: [{ translate: "text.wb:summon_intentions.name" }] });
    }
    override onSpawn(): void {
        super.onSpawn();
    }
    override onKilled(e: EntityHurtAfterEvent): void {
        super.onKilled(e);
    }
    override onFail(): void {
        super.onFail();
    }

    @registerEvent("onLongTick")
    onLongTick(e: TickEvent) {

    }


    @registerEvent("tick")
    onTick(e: TickEvent) {
        this.states.onTick(e);

    }

}

export class PomGodOfGuardBoss2 extends PomBossController {
    static typeId = "wb:god_of_guard_second";
    constructor(e: Entity, server: PomServer) {
        super(e, server);
    }
    override initBossEntity(): void {
        super.initBossEntity();
        this.barrier.changeFog("wb:ruin_mind_2_boss");
    }
    override onSpawn(): void {
        super.onSpawn();
    }
    override onKilled(e: EntityHurtAfterEvent): void {
        super.onKilled(e);
    }
    override onFail(): void {
        super.onFail();
    }

    @registerEvent("onLongTick")
    onLongTick(e: TickEvent) {
        try {
            if (this.exEntity.hasComponent("minecraft:is_baby")) {
                this.barrier.particle("wb:ruin_mind_boss_floor_par");
                this.barrier.changeFog("wb:ruin_mind_3_boss");
            } else {
                this.barrier.changeFog("wb:ruin_mind_2_boss");
            }
        } catch (e) {
            ExErrorQueue.throwError(e);
        }
    }

}

export class PomGodOfGuardBoss3 extends PomBossController {
    static typeId = "wb:god_of_guard_third";
    constructor(e: Entity, server: PomServer) {
        super(e, server);
    }
    override initBossEntity(): void {
        super.initBossEntity();
        this.state = new VarOnChangeListener((n) => {
            switch (n) {
                case 9:
                    this.exEntity.exDimension.spawnParticle("wb:ruin_mind_boss_third_par", this.exEntity.position);
                    break;
                case 1:
                case 2:
                case 3:
                    this.exEntity.exDimension.spawnParticle("wb:ruin_mind_boss_second_par", this.exEntity.position);
                    break;
            }
        }, 1);
        this.changeFog = new VarOnChangeListener((n) => {
            if (n === "wb:ruin_mind_5_boss") {
                this.barrier.changeFog("wb:ruin_mind_4_boss");
                this.setTimeout(() => {
                    this.barrier.changeFog("wb:ruin_mind_5_boss");
                }, 5000);
            } else {
                this.barrier.changeFog(n);
            }
        }, "");

        this.changeFog.upDate("wb:ruin_mind_5_boss");
    }
    changeFog!: VarOnChangeListener<string>;
    state!: VarOnChangeListener<number>;
    @registerEvent("onLongTick")
    onLongTick(e: TickEvent) {
        try {
            if (this.exEntity.hasComponent("minecraft:is_baby")) {
                this.barrier.particle("wb:ruin_mind_boss_floor_par");
                this.changeFog.upDate("wb:ruin_mind_3_boss");

            } else {
                this.changeFog.upDate("wb:ruin_mind_5_boss");
            }
            this.state.upDate(this.exEntity.getVariant())
        } catch (e) {
            ExErrorQueue.throwError(e);
        }
    }
    override onSpawn(): void {
        super.onSpawn();
    }
    override onKilled(e: EntityHurtAfterEvent): void {
        //设置奖励
        for (let c of this.barrier.clientsByPlayer()) {
            c.progressTaskFinish(this.entity.typeId, c.ruinsSystem.causeDamage);
            c.ruinsSystem.causeDamageShow = false;
        }
        this.server.say({ rawtext: [{ translate: "text.wb:defeat_intentions.name" }] });

        console.warn("onWin");
        this.stopBarrier();
        super.onKilled(e);
    }
    override onFail(): void {
        super.onFail();
    }

}



export class PomGodOfGuardShootCenter {
    trajectory: KDTree;
    center: Vector3;
    pointJudge = new WeakMap<KDPoint, { spawnTime: number, direction: Vector3, speed: number, lifeTime: number }>();
    private tmpV = new Vector3();
    private tmpA = new Vector3();
    private tmpB = new Vector3();
    constructor(public dimension: Dimension, center: IVector3) {
        this.center = new Vector3(center);
        this.trajectory = new KDTree(3);
    }
    optmize(): void {
        let now = new Date().getTime();
        let points = this.trajectory.getPoints();
        this.trajectory.root = undefined;
        let npoints = [];
        for (let p of points) {
            if (!this.pointJudge.has(p)) continue;
            let { spawnTime, lifeTime } = this.pointJudge.get(p)!;
            if (now - spawnTime > lifeTime) {
                this.pointJudge.delete(p);
            } else {
                npoints.push(p);
            }
        }

        this.trajectory.build(npoints);
    }
    add(speed: number, dic: IVector3, lifeTime = 1000): void {
        this.tmpV.set(dic).normalize();
        let point = new KDPoint(this.tmpV.x, this.tmpV.y, this.tmpV.z);
        this.trajectory.insert(point);
        let map = new MolangVariableMap();
        map.setSpeedAndDirection("def", speed, this.tmpV);
        map.setFloat("lifetime", lifeTime / 1000);
        this.pointJudge.set(point, { speed: speed, direction: this.tmpV.cpy(), spawnTime: new Date().getTime(), lifeTime: lifeTime });
        this.dimension.spawnParticle("wb:ruin_desert_boss_shoot_par", this.center, map);
    }
    judgeHurt(pos: IVector3, pastTime: number) {
        let boxR = 0.7;
        let boxR2 = boxR / this.tmpV.set(pos).sub(this.center).len() * 1.42;
        let dic = this.trajectory.rangeSearch(new KDPoint(...this.tmpV.set(pos).sub(this.center).normalize().toArray()), boxR2);
        for (let i of dic) {
            if (this.pointJudge.has(i)) {
                let { spawnTime, speed, direction, lifeTime } = this.pointJudge.get(i)!;
                let newTime = new Date().getTime();
                if (newTime - spawnTime <= lifeTime) {
                    let beforePos = this.tmpA.set(this.center).add(this.tmpV.set(direction).scl(speed * (newTime - pastTime - spawnTime) / 1000));
                    let afterPos = this.tmpB.set(this.center).add(this.tmpV.set(direction).scl(speed * (newTime - spawnTime) / 1000));
                    let dis1 = beforePos.distance(pos), dis2 = afterPos.distance(pos);

                    if (dis1 < boxR || dis2 < boxR) {
                        return true;
                    }
                    let midLen = this.tmpV.set(afterPos).sub(beforePos).scl(0.5).add(beforePos).distance(pos);
                    let d = this.tmpV.set(afterPos).sub(beforePos);
                    if (midLen < dis1 && midLen < dis2 && d.crs(beforePos.sub(pos)).len() / d.len() <= boxR) {
                        return true;
                    }
                } else {
                    this.trajectory.delete(i);
                    this.pointJudge.delete(i);
                }

            } else {
                this.trajectory.delete(i);
            }
        }
        return false;
    }
}


export class PomGodOfGuardShootCenters {
    centers = new Set<PomGodOfGuardShootCenter>();
    constructor(public dimension: Dimension) {

    }
    addCenter(pos: IVector3) {
        let center = new PomGodOfGuardShootCenter(this.dimension, pos);
        let id = UUID.randomUUID();
        this.centers.add(center);
        return center;
    }
    remove(center: PomGodOfGuardShootCenter) {
        return this.centers.delete(center);
    }
    tickNum = 0;
    tmpV = new Vector3();
    tick(tickDelay: number, targets: Entity[], from: Entity) {
        for (let c of this.centers) {
            for (let p of targets) {
                if (c.judgeHurt(this.tmpV.set(p.location).add(0, 0.5, 0), tickDelay)) {
                    // console.warn("打到了");
                    p.applyDamage(5, {
                        "cause": EntityDamageCause.entityAttack,
                        "damagingEntity": from
                    })
                    p.applyKnockback(0, 0, 0.5, 0.2)
                }
            }
        }

        this.tickNum++;
        if (this.tickNum % (10 * 20) === 0) {
            this.centers.forEach(c => {
                c.optmize();
            });
            this.tickNum = 0;
        }
    }
}