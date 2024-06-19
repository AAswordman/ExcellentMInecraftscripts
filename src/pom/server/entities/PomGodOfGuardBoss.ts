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
import Random from '../../../modules/exmc/utils/Random.js';

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



//单中心攻击
export class PomGodOfGuardBossState1 extends PomGodOfGuardBossState {
    tickNum = 0;
    center1!: PomGodOfGuardShootCenter;
    override onEnter() {
        this.center1 = this.centers.addCenter(this.ctrl.entity.location);
    }
    override onTick(e: TickEvent) {
        if (this.tickNum++ > 100) {
            return true;
        }
        let x = Math.PI * this.tickNum / 10;
        let y = Math.PI * this.tickNum / 100 + Math.random() * Math.PI * 2;
        this.center1.add(8, {
            x: Math.cos(x),
            z: Math.sin(x),
            y: 0
        }, 6 * 1000);
        this.center1.add(8, {
            x: Math.cos(y),
            z: Math.sin(y),
            y: 0
        }, 6 * 1000);
        this.center1.add(4, {
            x: Math.cos(x),
            z: Math.sin(x),
            y: 0
        }, 10 * 1000);
        return false;
    }
    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
        }).delay(10 * 1000).startOnce();
    }
}
export class PomGodOfGuardBossState2 extends PomGodOfGuardBossState {
    tickNum = 0;
    center1!: PomGodOfGuardShootCenter;
    override onEnter() {
        this.center1 = this.centers.addCenter(this.ctrl.entity.location);
    }
    override onTick(e: TickEvent) {
        if (this.tickNum++ > 20) {
            return true;
        }
        if (this.tickNum === 10) {
            // let x = Math.PI * this.tickNum / 10;
            for (let i = 0; i < 360; i += 10) {
                for (let j = 2.5; j < 360; j += 10) {
                    this.center1.add(7, {
                        x: Math.cos(i * Math.PI / 180) * Math.sin(j * Math.PI / 180),
                        z: Math.sin(i * Math.PI / 180) * Math.sin(j * Math.PI / 180),
                        y: Math.cos(j * Math.PI / 180)
                    }, 4 * 1000);
                }
            }
        }
        return false;
    }
    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
        }).delay(4 * 1000).startOnce();
    }
}
export class PomGodOfGuardBossState3 extends PomGodOfGuardBossState {
    tickNum = 0;
    center1!: PomGodOfGuardShootCenter;
    override onEnter() {
        this.center1 = this.centers.addCenter(this.ctrl.entity.location);
    }
    override onTick(e: TickEvent) {
        if (this.tickNum++ > 40) {
            return true;
        }
        let x = Math.PI * this.tickNum / 10;
        let y = Math.PI * this.tickNum / 100 + Math.random() * Math.PI * 2;
        this.center1.add(8, {
            x: Math.cos(x),
            z: Math.sin(x),
            y: Math.sin(5 * x)
        }, 6 * 1000);
        this.center1.add(8, {
            x: Math.cos(y),
            z: Math.sin(y),
            y: 0
        }, 6 * 1000);
        this.center1.add(8, {
            x: Math.sin(y),
            z: Math.cos(y),
            y: 0
        }, 6 * 1000);
        return false;
    }
    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
        }).delay(6 * 1000).startOnce();
    }
}
export class PomGodOfGuardBossState4 extends PomGodOfGuardBossState {
    tickNum = 0;
    center1!: PomGodOfGuardShootCenter;
    override onEnter() {
        this.center1 = this.centers.addCenter(this.ctrl.entity.location);
    }
    override onTick(e: TickEvent) {
        if (this.tickNum++ > 20) {
            return true;
        }
        if (this.tickNum === 10 || this.tickNum === 0) {
            let p = new Vector3(Random.choice(Array.from(this.ctrl.barrier.getPlayers())).location).sub(this.ctrl.entity.location);
            let tmpV = new Vector3();
            for (let i = -10; i <= 10; i += 6) {
                for (let j = -10; j <= 10; j += 6) {
                    for (let k = -10; k <= 10; k += 6) {
                        this.center1.add(10, tmpV.set(p).add(i, j, k), 5 * 1000);
                    }
                }
            }
        }

        return false;
    }
    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
        }).delay(5 * 1000).startOnce();
    }
}
export class PomGodOfGuardBossState5 extends PomGodOfGuardBossState {
    tickNum = 0;
    center1!: PomGodOfGuardShootCenter;
    override onEnter() {
        this.center1 = this.centers.addCenter(this.ctrl.entity.location);
    }
    override onTick(e: TickEvent) {
        if (this.tickNum++ > 60) {
            return true;
        }
        let x = (Math.PI * 1 / 15) * (2 * e.currentTick);
        this.center1.add(2, {
            "x": Math.cos(x),
            "z": Math.sin(x),
            "y": 0
        }, 10000);
        this.center1.add(5, {
            "x": Math.cos(x),
            "z": Math.sin(x),
            "y": Math.sin(x / 4 + Math.PI / 4)
        }, 8000);
        this.center1.add(15, {
            "x": Math.cos(x),
            "z": Math.sin(x),
            "y": Math.sin(x / 4 + Math.PI * 2 / 4)
        }, 8000);
        this.center1.add(8, {
            "x": Math.cos(x),
            "z": Math.sin(x),
            "y": Math.sin(x / 4 + Math.PI * 3 / 4)
        }, 8000);
        this.center1.add(20, {
            "x": Math.cos(x),
            "z": Math.sin(x),
            "y": Math.cos(x / 2)
        }, 8000);
        x = (Math.PI * 1 / 15) * (2 * e.currentTick + 1);
        this.center1.add(2, {
            "x": Math.cos(x),
            "z": Math.sin(x),
            "y": 0
        }, 10000);
        this.center1.add(5, {
            "x": Math.cos(x),
            "z": Math.sin(x),
            "y": Math.sin(x / 4 + Math.PI / 4)
        }, 8000);
        this.center1.add(15, {
            "x": Math.cos(x),
            "z": Math.sin(x),
            "y": Math.sin(x / 4 + Math.PI * 2 / 4)
        }, 8000);
        this.center1.add(8, {
            "x": Math.cos(x),
            "z": Math.sin(x),
            "y": Math.sin(x / 4 + Math.PI * 3 / 4)
        }, 8000);
        this.center1.add(20, {
            "x": Math.cos(x),
            "z": Math.sin(x),
            "y": Math.cos(x / 2)
        }, 8000);

        return false;
    }
    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
        }).delay(10 * 1000).startOnce();
    }
}
export class PomGodOfGuardBossState6 extends PomGodOfGuardBossState {
    tickNum = 0;
    center1!: PomGodOfGuardShootCenter;
    override onEnter() {
        this.center1 = this.centers.addCenter(this.ctrl.entity.location);
    }
    override onTick(e: TickEvent) {
        if (this.tickNum++ > 30) return true;
        for (let i = 0; i < 4; i++) {
            const angle = i * Math.PI / 2 + 0.4 * this.tickNum * this.tickNum * Math.PI / 180;
            this.center1.add(20, {
                x: Math.cos(angle),
                z: Math.sin(angle),
                y: 0
            }, (3) * 1000);
        }
        return false;
    }
    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
        }).delay(3 * 1000).startOnce();
    }
}
export class PomGodOfGuardBossState7 extends PomGodOfGuardBossState {
    tickNum = 0;
    center1!: PomGodOfGuardShootCenter;
    override onEnter() {
        this.center1 = this.centers.addCenter(this.ctrl.entity.location);
    }
    override onTick(e: TickEvent) {
        if (this.tickNum++ > 30) return true;
        for (let i = 0; i < 4; i++) {
            const angle = i * Math.PI / 2 + 0.4 * this.tickNum * this.tickNum * Math.PI / 180;
            this.center1.add(20, {
                x: Math.cos(angle),
                z: Math.sin(angle),
                y: 0
            }, (3) * 1000);
        }
        return false;
    }
    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
        }).delay(3 * 1000).startOnce();
    }
}
export class PomGodOfGuardBossState8 extends PomGodOfGuardBossState {
    tickNum = 0;
    center1!: PomGodOfGuardShootCenter;

