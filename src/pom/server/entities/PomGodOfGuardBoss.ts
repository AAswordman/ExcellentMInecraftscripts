import { Dimension, Entity, EntityHurtAfterEvent, MolangVariableMap, Direction, EntityDamageCause, Player, GameMode } from '@minecraft/server';
import { registerEvent } from '../../../modules/exmc/server/events/eventDecoratorFactory.js';
import { ExEventNames, ExOtherEventNames, TickEvent } from '../../../modules/exmc/server/events/events.js';
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
import MathUtil from '../../../modules/exmc/utils/math/MathUtil.js';
import DisposeAble from '../../../modules/exmc/interface/DisposeAble.js';
import Queue from '../../../modules/exmc/utils/queue/Queue.js';
import { falseIfError, undefIfError } from '../../../modules/exmc/utils/tool.js';
import ExEntityController from '../../../modules/exmc/server/entity/ExEntityController.js';
import ExEntityQuery from '../../../modules/exmc/server/env/ExEntityQuery.js';
import Vector2 from '../../../modules/exmc/utils/math/Vector2.js';
import Matrix4 from '../../../modules/exmc/utils/math/Matrix4.js';
import ExTimeLine from '../../../modules/exmc/utils/ExTimeLine.js';

export class PomGodOfGuardBossState {
    constructor(public centers: PomGodOfGuardShootCenters, public ctrl: PomBossController, public defDamage: number, arg?: any) {

    }
    onEnter() {

    }
    onTick(e: TickEvent) {
        return false;
    }
    onExit() {

    }
    listenner?: () => void;
}



export class PomGodOfGuardBossStateWarn extends PomGodOfGuardBossState {
    tickNum = 0;
    center1!: PomGodOfGuardShootCenter;
    pos: any;
    constructor(centers: PomGodOfGuardShootCenters, ctrl: PomBossController, defDamage: number, public target: Player) {
        super(centers, ctrl, defDamage);
    }
    override onEnter() {
        this.pos = this.ctrl.entity.location;
        this.center1 = this.centers.addCenter(this.pos);
    }
    tmpV = new Vector3()
    override onTick(e: TickEvent) {
        if (this.tickNum++ > 100) {
            return true;
        }
        if (this.tickNum % 10 === 0) {
            let p = new Vector3(this.target.location).sub(this.pos);
            for (let i = -4; i <= 4; i += 2) {
                for (let j = -4; j <= 4; j += 2) {
                    for (let k = -4; k <= 4; k += 2) {
                        this.center1.add(40, this.tmpV.set(p).add(i, j, k), 2 * 1000, this.defDamage, "5", EntityDamageCause.void);
                    }
                }
            }
        }
        return false;
    }
    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
        }).delay(2 * 20).startOnce();
    }
}
//单中心攻击

//星图
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
        }, 6 * 1000, this.defDamage);
        this.center1.add(8, {
            x: Math.cos(y),
            z: Math.sin(y),
            y: 0
        }, 6 * 1000, this.defDamage);
        this.center1.add(4, {
            x: Math.cos(x),
            z: Math.sin(x),
            y: 0
        }, 10 * 1000, this.defDamage);
        return false;
    }
    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
        }).delay(10 * 20).startOnce();
    }
}

//球
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
                    }, 4 * 1000, this.defDamage);
                }
            }
        }
        return false;
    }
    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
        }).delay(4 * 20).startOnce();
    }
}

//飘散
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
        }, 6 * 1000, this.defDamage);
        this.center1.add(8, {
            x: Math.cos(y),
            z: Math.sin(y),
            y: 0
        }, 6 * 1000, this.defDamage);
        this.center1.add(8, {
            x: Math.sin(y),
            z: Math.cos(y),
            y: 0
        }, 6 * 1000, this.defDamage);
        return false;
    }
    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
        }).delay(6 * 20).startOnce();
    }
}

//方块狙击
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
        if (this.tickNum % 6 === 0) {
            let p = new Vector3(Random.choice(Array.from(this.ctrl.barrier.getPlayers())).location).sub(this.ctrl.entity.location);
            let tmpV = new Vector3();
            for (let i = -12; i <= 12; i += 4) {
                for (let j = -12; j <= 12; j += 4) {
                    for (let k = -12; k <= 12; k += 4) {
                        this.center1.add(10, tmpV.set(p).add(i, j, k), 5 * 1000, this.defDamage);
                    }
                }
            }
        }

        return false;
    }
    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
        }).delay(5 * 20).startOnce();
    }
}

//飘带
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
        }, 10000, this.defDamage);
        this.center1.add(5, {
            "x": Math.cos(x),
            "z": Math.sin(x),
            "y": Math.sin(x / 4 + Math.PI / 4)
        }, 8000, this.defDamage);
        this.center1.add(15, {
            "x": Math.cos(x),
            "z": Math.sin(x),
            "y": Math.sin(x / 4 + Math.PI * 2 / 4)
        }, 8000, this.defDamage);
        this.center1.add(8, {
            "x": Math.cos(x),
            "z": Math.sin(x),
            "y": Math.sin(x / 4 + Math.PI * 3 / 4)
        }, 8000, this.defDamage);
        this.center1.add(20, {
            "x": Math.cos(x),
            "z": Math.sin(x),
            "y": Math.cos(x / 2)
        }, 8000, this.defDamage);
        x = (Math.PI * 1 / 15) * (2 * e.currentTick + 1);
        this.center1.add(2, {
            "x": Math.cos(x),
            "z": Math.sin(x),
            "y": 0
        }, 10000, this.defDamage);
        this.center1.add(5, {
            "x": Math.cos(x),
            "z": Math.sin(x),
            "y": Math.sin(x / 4 + Math.PI / 4)
        }, 8000, this.defDamage);
        this.center1.add(15, {
            "x": Math.cos(x),
            "z": Math.sin(x),
            "y": Math.sin(x / 4 + Math.PI * 2 / 4)
        }, 8000, this.defDamage);
        this.center1.add(8, {
            "x": Math.cos(x),
            "z": Math.sin(x),
            "y": Math.sin(x / 4 + Math.PI * 3 / 4)
        }, 8000, this.defDamage);
        this.center1.add(20, {
            "x": Math.cos(x),
            "z": Math.sin(x),
            "y": Math.cos(x / 2)
        }, 8000, this.defDamage);

        return false;
    }
    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
        }).delay(10 * 20).startOnce();
    }
}

