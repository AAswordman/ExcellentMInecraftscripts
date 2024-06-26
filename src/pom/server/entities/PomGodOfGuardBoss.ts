import { Dimension, Entity, EntityHurtAfterEvent, MolangVariableMap, Direction, EntityDamageCause, Player, GameMode } from '@minecraft/server';
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
import MathUtil from '../../../modules/exmc/utils/math/MathUtil.js';
import DisposeAble from '../../../modules/exmc/interface/DisposeAble.js';
import Queue from '../../../modules/exmc/utils/queue/Queue.js';
import { falseIfError, undefIfError } from '../../../modules/exmc/utils/tool.js';

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
            // console.warn("remove");
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
    spawnTimer: void;
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
    spawnTimer: void;
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
        if (this.isFisrtCall) this.server.say({ rawtext: [{ translate: "text.wb:summon_intentions.name" }] });
    }
    override onSpawn(): void {
        super.onSpawn();
    }
    override onKilled(e: EntityHurtAfterEvent): void {
        console.warn("onWin");
        this.passive.dispose();
        this.stopBarrier();
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

export class PomGodOfGuardBoss2 extends PomBossController {
    static typeId = "wb:god_of_guard_second";
    constructor(e: Entity, server: PomServer) {
        super(e, server);
    }
    override initBossEntity(): void {
        super.initBossEntity();
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


export class PomGodOfGuardBossPassive implements DisposeAble {
    defense: [number, number] = [0, 0];
    listener: (e: EntityHurtAfterEvent) => void;
    nextText: string[];
    skipper: (e: TickEvent) => void;
    playerSkipperData: Map<Player, [number[], number]> = new Map();
    constructor(public ctrl: PomBossController) {
        this.listener = (e) => {
            if (e.hurtEntity instanceof Player && e.damageSource.damagingEntity == ctrl.entity) {
                if (e.damage > 100000) return;
                if (this.ctrl.barrier.players.has(e.hurtEntity)) {
                    ctrl.exEntity.addHealth(ctrl, e.damage);
                }
            }
            if (ctrl.entity == e.hurtEntity) {
                ctrl.exEntity.addHealth(ctrl, e.damage * (this.defense[0] / 20));
                this.defense[1] += (e.damage);
                this.defense[0] = Math.min(20, this.defense[0] + 1);
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
                    // console.warn(under?.typeId);
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
            // console.warn(i[1][0],i[1][1]);
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
    getDamage() {
        if (this.defense[0] > 0) {
            let d = this.defense[1] / this.defense[0];
            this.defense[1] -= d;
            this.nextText[0] = "反击额外伤害: " + d;
            this.defense[0] = Math.max(0, this.defense[0] - 1);
            this.nextText[1] = "防御层数: " + this.defense[0];
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