    override onEnter() {
        this.center1 = this.centers.addCenter(this.ctrl.entity.location);
    }

    override onTick(e: TickEvent) {
        if (this.tickNum++ > 60) return true;

        const timeFactor = e.currentTick;
        for (let i = 0; i < 24; i++) {
            const angle = i * Math.PI * 2 / 24 + timeFactor;
            const radius = 10 + Math.sin(timeFactor * 0.3 + i / 3) * 5;
            this.center1.add(10, {
                x: radius * Math.cos(angle),
                z: radius * Math.sin(angle),
                y: Math.abs(Math.sin(timeFactor * 0.1 + i / 18) * 2)
            }, (i % 2 === 0 ? 3 : 6) * 1000);
        }

        return false;
    }

    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
        }).delay(6 * 1000).startOnce();
    }
}
export class PomGodOfGuardBossState9 extends PomGodOfGuardBossState {
    tickNum = 0;
    center1!: PomGodOfGuardShootCenter;

    override onEnter() {
        this.center1 = this.centers.addCenter(this.ctrl.entity.location);
    }

    override onTick(e: TickEvent) {
        if (this.tickNum++ > 60) return true;

        for (let i = 0; i < 6; i++) {
            const angle = i * Math.PI / 3 + this.tickNum * Math.PI / 180;
            const hexOffset = Math.sin(this.tickNum / 30) * 2;
            const direction = {
                x: Math.cos(angle) * (1 + hexOffset),
                z: Math.sin(angle) * (1 + hexOffset),
                y: Math.sin(this.tickNum / 40)
            };
            this.center1.add(8, direction, 4000);
        }

        return false;
    }

    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
        }).delay(10 * 1000).startOnce();
    }
}