//加速旋风
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
            }, (3) * 1000, this.defDamage);
        }
        return false;
    }
    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
        }).delay(3 * 20).startOnce();
    }
}

//快速甩击
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
            }, (3) * 1000, this.defDamage);
        }
        return false;
    }
    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
        }).delay(3 * 20).startOnce();
    }
}


//浪潮
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
            }, (i % 2 === 0 ? 3 : 6) * 1000, this.defDamage);
        }

        return false;
    }

    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
        }).delay(6 * 20).startOnce();
    }
}

//六爪
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
                y: 0.4 * Math.abs(Math.sin(this.tickNum / 8))
            };
            this.center1.add(8, direction, 4000, this.defDamage);
        }

        return false;
    }

    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
        }).delay(10 * 20).startOnce();
    }
}


//瞬狙
export class PomGodOfGuardBossState10 extends PomGodOfGuardBossState {
    tickNum = 0;
    center1!: PomGodOfGuardShootCenter;

    override onEnter() {
        this.center1 = this.centers.addCenter(this.ctrl.entity.location);
    }
    tmpV = new Vector3();
    tmpF = new Vector3();

    override onTick(e: TickEvent) {
        if (this.tickNum++ > 10) return true;
        let c = this.ctrl.entity.location;
        const randomDir = () => new Vector3({ x: Math.random() * 2 - 1, z: Math.random() * 2 - 1, y: 0 }).normalize();
        const directions = [randomDir(), randomDir()];
        directions[1].y = Math.random() * 5;
        let p = new Vector3(Random.choice(Array.from(this.ctrl.barrier.getPlayers())).location);
        if (this.tickNum === 1) {
            this.tmpV.set(c).sub(p).normalize().scl(2);
            this.tmpF.set(p).add(this.tmpV).add(0, 1, 0);

            this.ctrl.entity.dimension.spawnParticle("wb:ruin_desert_boss_target_par", this.tmpF);
        }
        p.sub(c);
        this.center1.add(20, p, 3 * 1000, this.defDamage, "4");
        directions.forEach((dir, index) => {
            this.center1.add(5 + index, dir, 10000 + index * 1000, this.defDamage, "3");
        });

        return false;
    }

    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
        }).delay(15 * 20).startOnce();
    }
}


//双中心攻击

//干涉
export class PomGodOfGuardBossState11 extends PomGodOfGuardBossState {
    tickNum = 0;
    center1!: PomGodOfGuardShootCenter;
    center2!: PomGodOfGuardShootCenter;
    entity2!: Entity;
    pos!: Vector3;
    pos2!: Vector3;

    override onEnter() {
        this.pos = new Vector3(this.ctrl.entity.location);
        this.center1 = this.centers.addCenter(this.pos);

        let c = this.ctrl.barrier.center.cpy();
        this.pos2 = this.tmpV.set(this.pos).sub(c).scl(-1).add(c).cpy();
        this.pos2.y = this.pos.y;
        this.center2 = this.centers.addCenter(this.pos2);

        this.entity2 = this.ctrl.entity.dimension.spawnEntity("wb:god_of_guard_settle", this.pos);
    }
    tmpV = new Vector3();
    override onTick(e: TickEvent) {
        if (this.tickNum++ > 80) return true;
        if (this.tickNum > 20) {
            for (let i = 0; i < 4; i++) {
                const angle = i * Math.PI / 2 + this.tickNum * Math.PI / 18;
                this.center1.add(10, {
                    x: Math.cos(angle),
                    z: Math.sin(angle),
                    y: 0
                }, (5) * 1000, this.defDamage);
                this.center2.add(10, {
                    x: Math.cos(angle),
                    z: Math.sin(angle),
                    y: 0
                }, (5) * 1000, this.defDamage);
            }
        } else {
            this.entity2.teleport(this.tmpV.set(this.pos2).sub(this.pos).scl(this.tickNum / 20).add(this.pos), {
                "keepVelocity": true
            })
        }
        return false;
    }

    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
            this.centers.remove(this.center2);
            this.entity2.remove();
        }).delay(5 * 20).startOnce();
    }
}

//双星狙击
export class PomGodOfGuardBossState12 extends PomGodOfGuardBossState {
    tickNum = 0;
    center1!: PomGodOfGuardShootCenter;
    center2!: PomGodOfGuardShootCenter;
    entity2!: Entity;
    pos!: Vector3;
    pos2!: Vector3;