export class PomGodOfGuardBossState10 extends PomGodOfGuardBossState {
    tickNum = 0;
    center1!: PomGodOfGuardShootCenter;

    override onEnter() {
        this.center1 = this.centers.addCenter(this.ctrl.entity.location);
    }

    override onTick(e: TickEvent) {
        if (this.tickNum++ > 10) return true;

        const randomDir = () => new Vector3({ x: Math.random() * 2 - 1, z: Math.random() * 2 - 1, y: 0 }).normalize();
        const directions = [randomDir(), randomDir()];
        directions[1].y = Math.random() * 5;
        let p = new Vector3(Random.choice(Array.from(this.ctrl.barrier.getPlayers())).location).sub(this.ctrl.entity.location);
        this.center1.add(30,p,3*1000,"4");
        directions.forEach((dir, index) => {
            this.center1.add(5 + index, dir, 10000 + index * 1000, "3");
        });

        return false;
    }

    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
        }).delay(15 * 1000).startOnce();
    }
}


//多中心攻击






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
            let arr = [
                PomGodOfGuardBossState1,
                PomGodOfGuardBossState2,
                PomGodOfGuardBossState3,
                PomGodOfGuardBossState4,
                PomGodOfGuardBossState5,
                PomGodOfGuardBossState6,
                PomGodOfGuardBossState7,
                PomGodOfGuardBossState8,
                PomGodOfGuardBossState9,
                PomGodOfGuardBossState10
            ];
            this.states.set(Random.choice(arr));
        });
        this.timer.delay(0.2 * 20);
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
    add(speed: number, dic: IVector3, lifeTime = 1000, parStyle = ""): void {
        this.tmpV.set(dic).normalize();
        let point = new KDPoint(this.tmpV.x, this.tmpV.y, this.tmpV.z);
        this.trajectory.insert(point);
        let map = new MolangVariableMap();
        // map.setColorRGBA("color",{
        //     "alpha":1,
        //     "blue":0,
        //     "green":0,
        //     "red":1
        // })
        map.setSpeedAndDirection("def", speed, this.tmpV);
        map.setFloat("lifetime", lifeTime / 1000);
        this.pointJudge.set(point, { speed: speed, direction: this.tmpV.cpy(), spawnTime: new Date().getTime(), lifeTime: lifeTime });
        this.dimension.spawnParticle("wb:ruin_desert_boss_shoot" + parStyle + "_par", this.center, map);
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
        if (this.tickNum % (15 * 20) === 0) {
            this.centers.forEach(c => {
                c.optmize();
            });
            this.tickNum = 0;
        }
    }
}