    override onEnter() {
        this.pos = new Vector3(this.ctrl.entity.location);
        this.center1 = this.centers.addCenter(this.pos);

        let c = this.ctrl.barrier.center.cpy();
        this.pos2 = new Vector3(
            MathUtil.randomInteger(c.x - 30, c.x + 30),
            this.pos.y,
            MathUtil.randomInteger(c.z - 30, c.z + 30)
        )
        this.center2 = this.centers.addCenter(this.pos2);

        this.entity2 = this.ctrl.entity.dimension.spawnEntity("wb:god_of_guard_settle", this.pos)
    }
    tmpV = new Vector3();
    override onTick(e: TickEvent) {
        if (this.tickNum++ > 60) return true;
        if (this.tickNum > 20) {
            let p = Random.choice(Array.from(this.ctrl.barrier.getPlayers()));
            let targetV = new Vector3(p.getVelocity());
            let targetPos = new Vector3(p.location);
            targetPos.add(targetV.scl(40))
            this.tmpV.set(targetPos);
            targetPos.sub(this.pos2);
            if (this.tickNum % 10 === 0) {
                this.center2.add(targetPos.len() / 2, targetPos, 4 * 1000, this.defDamage, "4");
                try { this.ctrl.entity.dimension.spawnParticle("wb:ruin_desert_boss_target_par", this.tmpV.add(0, 1, 0)) } catch (e) { };

                if (this.tickNum % 15 === 0) {
                    let x = Math.PI * 2 * Math.random();
                    for (let i = 0; i < 360; i += 10) {
                        this.center1.add(15, {
                            x: Math.cos(i * Math.PI / 180),
                            z: Math.sin(i * Math.PI / 180),
                            y: 0
                        }, 4 * 1000, this.defDamage, "4");

                    }
                }
            }
        } else {
            this.entity2.teleport(this.tmpV.set(this.pos2).sub(this.pos).scl(this.tickNum / 20).add(this.pos), {
                "keepVelocity": true
            })
        }
        return false;
    }

    override onExit() {
        ExSystem.tickTask(() => {
            this.centers.remove(this.center1);
            this.centers.remove(this.center2);

            this.entity2.remove();
        }).delay(4 * 20).startOnce();
    }
}






export class PomGodOfGuardBossStates {
    state: { [x: number]: PomGodOfGuardBossState } = {};
    centers: PomGodOfGuardShootCenters;
    constructor(public ctrl: PomBossController) {
        this.centers = new PomGodOfGuardShootCenters(ctrl.entity.dimension);
    }
    onTick(e: TickEvent) {
        this.centers.tick(e.deltaTime, Array.from(this.ctrl.barrier.getPlayers()), this.ctrl.entity);
        for (let i in this.state) {
            if (this.state[i].onTick(e)) {
                this.state[i].onExit();
                this.state[i].listenner?.();
                delete this.state[i];
            }
        }
    }
    set(istate: typeof PomGodOfGuardBossState, damege: number, index = 0, arg?: any) {
        if (this.state[index]) {
            return;
        }
        this.state[index] = (new (istate)(this.centers, this.ctrl, damege, arg));
        this.state[index].onEnter();
    }
    isAvailable(index = 0) {
        return this.state[index] ? false : true;
    }
    listenOnExit(func: () => void, index = 0) {
        this.state[index].listenner = func;
    }

}
export class PomGodOfGuardBoss0 extends PomBossController {
    static typeId = "wb:god_of_guard_zero";
    spawnTimer: TickDelayTask;
    health;
    tick = 1;
    constructor(e: Entity, server: PomServer) {
        super(e, server);
        this.spawnTimer = ExSystem.tickTask(() => {
            this.entity.triggerEvent("change")
        }).delay(7.0 * 20).startOnce();
        this.health = this.entity.getComponent("minecraft:health");
        this.entity.dimension.spawnParticle("wb:god_of_guard_first_par", this.entity.location)
    }
    override initBossEntity(): void {
        super.initBossEntity();
        if (this.isFisrtCall) this.server.say({ rawtext: [{ translate: "text.wb:summon_god_of_guard.name" }] });
    }
    override onSpawn(): void {
        super.onSpawn();
    }
    override onKilled(e: EntityHurtAfterEvent): void {
        console.warn("onWin");
        this.stopBarrier();
        super.onKilled(e);

    }
    override onFail(): void {
        super.onFail();
    }

    @registerEvent("tick")
    onTick(e: TickEvent) {
        this.tick++;
        this.health?.setCurrentValue(1000 * ((this.tick) / 120));
    }

}

export class PomGodOfGuardBoss1 extends PomBossController {
    static typeId = "wb:god_of_guard_first";
    states: PomGodOfGuardBossStates;
    timer: TickDelayTask;
    passive: PomGodOfGuardBossPassive;
    spawnTimer: TickDelayTask;
    times = 0;
    constructor(e: Entity, server: PomServer) {
        super(e, server);
        this.states = new PomGodOfGuardBossStates(this);
        this.passive = new PomGodOfGuardBossPassive(this);
        this.timer = ExSystem.tickTask(() => {
            let normal = [
                PomGodOfGuardBossState1,
                PomGodOfGuardBossState2,
                PomGodOfGuardBossState3,
                PomGodOfGuardBossState5,
                PomGodOfGuardBossState6,
                PomGodOfGuardBossState7,
                PomGodOfGuardBossState9,
                PomGodOfGuardBossState10
                // PomGodOfGuardBossState11,
            ];

            let hard = [
                PomGodOfGuardBossState4,
                PomGodOfGuardBossState8,
                PomGodOfGuardBossState12
            ];

            if (this.states.isAvailable()) {
                let d = this.passive.getDamageWithoutConsume();
                let choice = Random.choice(normal);
                let maxTimes = 0;
                if (d < 20) {
                    maxTimes = MathUtil.randomInteger(3, 4);
                } else if (20 <= d && d <= 40) {
                    maxTimes = MathUtil.randomInteger(2, 3);
                } else if (40 <= d && d <= 60) {
                    maxTimes = MathUtil.randomInteger(1, 2);
                } else {
                    maxTimes = MathUtil.randomInteger(0, 1);
                }
                if (this.times >= maxTimes) {
                    choice = Random.choice(hard);
                    this.times = 0;
                } else {
                    this.times += 1;
                }
                this.states.set(choice, this.passive.getDamage());
                this.states.listenOnExit(() => {
                    this.entity.playAnimation("animation.god_of_guard.staff_effect", {
                        "blendOutTime": 0.2
                    });
                });
            };
            let p = this.passive.getSkipper();
            if (p) {
                if (this.states.isAvailable(-1)) {
                    this.states.set(PomGodOfGuardBossStateWarn, 15, -1, p);
                }
            }
        });
        this.spawnTimer = ExSystem.tickTask(() => {
            this.entity.dimension.createExplosion(this.entity.location, 10, {
                "breaksBlocks": false,
                "causesFire": false,
                "source": this.entity
            });
            this.entity.dimension.spawnParticle("wb:blast_par_small", new Vector3(this.entity.location).add(0, 1, 0));
            this.timer.delay(1.0 * 20);
            this.timer.start();
        }).delay(1.0 * 20).startOnce();
    }
    override initBossEntity(): void {
        super.initBossEntity();
        if (this.isFisrtCall) this.server.say({ rawtext: [{ translate: "text.wb:summon_god_of_guard.name" }] });
    }
    override onSpawn(): void {
        super.onSpawn();
    }
    override onKilled(e: EntityHurtAfterEvent): void {
        this.passive.dispose();
        super.onKilled(e);

    }
    override onFail(): void {
        this.passive.dispose();
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

export enum PomGodOfGuard2State {
    Melee,
    Range
}

export class PomGodOfGuardShadow extends ExEntityController {
    state = PomGodOfGuard2State.Range;
    timer!: TickDelayTask;

    constructor(public bossOri: PomGodOfGuardBoss2, e: Entity, server: PomServer) {
        super(e, server);
    }
    addMove() {
        this.entity.triggerEvent("add_move");
    }
    removeMove() {
        this.entity.triggerEvent("remove_move");
    }
    addMelee() {
        this.entity.triggerEvent("add_melee");
    }
    removeMelee() {
        this.entity.triggerEvent("remove_melee");
    }
    addRange() {
        this.entity.triggerEvent("add_range");
    }
    removeRange() {
        this.entity.triggerEvent("remove_range");
    }
    override dispose(): void {
        super.dispose();
    }
    override onKilled(e: EntityHurtAfterEvent): void {
        super.onKilled(e);
    }
    @registerEvent("afterOnHurt")
    onHurt(e: EntityHurtAfterEvent) {
        if (e.damageSource.cause !== EntityDamageCause.selfDestruct && e.damageSource.cause !== EntityDamageCause.suicide)
            this.bossOri.entity.applyDamage(e.damage, {
                "cause": EntityDamageCause.entityAttack,
                "damagingEntity": e.damageSource.damagingEntity
            });
    }


}

export class PomGodOfGuardBoss2 extends PomBossController {
    static typeId = "wb:god_of_guard_second";
    shadow!: PomGodOfGuardShadow;
    timer!: TickDelayTask;
    passive: PomGodOfGuardBossPassive;
    constructor(e: Entity, server: PomServer) {
        super(e, server);
        this.passive = new PomGodOfGuardBossPassive(this, 2);
    }

    addMove() {
        this.entity.triggerEvent("add_move");
    }
    removeMove() {
        this.entity.triggerEvent("remove_move");
    }
    addMelee() {
        this.entity.triggerEvent("add_melee");
    }
    removeMelee() {
        this.entity.triggerEvent("remove_melee");
    }
    addRange() {
        this.entity.triggerEvent("add_range");

    }
    removeRange() {
        this.entity.triggerEvent("remove_range");
    }
    state = PomGodOfGuard2State.Melee;
    override initBossEntity(): void {
        super.initBossEntity();
        let arr = new ExEntityQuery(this.entity.dimension).at(this.barrier.center).queryBox(this.barrier.area.calculateWidth(), {
            "type": "wb:god_of_guard_shadow"
        }).getEntities();
        if (arr.length == 0) {
            this.shadow = new PomGodOfGuardShadow(this, this.entity.dimension.spawnEntity("wb:god_of_guard_shadow", this.barrier.center), this.server as PomServer);
        }
        if (!this.shadow) {
            this.shadow = new PomGodOfGuardShadow(this, arr[0], this.server as PomServer);
        }
        this.timer = ExSystem.tickTask(() => {
            this.entity.dimension.spawnParticle("epic:sunlight_sword_particle2", this.entity.location);
            this.shadow.entity.dimension.spawnParticle("epic:sunlight_sword_particle2", this.shadow.entity.location);
            this.setTimeout(() => {
                let pos1 = this.entity.location, pos2 = this.shadow.entity.location;
                this.shadow.entity.teleport(pos1);
                this.entity.teleport(pos2);

                [this.state, this.shadow.state] = [this.shadow.state, this.state];
                this.entity.triggerEvent("variant" + this.state);
                this.shadow.entity.triggerEvent("variant" + this.shadow.state);

                this.removeMelee(); this.removeMove(); this.removeRange();
                this.shadow.removeMelee(); this.shadow.removeMove(); this.shadow.removeRange();

                if (this.state == PomGodOfGuard2State.Melee) {
                    this.entity.playAnimation("animation.god_of_guard.melee_skill_all", {
                        "blendOutTime": 0.2
                    });

                    this.attackTimer?.stop();
                    this.attackLiner?.stop();
                    let getSmooth = (time: number, timeAll: number, a: number, b: number) => {
                        return MathUtil.clamp(a + (b - a) * (-Math.pow(((time / timeAll) - 1), 2) + 1), a, b);
                    }
                    let startPos = new Vector3(this.entity.location);
                    let tmpV = new Vector3();
                    let targetFacing = new Vector3();
                    let target = new Vector3();
                    this.attackLiner = ExSystem.timeLine({
                        "1.67": (time) => {
                            //起飞

                            time.registerTick("fly", (time, pastTime) => {
                                this.entity.teleport(tmpV.set(startPos).add(0, getSmooth(pastTime, 3.41 - 1.67, 0, 6), 0), {
                                    // "facingLocation": targetFacing
                                });
                            });
                        },
                        "3.41": (time) => {
                            targetFacing = new Vector3(undefIfError(() => (this.entity.target?.location))
                                ?? Random.choice(Array.from(this.barrier.getPlayers())).location);

                            target.set(tmpV.set(startPos).sub(target).normalize().scl(2).add(targetFacing));

                            //冲
                            time.cancelTick("fly");
                            time.registerTick("fly", (time, pastTime) => {
                                tmpV.set(startPos).add(0, 6, 0);
                                tmpV.set(
                                    getSmooth(pastTime, 4.9 - 3.41, tmpV.x, target.x),
                                    getSmooth(pastTime, 4.9 - 3.41, tmpV.y, target.y),
                                    getSmooth(pastTime, 4.9 - 3.41, tmpV.z, target.z)
                                )
                                this.entity.teleport(tmpV, {
                                    "facingLocation": target
                                });
                                new ExEntityQuery(this.entity.dimension).at(this.entity.location)
                                    .queryBall(2)
                                    .except(this.entity)
                                    .except(this.shadow.entity)
                                    .forEach(e => {
                                        e.applyDamage(30);
                                    });
                            });
                        },
                        "4.75": () => {
                            this.passive.getDamage();
                            //攻击
                            new ExEntityQuery(this.entity.dimension).at(this.entity.location)
                                .setMatrix(ExEntityQuery.getFacingMatrix(this.entity.getViewDirection()))
                                .querySector(6, 4, Vector3.forward, 70)
                                .except(this.entity)
                                .except(this.shadow.entity)
                                .forEach(e => {
                                    e.applyDamage(30 + this.passive.getDamage());
                                });
                        },
                        "4.9": (time) => {
                            //落地
                            time.cancelTick("fly");
                        },
                        "5.67": () => {
                            this.passive.getDamage();
                            new ExEntityQuery(this.entity.dimension).at(this.entity.location)
                                .setMatrix(ExEntityQuery.getFacingMatrix(this.entity.getViewDirection()))
                                .querySector(6, 4, Vector3.forward, 135)
                                .except(this.entity)
                                .except(this.shadow.entity)
                                .forEach(e => {
                                    e.applyDamage(30 + this.passive.getDamage());
                                });
                        },
                        "6.0": () => {
                            this.tryMeleeAttack();
                        }
                    }).start();

                } else {
                    this.entity.playAnimation("animation.god_of_guard.staff_effect_only", {
                        "blendOutTime": 0.2
                    });
                    let tar = new Vector3(Random.choice(Array.from(this.barrier.getPlayers())).location).sub(this.entity.location);
                    tar.y = 0;
                    tar.normalize();

                    let mat1 = new Matrix4().idt().rotateY(15 / 180 * Math.PI);
                    let mat2 = new Matrix4().idt().rotateY(-60 / 180 * Math.PI);

                    mat2.rmulVector(tar);
                    for (let p = -4; p <= 4; p += 1) {
                        const n = p * 15;
                        this.setTimeout(() => {
                            this.exEntity.shootProj("wb:god_of_guard_sword_p", {
                                "speed": 0.9
                            }, tar);
                            mat1.rmulVector(tar);
                        }, p * 250);
                    }
                    this.tryRangeAttack();
                }

                if (this.shadow.state == PomGodOfGuard2State.Melee) {
                    this.tryShadowMeleeAttack();
                } else {
                    this.tryShadowRangeAttack();
                }

                this.timer.delay(20 * MathUtil.randomInteger(8, 13));
                this.timer.startOnce();
            }, 2 * 1000);
            // this.tryLazerAttack();
        }).delay(20 * 2);
        this.timer.startOnce();
    }
    attackTimer?: TickDelayTask;
    attackLiner?: ExTimeLine;
    tryMeleeAttack() {
        this.addMelee();
        this.addMove();
        this.attackTimer?.stop();
        this.attackTimer = ExSystem.tickTask(() => {
            if (this.entity.target && this.exEntity.position.distance(this.entity.target?.location) < 3) {
                this.removeMove();
                this.entity.playAnimation("animation.god_of_guard.melee_attack", {
                    "blendOutTime": 0.2
                });
                this.attackTimer?.stop();
                this.attackTimer = ExSystem.tickTask(() => {
                    this.passive.getDamage();
                    let listener = (e: EntityHurtAfterEvent) => {
                        if (e.damageSource.damagingEntity instanceof Player &&
                            this.exEntity.position.distance(e.damageSource.damagingEntity.location) < 8) {
                            this.getEvents().exEvents.afterOnHurt.unsubscribe(listener);
                            for (let i = 0; i < 5; i++) this.passive.getDamage();
                            this.entity.dimension.spawnParticle("wb:god_of_guard_attack_breakdef_par", this.entity.location);
                        }
                    }
                    if (
                        new ExEntityQuery(this.entity.dimension).at(this.entity.location).querySector(5, 3, this.entity.getViewDirection(), 90)
                            .except(this.entity).forEach((e) => {
                                this.passive.getDamage();
                                e.applyDamage(20 + this.passive.getDamage(), {
                                    "cause": EntityDamageCause.entityAttack,
                                    "damagingEntity": this.entity
                                })
                            }).getEntities().findIndex(e => e instanceof Player) === -1) {
                        this.getEvents().exEvents.afterOnHurt.subscribe(listener)
                        this.setTimeout(() => {
                            this.getEvents().exEvents.afterOnHurt.unsubscribe(listener)
                        }, 2000)
                    };
                    this.exEntity.shootProj("wb:god_of_guard_sword_p", {
                        "speed": 0.6,
                        "rotOffset": new Vector2(0, -30)
                    });
                    this.exEntity.shootProj("wb:god_of_guard_sword_p", {
                        "speed": 0.6
                    });
                    this.exEntity.shootProj("wb:god_of_guard_sword_p", {
                        "speed": 0.6,
                        "rotOffset": new Vector2(0, 30)
                    });
                    this.attackTimer?.stop();
                    this.attackTimer = ExSystem.tickTask(() => {
                        this.tryMeleeAttack();
                    }).delay(20 * 0.75).startOnce();
                }).delay(20 * 1.25).startOnce();
            }
        }).delay(2).start();
    }

    @registerEvent(ExOtherEventNames.onLongTick)
    lazerTrigger() {
        if (this.passive.getTotalHealthReduce() > 300) {
            this.tryLazerAttack();
            this.passive.resetHealthReduce();
        }
    }

    @registerEvent(ExOtherEventNames.onLongTick)
    flyerBurn() {
        this.passive.getSkipper()?.applyDamage(10, {
            "cause": EntityDamageCause.void,
            "damagingEntity": this.entity
        });
    }
    tryRangeAttack() {
        this.addMove();
        this.attackTimer?.stop();
        this.attackTimer = ExSystem.tickTask(() => {
            if (this.entity.target && this.exEntity.position.distance(this.entity.target?.location) < 32) {
                this.entity.playAnimation("animation.god_of_guard.staff_effect_only", {
                    "blendOutTime": 0.2
                });
                this.attackTimer?.stop();
                this.attackTimer = ExSystem.tickTask(() => {
                    this.addRange();
                    this.removeMove();
                    if (this.entity.target) {
                        let startPos = new Vector3(this.entity.getHeadLocation()).add(0, 0, -1).add(this.exEntity.viewDirection.scl(1));
                        this.exEntity.shootProj("wb:god_of_guard_sword_p", {
                            "speed": 0.9
                        },
                            new Vector3(this.entity.target.location).add(0, 1, 0).sub(startPos).normalize(),
                            startPos
                        );
                        this.exEntity.shootProj("wb:god_of_guard_sword_p", {
                            "speed": 0.9,
                            "rotOffset": new Vector2(0, 40)
                        },
                            new Vector3(this.entity.target.location).add(0, 1, 0).sub(startPos).normalize(),
                            startPos
                        );
                        this.exEntity.shootProj("wb:god_of_guard_sword_p", {
                            "speed": 0.9,
                            "rotOffset": new Vector2(0, -40)
                        },
                            new Vector3(this.entity.target.location).add(0, 1, 0).sub(startPos).normalize(),
                            startPos
                        );
                    }
                    this.attackTimer?.stop();
                    this.attackTimer = ExSystem.tickTask(() => {
                        this.removeRange();
                        this.tryRangeAttack();
                    }).delay(20 * 1).startOnce();
                }).delay(20 * 1).startOnce();
            }
        }).delay(2).start();
    }
    tryShadowMeleeAttack() {
        this.shadow.addMove();
        this.shadow.addMelee();
    }
    tryShadowRangeAttack() {
        this.shadow.addMove();
        this.shadow.addRange();
    }

    summonLazer(i: number) {
        let map = new MolangVariableMap();
        map.setFloat("dic_x", Math.sin(i / 180 * Math.PI));
        map.setFloat("dic_z", Math.cos(i / 180 * Math.PI));
        new ExEntityQuery(this.entity.dimension)
            .at(this.entity.location)
            .queryBall(64)
            .except(this.entity)
            .except(this.shadow.entity)
            .setMatrix(new Matrix4().setRotationY(i / 180 * Math.PI))
            .filterBox(new Vector3(1.2, 1.2, 32), new Vector3(0, 0, 32)).forEach((e) => {
                e.applyDamage(100, {
                    "cause": EntityDamageCause.magic,
                    "damagingEntity": this.entity
                });
            });
        this.entity.dimension.spawnParticle("wb:god_of_guard_lazer_par", new Vector3(this.entity.location).add(0, 2, 0), map);
        this.entity.dimension.spawnParticle("wb:ruin_desert_boss_lazer", new Vector3(this.entity.location).add(0, 2, 0), map);
    }
    summonLazerPre(i: number) {
        let map = new MolangVariableMap();
        map.setFloat("dic_x", Math.sin(i / 180 * Math.PI));
        map.setFloat("dic_z", Math.cos(i / 180 * Math.PI));
        this.entity.dimension.spawnParticle("wb:god_of_guard_lazer_notice", new Vector3(this.entity.location).add(0, 2, 0), map);
    }
    tryLazerAttack() {
        this.timer.stop();
        this.attackLiner?.stop();
        this.entity.teleport(this.barrier.center);
        this.removeMove();
        this.removeRange();
        this.addMelee();


        this.attackTimer?.stop();
        this.attackTimer = ExSystem.tickTask(() => {
            this.entity.dimension.spawnParticle("wb:god_of_guard_lazer_pre_par", this.entity.location);
            this.entity.playAnimation("animation.god_of_guard.staff_effect_only", {
                "blendOutTime": 0.2
            });
            let angle = Math.floor(Math.random() * 120) * 3;
            let numTotal = 360;
            let num = numTotal;
            this.attackTimer = ExSystem.tickTask(() => {
                for (let i = angle; i < 360 + angle; i += 72) {
                    this.summonLazerPre(i)
                }
            }).delay(4).start();
            this.setTimeout(() => {
                this.passive.defense[0] = 20;
                this.entity.playAnimation("animation.god_of_guard.staff_effect_only", {
                    "blendOutTime": 0.2
                });
                this.attackTimer?.stop();

                this.attackTimer = ExSystem.tickTask(() => {
                    if (num > numTotal / 2) {
                        for (let i = angle; i < 360 + angle; i += 72) {
                            this.summonLazer(i)
                        }
                    } else if (num > numTotal / 4) {
                        for (let i = angle; i < 360 + angle; i += 60) {
                            this.summonLazer(i);
                        }
                        for (let i = angle + 45; i < 360 + angle + 45; i += 90) {
                            this.summonLazerPre(i);
                        }
                    } else if (num > numTotal / 4 / 3 * 2) {
                        for (let i = angle + 45; i < 360 + angle + 45; i += 90) {
                            this.summonLazer(i);
                        }
                        for (let i = angle; i < 360 + angle; i += 180) {
                            this.summonLazerPre(i);
                        }
                    } else if (num > numTotal / 4 / 3) {
                        for (let i = angle; i < 360 + angle; i += 180) {
                            this.summonLazer(i);
                        }
                        for (let i = angle + 45; i < 360 + angle + 45; i += 120) {
                            this.summonLazerPre(i);
                        }
                    } else {
                        for (let i = angle + 45; i < 360 + angle + 45; i += 120) {
                            this.summonLazer(i);
                        }
                    }
                    // this.summonLazer(angle);
                    angle += 1;
                    num -= 1;
                    if (num <= 0) {
                        this.attackTimer?.stop();
                        this.timer.stop();
                        this.timer.delay(20).startOnce();
                    }
                }).delay(1).start();
            }, 2 * 1000);
        }).delay(2 * 20).startOnce();

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
    override dispose(): void {
        this.attackTimer?.stop();
        this.timer?.stop();
        this.attackLiner?.stop();
        super.dispose();
    }

    override despawn(): void {
        new ExEntityQuery(this.entity.dimension).at(this.barrier.center).queryBox(this.barrier.area.calculateWidth(), {
            "type": "wb:god_of_guard_shadow"
        }).getEntities().forEach(e => e.remove())
        super.despawn();
    }
}

export class PomGodOfGuardBoss3 extends PomBossController {
    static typeId = "wb:god_of_guard_third";
    constructor(e: Entity, server: PomServer) {
        super(e, server);
    }
    override initBossEntity(): void {
        super.initBossEntity();
        new ExEntityQuery(this.entity.dimension).at(this.barrier.center).queryBox(this.barrier.area.calculateWidth(), {
            "type": "wb:god_of_guard_shadow"
        }).forEach((e) => e.remove());
    }

    override onSpawn(): void {
        super.onSpawn();
    }
    override onKilled(e: EntityHurtAfterEvent): void {
        super.onWin();
        this.server.say({ rawtext: [{ translate: "text.wb:defeat_intentions.name" }] });
        super.onKilled(e);
    }
    override onFail(): void {
        super.onFail();
    }

}


export class PomGodOfGuardBossPassive implements DisposeAble {
    defense: [number, number] = [0, 0];
    listener: (e: EntityHurtAfterEvent) => void;
    nextText: string[];
    skipper: (e: TickEvent) => void;
    playerSkipperData: Map<Player, [number[], number]> = new Map();
    healthReduce = 0;
    constructor(public ctrl: PomBossController, public state = 1) {
        this.listener = (e) => {
            if (e.hurtEntity instanceof Player && e.damageSource.damagingEntity == ctrl.entity) {
                if (e.damage > 100000) return;
                if (this.ctrl.barrier.players.has(e.hurtEntity)) {
                    ctrl.exEntity.addHealth(ctrl, e.damage);
                }
            }
            if (ctrl.entity == e.hurtEntity) {
                ctrl.exEntity.addHealth(ctrl, e.damage * (this.defense[0] / 20));
                if (state == 1) {
                    this.defense[1] += (e.damage);
                } else {
                    this.defense[1] += e.damage - (ctrl.exEntity.getPreRemoveHealth() ?? 0)
                }
                this.defense[0] = Math.min(20, this.defense[0] + 1);
                this.healthReduce += e.damage + (ctrl.exEntity.getPreRemoveHealth() ?? 0);
                this.upDateInf();
            }

        }
        this.nextText = ["", ""]
        this.ctrl.server.getEvents().events.afterEntityHurt.subscribe(this.listener);
        for (let p of ctrl.barrier.clientsByPlayer()) {
            p.magicSystem.setActionbarByPass("godofguard", this.nextText);
        }
        for (let p of ctrl.barrier.getPlayers()) {
            this.playerSkipperData.set(p, [new Array<number>(15).fill(0), 0])
        }
        this.skipper = (e: TickEvent) => {
            if (e.currentTick % 4 === 0) {
                for (let p of ctrl.barrier.getPlayers()) {
                    let loc = new Vector3(p.location);
                    let under = undefIfError(() => ctrl.entity.dimension.getBlock(loc.sub(0, 1, 0)));
                    let getter = this.playerSkipperData.get(p)!;
                    if (p.getGameMode() === GameMode.creative) continue;
                    getter[1] -= getter[0].shift()!;
                    getter[0].push(
                        (under?.typeId === "minecraft:air" ? 1 : 0) +
                        ((under = undefIfError(() => under?.below(1)))?.typeId === "minecraft:air" ? 1 : 0) +
                        ((under = undefIfError(() => under?.below(1)))?.typeId === "minecraft:air" ? 1 : 0) +
                        ((under = undefIfError(() => under?.below(1)))?.typeId === "minecraft:air" ? 1 : 0)
                    );
                    getter[1] += getter[0][14]
                }
            }
        }
        ctrl.getEvents().exEvents.onLongTick.subscribe(this.skipper);
    }
    getSkipper() {
        for (let i of this.playerSkipperData) {
            let s = i[1][1];
            if (s > 20) {
                return i[0];
            }
        }
    }
    dispose() {
        this.ctrl.server.getEvents().events.afterEntityHurt.unsubscribe(this.listener);
        this.ctrl.getEvents().exEvents.onLongTick.unsubscribe(this.skipper);

        for (let p of this.ctrl.barrier.clientsByPlayer()) {
            p.magicSystem.deleteActionbarPass("godofguard");
        }
    }
    upDateInf() {
        let d = this.defense[1] / this.defense[0];
        this.nextText[0] = "反击额外伤害: " + d;
        this.nextText[1] = "防御层数: " + this.defense[0];
    }
    getDamage() {
        if (this.defense[0] > 0) {
            this.upDateInf();
            let d = this.defense[1] / this.defense[0];

            this.defense[0] = Math.max(0, this.defense[0] - 1);
            this.defense[1] -= d;
            return 20 + (d ?? 0);
        } else {
            this.nextText[0] = "反击额外伤害: " + 0;
            this.nextText[1] = "防御层数: " + 0;
            return 20;
        }
    }
    getDamageWithoutConsume() {
        if (this.defense[0] > 0) {
            let d = this.defense[1] / this.defense[0];
            return (d ?? 0);
        } else {
            return 0;
        }
    }
    getTotalHealthReduce() {
        return this.healthReduce;
    }
    resetHealthReduce() {
        this.healthReduce = 0;
    }
}



export class PomGodOfGuardShootCenter {
    trajectory: KDTree;
    center: Vector3;
    pointJudge = new WeakMap<KDPoint, { spawnTime: number, direction: Vector3, speed: number, lifeTime: number, damage: number, damageType: EntityDamageCause }>();
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
            let { spawnTime, lifeTime, damage } = this.pointJudge.get(p)!;
            if (now - spawnTime > lifeTime) {
                this.pointJudge.delete(p);
            } else {
                npoints.push(p);
            }
        }

        this.trajectory.build(npoints);
    }
    add(speed: number, dic: IVector3, lifeTime: number, damage: number, parStyle = "", damageType = EntityDamageCause.entityAttack): void {
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
        this.pointJudge.set(point, { speed: speed, direction: this.tmpV.cpy(), spawnTime: new Date().getTime(), lifeTime: lifeTime, damage: damage, damageType: damageType });
        this.dimension.spawnParticle("wb:ruin_desert_boss_shoot" + parStyle + "_par", this.center, map);
    }
    judgeHurt(pos: IVector3, pastTime: number) {
        let boxR = 0.7;
        let boxR2 = boxR / this.tmpV.set(pos).sub(this.center).len() * 1.42;
        let dic = this.trajectory.rangeSearch(new KDPoint(...this.tmpV.set(pos).sub(this.center).normalize().toArray()), boxR2);
        for (let i of dic) {
            if (this.pointJudge.has(i)) {
                let { spawnTime, speed, direction, lifeTime, damageType } = this.pointJudge.get(i)!;
                let newTime = new Date().getTime();
                if (newTime - spawnTime <= lifeTime) {
                    let beforePos = this.tmpA.set(this.center).add(this.tmpV.set(direction).scl(speed * (newTime - pastTime - spawnTime) / 1000));
                    let afterPos = this.tmpB.set(this.center).add(this.tmpV.set(direction).scl(speed * (newTime - spawnTime) / 1000));
                    let dis1 = beforePos.distance(pos), dis2 = afterPos.distance(pos);

                    if (dis1 < boxR || dis2 < boxR) {
                        return [this.pointJudge.get(i)?.damage ?? 0, damageType];
                    }
                    let midLen = this.tmpV.set(afterPos).sub(beforePos).scl(0.5).add(beforePos).distance(pos);
                    let d = this.tmpV.set(afterPos).sub(beforePos);
                    if (midLen < dis1 && midLen < dis2 && d.crs(beforePos.sub(pos)).len() / d.len() <= boxR) {
                        return [this.pointJudge.get(i)?.damage ?? 0, damageType];
                    }
                } else {
                    this.trajectory.delete(i);
                    this.pointJudge.delete(i);
                }

            } else {
                this.trajectory.delete(i);
            }
        }
        return undefined;
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
                let d = c.judgeHurt(this.tmpV.set(p.location).add(0, 0.5, 0), tickDelay);
                if (d) {
                    p.applyDamage(d[0] as number, {
                        "cause": d[1] as EntityDamageCause,
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