import { Dimension, Entity, EntityHurtAfterEvent, MolangVariableMap, Direction, EntityDamageCause, Player, GameMode, world, system, System, EntityDieAfterEvent } from '@minecraft/server';
import { registerEvent } from '../../../modules/exmc/server/events/eventDecoratorFactory.js';
import { ExEventNames, ExOtherEventNames, TickEvent } from '../../../modules/exmc/server/events/events.js';
import ExErrorQueue, { ignorn } from '../../../modules/exmc/server/ExErrorQueue.js';
import Vector3, { IVector3 } from '../../../modules/exmc/utils/math/Vector3.js';
import KDTree, { KDPoint } from '../../../modules/exmc/utils/tree/KDTree.js';
import VarOnChangeListener from '../../../modules/exmc/utils/VarOnChangeListener.js';
import PomServer from '../PomServer.js';
import PomBossController from './PomBossController.js';
import UUID from '../../../modules/exmc/utils/UUID.js';
import ExSystem from '../../../modules/exmc/utils/ExSystem.js';
import TickDelayTask from '../../../modules/exmc/utils/TickDelayTask.js';
import Random, { random } from '../../../modules/exmc/utils/Random.js';
import MathUtil from '../../../modules/exmc/utils/math/MathUtil.js';
import DisposeAble from '../../../modules/exmc/interface/DisposeAble.js';
import Queue from '../../../modules/exmc/utils/queue/Queue.js';
import { falseIfError } from '../../../modules/exmc/utils/tool.js';
import ExEntityController from '../../../modules/exmc/server/entity/ExEntityController.js';
import ExEntityQuery from '../../../modules/exmc/server/env/ExEntityQuery.js';
import Vector2 from '../../../modules/exmc/utils/math/Vector2.js';
import Matrix4 from '../../../modules/exmc/utils/math/Matrix4.js';
import ExTimeLine from '../../../modules/exmc/utils/ExTimeLine.js';
import { ExBlockArea } from '../../../modules/exmc/server/block/ExBlockArea.js';
import format from '../../../modules/exmc/utils/format.js';
import { langType } from '../data/langType.js';
import ExGame from '../../../modules/exmc/server/ExGame.js';
import ExPlayer from '../../../modules/exmc/server/entity/ExPlayer.js';
import { MinecraftEffectTypes, MinecraftEntityTypes, MinecraftItemTypes } from '../../../modules/vanilla-data/lib/index.js';

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
        ExSystem.tickTask(this.ctrl, () => {
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
        ExSystem.tickTask(this.ctrl, () => {
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
        ExSystem.tickTask(this.ctrl, () => {
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
        ExSystem.tickTask(this.ctrl, () => {
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
        ExSystem.tickTask(this.ctrl, () => {
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
        ExSystem.tickTask(this.ctrl, () => {
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
        ExSystem.tickTask(this.ctrl, () => {
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
        ExSystem.tickTask(this.ctrl, () => {
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
        ExSystem.tickTask(this.ctrl, () => {
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
        ExSystem.tickTask(this.ctrl, () => {
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
        ExSystem.tickTask(this.ctrl, () => {
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
            for (let i = 0; i < 24; i++) {
                const angle = i * Math.PI * 2 / 24 + this.tickNum * Math.PI / 60;
                this.center1.add(10, {
                    x: Math.cos(angle),
                    z: Math.sin(angle),
                    y: Math.abs(Math.sin(angle * 3)) / 10
                }, (5) * 1000, this.defDamage);
                this.center2.add(10, {
                    x: Math.cos(angle),
                    z: Math.sin(angle),
                    y: Math.abs(Math.sin(angle * 3)) / 10
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
        ExSystem.tickTask(this.ctrl, () => {
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
        ExSystem.tickTask(this.ctrl, () => {
            this.centers.remove(this.center1);
            this.centers.remove(this.center2);

            ignorn(() => this.entity2.remove());
        }).delay(4 * 20).startOnce();
    }
}




//空袭
export class PomGodOfGuardBossState13 extends PomGodOfGuardBossState {
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
        this.pos2.y = this.pos.y + 30;
        this.center2 = this.centers.addCenter(this.pos2);

        this.entity2 = this.ctrl.entity.dimension.spawnEntity("wb:god_of_guard_settle", this.pos);
    }
    tmpV = new Vector3();
    override onTick(e: TickEvent) {
        if (this.tickNum++ > 80) return true;
        if (this.tickNum > 20) {
            for (let i = 0; i < 18; i++) {
                const angle = i * Math.PI * 2 / 18 + this.tickNum * Math.PI / 30;
                this.center1.add(10, {
                    x: Math.cos(angle),
                    z: Math.sin(angle),
                    y: 0.02
                }, (5) * 1000, this.defDamage);
            }
            for (let i = 0; i < 4; i++) {
                const angle = i * Math.PI / 2 + this.tickNum * Math.PI / 18;
                this.center2.add(15, {
                    x: Math.cos(angle),
                    z: Math.sin(angle),
                    y: Math.random() * -2
                }, (5) * 1000, this.defDamage, "3");
            }
        } else {
            this.entity2.teleport(this.tmpV.set(this.pos2).sub(this.pos).scl(this.tickNum / 20).add(this.pos), {
                "keepVelocity": true
            })
        }
        return false;
    }

    override onExit() {
        ExSystem.tickTask(this.ctrl, () => {
            this.centers.remove(this.center1);
            this.centers.remove(this.center2);
            ignorn(() => this.entity2.remove());

        }).delay(5 * 20).startOnce();
    }
}
//星河
export class PomGodOfGuardBossState18 extends PomGodOfGuardBossState {
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
            for (let i = 0; i < 32; i++) {
                const angle = i * Math.PI * 2 / 32 + this.tickNum * Math.PI / 60;
                this.center1.add(10, {
                    x: Math.cos(angle),
                    z: Math.sin(angle),
                    y: 0.02
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
        ExSystem.tickTask(this.ctrl, () => {
            this.centers.remove(this.center1);
            this.centers.remove(this.center2);
            ignorn(() => this.entity2.remove());

        }).delay(5 * 20).startOnce();
    }
}

// 交换浪潮

export class PomGodOfGuardBossState14 extends PomGodOfGuardBossState {
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
        if (this.tickNum++ > 120) return true;
        if (this.tickNum > 20) {
            if (this.tickNum % 20 < 10) { // center1 发射弹幕
                for (let i = 0; i < 24; i++) {
                    const angle = i * Math.PI * 2 / 24 + this.tickNum * Math.PI / 60;
                    this.center1.add(10, {
                        x: Math.cos(angle),
                        z: Math.sin(angle),
                        y: Math.abs(Math.sin(angle * 3)) / 10
                    }, (3.2) * 1000, this.defDamage);
                }
            } else { // center2 发射弹幕
                for (let i = 0; i < 20; i++) {
                    const angle = i * Math.PI * 2 / 20 + this.tickNum * Math.PI / 60;
                    this.center2.add(15, {
                        x: Math.cos(angle),
                        z: Math.sin(angle),
                        y: Math.abs(Math.sin(angle * 3)) / 20
                    }, (2.5) * 1000, this.defDamage);
                }
            }
            if (this.tickNum % 60 === 0) { // 每隔一段时间进行联合攻击
                for (let i = 0; i < 360; i += 10) {
                    this.center1.add(10, {
                        x: Math.cos(i * Math.PI / 180),
                        z: Math.sin(i * Math.PI / 180),
                        y: 0
                    }, 3.2 * 1000, this.defDamage);
                    this.center2.add(15, {
                        x: Math.cos(i * Math.PI / 180),
                        z: Math.sin(i * Math.PI / 180),
                        y: 0
                    }, 2.5 * 1000, this.defDamage);
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
        ExSystem.tickTask(this.ctrl, () => {
            this.centers.remove(this.center1);
            this.centers.remove(this.center2);

            ignorn(() => this.entity2.remove());
        }).delay(5 * 20).startOnce();
    }
}
// 多中心

//链锁屏蔽
export class PomGodOfGuardBossState15 extends PomGodOfGuardBossState {
    tickNum = 0;
    center1!: PomGodOfGuardShootCenter;
    center2!: PomGodOfGuardShootCenter[];
    entity2!: Entity[];
    pos!: Vector3;
    pos2!: Vector3[];
    dic!: Vector3[];
    dic2!: Vector3[];

    override onEnter() {
        this.pos = new Vector3(this.ctrl.entity.location);
        this.center1 = this.centers.addCenter(this.pos);
        this.center2 = [];
        this.entity2 = [];
        this.dic = [];
        this.dic2 = [];
        this.pos.y += 1;
        this.pos2 = new Array(10).fill(0).map(e => {
            let c = ExBlockArea.randomPoint([this.ctrl.barrier.area]);
            c.y = this.pos.y;
            this.center2.push(this.centers.addCenter(c));
            this.entity2.push(this.ctrl.entity.dimension.spawnEntity("wb:god_of_guard_settle", this.pos));
            this.dic.push(c.cpy().sub(this.pos));
            this.dic2.push(c.cpy().sub(this.pos).scl(-1));
            return c;
        });


    }
    tmpV = new Vector3();
    override onTick(e: TickEvent) {
        if (this.tickNum++ > 100) return true;
        if (this.tickNum > 60) {
            for (let [i, c] of this.center2.entries()) {
                for (let i = 0; i < 4; i++) {
                    const angle = i * Math.PI / 2 + 6 * this.tickNum * Math.PI / 180;
                    c.add(4, {
                        x: Math.cos(angle),
                        z: Math.sin(angle),
                        y: 0
                    }, (3) * 1000, this.defDamage);
                }
            }
        } else if (this.tickNum > 20) {
            if (this.tickNum % 4 === 0) {
                for (let [i, c] of this.center2.entries()) {
                    this.center1.add(30, this.dic[i], (2) * 1000, this.defDamage, "3", EntityDamageCause.magic);
                    this.center2[i].add(30, this.dic2[i], (2) * 1000, this.defDamage, "3", EntityDamageCause.magic);

                }
            }
        } else {
            for (let [i, e] of this.entity2.entries()) {
                e.teleport(this.tmpV.set(this.pos2[i]).sub(this.pos).scl(this.tickNum / 20).add(this.pos), {
                    "keepVelocity": true
                })
            }
        }
        return false;
    }

    override onExit() {
        ignorn(() => this.entity2.map((e) => e.remove()));

        ExSystem.tickTask(this.ctrl, () => {
            this.centers.remove(this.center1);
            this.center2.map((e) => this.centers.remove(e));

        }).delay(3 * 20).startOnce();
    }
}

//横竖攻击
export class PomGodOfGuardBossState16 extends PomGodOfGuardBossState {
    tickNum = 0;
    center1!: PomGodOfGuardShootCenter;
    center2!: PomGodOfGuardShootCenter[];
    entity2!: Entity[];
    pos!: Vector3;
    dic!: Vector3[];

    override onEnter() {
        this.pos = new Vector3(this.ctrl.entity.location);
        this.center1 = this.centers.addCenter(this.pos);
        this.center2 = [];
        this.entity2 = [];
        this.dic = [];
        this.pos.y += 1;
        for (let i = -32; i < 32; i += 8) {
            let vec = new Vector3(i, 0, 32).add(this.pos);
            this.center2.push(this.centers.addCenter(vec));
            this.entity2.push(this.ctrl.entity.dimension.spawnEntity("wb:god_of_guard_settle", this.pos));
            this.dic.push(new Vector3(0, 0, -1));
        }
        for (let i = -32; i < 32; i += 8) {
            let vec = new Vector3(i, 0, -32).add(this.pos);
            this.center2.push(this.centers.addCenter(vec));
            this.entity2.push(this.ctrl.entity.dimension.spawnEntity("wb:god_of_guard_settle", this.pos));
            this.dic.push(new Vector3(0, 0, 1));
        }
        for (let i = -32; i < 32; i += 8) {
            let vec = new Vector3(32, 0, i).add(this.pos);
            this.center2.push(this.centers.addCenter(vec));
            this.entity2.push(this.ctrl.entity.dimension.spawnEntity("wb:god_of_guard_settle", this.pos));
            this.dic.push(new Vector3(-1, 0, 0));
        }
        for (let i = -32; i < 32; i += 8) {
            let vec = new Vector3(-32, 0, i).add(this.pos);
            this.center2.push(this.centers.addCenter(vec));
            this.entity2.push(this.ctrl.entity.dimension.spawnEntity("wb:god_of_guard_settle", this.pos));
            this.dic.push(new Vector3(1, 0, 0));
        }
    }
    tmpV = new Vector3();
    override onTick(e: TickEvent) {
        if (this.tickNum++ > 40) return true;
        if (this.tickNum > 30) {
            for (let i = 0; i < 4; i++) {
                const angle = i * Math.PI / 2 + 10 * this.tickNum * Math.PI / 180;
                this.center1.add(20, {
                    x: Math.cos(angle),
                    z: Math.sin(angle),
                    y: 0
                }, (3) * 1000, this.defDamage, "3", EntityDamageCause.magic);
            }
        } else if (this.tickNum > 20) {
            if (this.tickNum % 4 === 0) {
                for (let [i, c] of this.center2.entries()) {
                    c.add(30, this.dic[i], (2) * 1000, this.defDamage, "3", EntityDamageCause.magic);
                }
            }
        } else {
            for (let [i, e] of this.entity2.entries()) {
                e.teleport(this.tmpV.set(this.center2[i].center).sub(this.pos).scl(this.tickNum / 20).add(this.pos), {
                    "keepVelocity": true
                })
            }
        }
        return false;
    }

    override onExit() {
        ignorn(() => this.entity2.map((e) => e.remove()));

        ExSystem.tickTask(this.ctrl, () => {
            this.centers.remove(this.center1);
            this.center2.map((e) => this.centers.remove(e));

        }).delay(3 * 20).startOnce();
    }
}
//横竖攻击
export class PomGodOfGuardBossState17 extends PomGodOfGuardBossState {
    tickNum = 0;
    center1!: PomGodOfGuardShootCenter;
    center2!: PomGodOfGuardShootCenter[];
    entity2!: Entity[];
    center3!: PomGodOfGuardShootCenter[];
    entity3!: Entity[];
    pos!: Vector3;

    override onEnter() {
        this.pos = new Vector3(this.ctrl.entity.location);
        this.center1 = this.centers.addCenter(this.pos);
        this.center2 = [];
        this.entity2 = [];
        this.center3 = [];
        this.entity3 = [];
        this.pos.y += 1;
        for (let i = -32; i < 32; i += 16) {
            let vec = new Vector3(i, 0, 32).add(this.pos);
            this.center2.push(this.centers.addCenter(vec));
            this.entity2.push(this.ctrl.entity.dimension.spawnEntity("wb:god_of_guard_settle", this.pos));
        }
        for (let i = -32; i < 32; i += 16) {
            let vec = new Vector3(i, 0, -32).add(this.pos);
            this.center2.push(this.centers.addCenter(vec));
            this.entity2.push(this.ctrl.entity.dimension.spawnEntity("wb:god_of_guard_settle", this.pos));
        }
        for (let i = -32; i < 32; i += 16) {
            let vec = new Vector3(32, 0, i).add(this.pos);
            this.center3.push(this.centers.addCenter(vec));
            this.entity3.push(this.ctrl.entity.dimension.spawnEntity("wb:god_of_guard_settle", this.pos));
        }
        for (let i = -32; i < 32; i += 16) {
            let vec = new Vector3(-32, 0, i).add(this.pos);
            this.center3.push(this.centers.addCenter(vec));
            this.entity3.push(this.ctrl.entity.dimension.spawnEntity("wb:god_of_guard_settle", this.pos));
        }

    }
    tmpV = new Vector3();
    override onTick(e: TickEvent) {
        if (this.tickNum++ > 50) return true;

        let p = Random.choice(Array.from(this.ctrl.barrier.getPlayers()));
        let targetV = new Vector3(p.getVelocity());
        let targetPos = new Vector3(p.location);

        if (this.tickNum > 40) {
            for (let i = 0; i < 4; i++) {
                const angle = i * Math.PI / 2 + 30 * this.tickNum * Math.PI / 180;
                this.center1.add(20, {
                    x: Math.cos(angle),
                    z: Math.sin(angle),
                    y: 0
                }, (3) * 1000, this.defDamage, "3", EntityDamageCause.magic);
            }
        } else if (this.tickNum > 30) {
            if (this.tickNum % 2 === 0) {
                for (let [i, c] of this.center2.entries()) {
                    c.add(30, this.tmpV.set(targetPos).sub(c.center), (3) * 1000, this.defDamage, "4", EntityDamageCause.magic);
                }
            }
        } else if (this.tickNum > 20) {
            if (this.tickNum % 2 === 0) {
                for (let [i, c] of this.center3.entries()) {
                    c.add(30, this.tmpV.set(targetPos).sub(c.center), (3) * 1000, this.defDamage, "4", EntityDamageCause.magic);
                }
            }
        } else {
            for (let [i, e] of this.entity2.entries()) {
                e.teleport(this.tmpV.set(this.center2[i].center).sub(this.pos).scl(this.tickNum / 20).add(this.pos), {
                    "keepVelocity": true
                })
            }
            for (let [i, e] of this.entity3.entries()) {
                e.teleport(this.tmpV.set(this.center3[i].center).sub(this.pos).scl(this.tickNum / 20).add(this.pos), {
                    "keepVelocity": true
                })
            }
        }
        return false;
    }

    override onExit() {
        ignorn(() => this.entity2.map((e) => e.remove()));
        ignorn(() => this.entity3.map((e) => e.remove()));

        ExSystem.tickTask(this.ctrl, () => {
            this.centers.remove(this.center1);
            this.center2.map((e) => this.centers.remove(e));
            this.center3.map((e) => this.centers.remove(e));

        }).delay(3 * 20).startOnce();
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
    constructor(e: Entity, server: PomServer, spawn: boolean) {
        super(e, server, spawn);
        this.spawnTimer = ExSystem.tickTask(this, () => {
            this.entity.triggerEvent("change")
        }).delay(7.0 * 20).startOnce();
        this.health = this.entity.getComponent("minecraft:health");
        this.entity.dimension.spawnParticle("wb:god_of_guard_first_par", this.entity.location)
    }
    override initBossEntity(): void {
        super.initBossEntity();
        if (this.isFisrtCall) {
            this.server.say({ rawtext: [{ translate: "text.wb:summon_god_of_guard.name" }] });
        }
    }
    override onAppear(spawn: boolean): void {
        super.onAppear(spawn);
    }
    override onKilled(e: EntityDieAfterEvent): void {
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
    constructor(e: Entity, server: PomServer, spawn: boolean) {
        super(e, server, spawn);
        this.states = new PomGodOfGuardBossStates(this);
        this.passive = new PomGodOfGuardBossPassive(this);
        this.timer = ExSystem.tickTask(this, () => {
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
        this.spawnTimer = ExSystem.tickTask(this, () => {
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
    }
    override onAppear(spawn: boolean): void {
        super.onAppear(spawn);
    }
    override onKilled(e: EntityDieAfterEvent): void {
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

export class PomGodOfGuardSkillBox {
    constructor(private boss: ExEntityController, private exception: Entity = boss.entity) {
    }
    state = PomGodOfGuard2State.Range;

    get entity() {
        return this.boss.entity;
    }
    isMeleeState() {
        return this.state === PomGodOfGuard2State.Melee;
    }
    setMeleeState() {
        this.state = PomGodOfGuard2State.Melee;
        this.entity.triggerEvent("variant" + this.state);
    }
    setRangeState() {
        this.state = PomGodOfGuard2State.Range;
        this.entity.triggerEvent("variant" + this.state);
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
    removeAll() {
        this.removeMelee();
        this.removeMove();
        this.removeRange();
    }
    summonLazer(i: number) {
        let map = new MolangVariableMap();
        map.setFloat("dic_x", Math.sin(i / 180 * Math.PI));
        map.setFloat("dic_z", Math.cos(i / 180 * Math.PI));
        new ExEntityQuery(this.entity.dimension)
            .at(this.entity.location)
            .queryBall(64, {
                excludeFamilies: ["god_summoner"]
            })
            .except(this.entity)
            .except(this.exception)
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
    forwords(time = 0.25) {
        const nstate = this.state;
        this.boss.runTimeout(() => {
            if (nstate !== this.state) return;
            let pos = this.boss.exEntity.position;
            let view = this.boss.exEntity.viewDirection;
            view.y = 0; view.normalize();
            pos.add(view.scl(1.3))
            this.entity.teleport(pos);
        }, time * 1000);
    }
}

export class PomGodOfGuardShadow extends ExEntityController {

    tryStateSprint() {
        this.entity.playAnimation("animation.god_of_guard.shadow_melee_skill");
        let getSmooth = (time: number, timeAll: number, a: number, b: number) => {
            return MathUtil.clamp(a + (b - a) * (-Math.pow(((time / timeAll) - 1), 2) + 1), a, b);
        }
        let startPos = new Vector3(this.entity.location);
        let tmpV = new Vector3();
        let target = new Vector3(this.entity.target?.location ?? Random.choice(Array.from(this.bossOri.barrier.getPlayers())).location);

        target = target.cpy().sub(startPos).normalize().scl(7).add(target).add((Math.random() - 1) * 2, 0, (Math.random() - 1) * 2);

        target.y = startPos.y;

        tmpV.set(target).sub(startPos);
        let rot = new Vector2(tmpV.rotateAngleY(), tmpV.rotateAngleX())
        let dic = new Vector3(target).sub(startPos).normalize();

        this.attackLiner?.stop();
        this.attackLiner = ExSystem.timeLine(this, {
            "0.0": (time) => {
                time.registerTick("fly", (time, pastTime) => {
                    this.entity.teleport(startPos.add(dic.scl(0.1)), {
                        facingLocation: target
                    });
                });
            },
            "1.05": (time) => {
                time.cancelTick("fly")
                time.registerTick("fly", (time, pastTime) => {
                    tmpV.set(
                        getSmooth(pastTime, 1.75 - 1.05, startPos.x, target.x),
                        getSmooth(pastTime, 1.75 - 1.05, startPos.y, target.y),
                        getSmooth(pastTime, 1.75 - 1.05, startPos.z, target.z)
                    )
                    this.entity.teleport(tmpV, {
                        "facingLocation": target
                    });
                    new ExEntityQuery(this.entity.dimension).at(this.entity.location)
                        .queryBall(2, {
                            excludeFamilies: ["god_summoner"]
                        })
                        .except(this.entity)
                        .except(this.bossOri.entity)
                        .forEach(e => {
                            e.applyDamage(this.damageAmount);
                        });
                });
            },
            "1.75": (time) => {
                time.cancelTick("fly")
            }
        }).start();
    }
    changeState() {
        if (this.skillBox.state == PomGodOfGuard2State.Melee) {
            let num = 3;
            this.tryStateSprint();
            this.attackTimer = ExSystem.tickTask(this, () => {
                this.tryStateSprint();
                num--;
                if (num <= 0) {
                    this.attackTimer?.stop();
                    this.tryMeleeAttack();
                }
            }).delay(2.5 * 20).start();
        } else {

            this.entity.playAnimation("animation.god_of_guard.staff_effect_only", {
                "blendOutTime": 0.2
            });
            this.runTimeout(() => {
                let p = this.entity.target ?? Random.choice(Array.from(this.bossOri.barrier.getPlayers()));
                for (let i = 1; i < 4; i++) {
                    let targetPos = new Vector3(p.location);
                    let targetV = new Vector3(p.getVelocity());
                    targetV.y = 0;
                    targetPos.add(targetV.scl(i * 20));
                    let pos = new Vector3(this.entity.getHeadLocation()).add(0, -1, 0);
                    targetPos.y = pos.y;
                    let dis = targetPos.distance(pos);
                    this.exEntity.shootProj("wb:god_of_guard_sword_s", {
                        "speed": dis / i / 20
                    }, targetPos.sub(pos).normalize(), pos);
                }
            }, 200);

            this.tryRangeAttack();
        }
    }
    timer!: TickDelayTask;
    attackTimer?: TickDelayTask;
    attackLiner?: ExTimeLine;
    skillBox: PomGodOfGuardSkillBox = new PomGodOfGuardSkillBox(this);
    tryRangeAttack() {
        this.skillBox.addMove();
        this.attackTimer?.stop();
        this.attackTimer = ExSystem.tickTask(this, () => {
            if (this.entity.target && this.exEntity.position.distance(this.entity.target?.location) < 32) {
                this.entity.playAnimation("animation.god_of_guard.staff_effect_only", {
                    "blendOutTime": 0.2
                });
                this.attackTimer?.stop();
                this.attackTimer = ExSystem.tickTask(this, () => {
                    this.skillBox.addRange();
                    this.skillBox.removeMove();
                    if (this.entity.target) {
                        let startPos = new Vector3(this.entity.getHeadLocation()).add(0, -1, 0).add(this.exEntity.viewDirection.scl(1));
                        let dic = new Vector3(this.entity.target.location).sub(startPos).normalize();
                        dic.y = 0;
                        // let mat1 = new Matrix4().idt().rotateY( 10/ 180 * Math.PI);
                        // let mat2 = new Matrix4().idt().rotateY(-10 / 180 * Math.PI);

                        // mat2.rmulVector(dic);
                        // for (let p = -1; p <= 1; p += 1) {
                        this.exEntity.shootProj("wb:god_of_guard_sword_s", {
                            "speed": 0.9
                        },
                            dic,
                            startPos
                        );
                        //     mat1.rmulVector(dic);
                        // }
                    }
                    this.attackTimer?.stop();
                    this.attackTimer = ExSystem.tickTask(this, () => {
                        this.skillBox.removeRange();
                        this.tryRangeAttack();
                    }).delay(20 * 1).startOnce();
                }).delay(20 * 1).startOnce();
            }
        }).delay(2).start();
    }
    get damageAmount() {
        return (30 + this.passive.getDamageWithoutConsume()) * (1 + this.passive.defense[0] / 10)
    }
    attack(r: number, angle: number) {
        let view = new Vector3(this.entity.getViewDirection());
        let q = new ExEntityQuery(this.entity.dimension).at(this.entity.location)
            .querySector(r, 4, view, 135, 0, {
                excludeFamilies: ["god_summoner"]
            })
            .except(this.entity)
            .except(this.bossOri.entity)
            .forEach(e => {
                e.applyDamage(this.damageAmount);
            });
        let arg = new MolangVariableMap();
        arg.setFloat("angle", angle);
        arg.setFloat("cent_angle", view.rotateAngleX());
        arg.setFloat("r", r);
        this.entity.dimension.spawnParticle("wb:god_of_guard_att", this.entity.location, arg);

        return q.getEntities();
    }
    tryMeleeAttack() {
        this.skillBox.addMelee();
        this.skillBox.addMove();
        this.attackTimer?.stop();
        this.attackTimer = ExSystem.tickTask(this, () => {
            if (this.entity.target && this.exEntity.position.distance(this.entity.target?.location) < 3) {
                this.skillBox.removeMove();
                this.skillBox.removeMelee();
                this.entity.playAnimation("animation.god_of_guard.melee_attack", {
                    "blendOutTime": 0.2
                });
                this.attackTimer?.stop();
                this.attackTimer = ExSystem.tickTask(this, () => {
                    this.attack(3, 45);
                    this.skillBox.forwords();
                    this.exEntity.shootProj("wb:god_of_guard_sword_s", {
                        "speed": 1.0
                    }, undefined, new Vector3(this.entity.getHeadLocation()).add(0, -1, 0));
                    this.attackTimer?.stop();
                    this.attackTimer = ExSystem.tickTask(this, () => {
                        this.tryMeleeAttack();
                    }).delay(20 * 0.55).startOnce();
                }).delay(20 * 0.9).startOnce();
            }
        }).delay(2).start();
    }
    get passive() { return this.bossOri.passive }
    constructor(public bossOri: PomGodOfGuardBoss2, spawn: boolean, e: Entity, server: PomServer) {
        super(e, server, spawn);
        //弹射加伤害
        this.getEvents().exEvents.afterEntityHitEntity.subscribe((e: EntityHurtAfterEvent) => {
            if (e.damageSource.cause == EntityDamageCause.projectile) {
                e.hurtEntity.applyDamage((30 + this.passive.getDamageWithoutConsume()) * (1 + this.passive.defense[0] / 10) - 30, {
                    "cause": EntityDamageCause.entityAttack,
                    "damagingEntity": this.entity
                });
            }
        });
    }

    override dispose(): void {
        super.dispose();
    }
    override onKilled(e: EntityDieAfterEvent): void {
        super.onKilled(e);
    }
    @registerEvent("afterOnHurt")
    onHurt(e: EntityHurtAfterEvent) {
        let damage = e.damage;
        if (e.damageSource.cause === EntityDamageCause.projectile) damage *= 0.2;


        if (e.damageSource.cause !== EntityDamageCause.selfDestruct && e.damageSource.cause !== EntityDamageCause.suicide)
            this.bossOri.entity.applyDamage(damage, {
                "cause": EntityDamageCause.charging,
                "damagingEntity": e.damageSource.damagingEntity
            });
    }


}

export class PomGodOfGuardBoss2 extends PomBossController {
    static typeId = "wb:god_of_guard_second";
    shadow?: PomGodOfGuardShadow;
    timer?: TickDelayTask;
    passive: PomGodOfGuardBossPassive;
    skillBox: PomGodOfGuardSkillBox = new PomGodOfGuardSkillBox(this);

    constructor(e: Entity, server: PomServer, spawn: boolean) {
        super(e, server, true);
        this.passive = new PomGodOfGuardBossPassive(this, 2);
    }
    override initBossEntity(): void {
        super.initBossEntity();
        let arr = new ExEntityQuery(this.entity.dimension).at(this.barrier.center).queryBox(this.barrier.area.calculateWidth(), {
            "type": "wb:god_of_guard_shadow"
        }).getEntities();
        if (arr.length == 0) {
            this.shadow = new PomGodOfGuardShadow(this, true,
                this.entity.dimension.spawnEntity("wb:god_of_guard_shadow", this.barrier.center),
                this.server as PomServer);
        }
        if (!this.shadow) {
            this.shadow = new PomGodOfGuardShadow(this, true, arr[0], this.server as PomServer);
        }
        //弹射加伤害
        this.getEvents().exEvents.afterEntityHitEntity.subscribe((e: EntityHurtAfterEvent) => {
            if (e.damageSource.cause == EntityDamageCause.projectile) {
                e.hurtEntity.applyDamage(this.passive.getDamage(), {
                    "cause": EntityDamageCause.entityAttack,
                    "damagingEntity": this.entity
                });
            }
        });
        this.changePos();
        this.timer?.stop();
        this.timer?.delay(20).startOnce();
    }
    changePos() {
        this.timer?.stop();
        this.timer = ExSystem.tickTask(this, () => {
            if (!this.shadow || this.shadow?.interrupt || this.interrupt) return;
            this.entity.dimension.spawnParticle("epic:sunlight_sword_particle2", this.entity.location);
            this.shadow.entity.dimension.spawnParticle("epic:sunlight_sword_particle2", this.shadow?.entity.location);
            this.timer?.stop();
            this.timer = ExSystem.tickTask(this, () => {
                if(!this.shadow) return;
                let pos1 = this.entity.location, pos2 = this.shadow?.entity.location;
                this.shadow?.entity.teleport(pos1);
                this.entity.teleport(pos2);

                if (this.skillBox.isMeleeState()) {
                    this.skillBox.setRangeState();
                    this.shadow?.skillBox.setMeleeState();
                } else {
                    this.skillBox.setMeleeState();
                    this.shadow?.skillBox.setRangeState();
                }

                this.skillBox.removeAll();
                this.shadow?.skillBox.removeAll();

                this.attackTimer?.stop();
                this.attackLiner?.stop();
                this.shadow?.attackTimer?.stop();
                this.shadow?.attackLiner?.stop();

                if (this.skillBox.state == PomGodOfGuard2State.Melee) {
                    this.entity.playAnimation("animation.god_of_guard.melee_skill_all", {
                        "blendOutTime": 0.2
                    });

                    let getSmooth = (time: number, timeAll: number, a: number, b: number) => {
                        return MathUtil.clamp(a + (b - a) * (-Math.pow(((time / timeAll) - 1), 2) + 1), a, b);
                    }
                    let startPos = new Vector3(this.entity.location);
                    let tmpV = new Vector3();
                    let targetFacing = new Vector3();
                    let target = new Vector3();
                    this.attackLiner = ExSystem.timeLine(this, {
                        "1.3": (time) => {
                            //起飞
                            time.registerTick("fly", (time, pastTime) => {
                                this.entity.teleport(tmpV.set(startPos).add(0, getSmooth(pastTime, 2.4 - 1.3, 0, 6), 0), {
                                    // "facingLocation": targetFacing
                                });
                            });
                        },
                        "2.4": (time) => {
                            targetFacing = new Vector3(ignorn(() => (this.entity.target?.location))
                                ?? Random.choice(Array.from(this.barrier.getPlayers())).location);
                            tmpV.set(startPos).sub(target).normalize().scl(2);
                            tmpV.y = 0.1;
                            target.set(tmpV.add(targetFacing));

                            //冲
                            time.cancelTick("fly");
                            time.registerTick("fly", (time, pastTime) => {
                                tmpV.set(startPos).add(0, 6, 0);
                                tmpV.set(
                                    getSmooth(pastTime, 3.04 - 2.4, tmpV.x, target.x),
                                    getSmooth(pastTime, 3.04 - 2.4, tmpV.y, target.y),
                                    getSmooth(pastTime, 3.04 - 2.4, tmpV.z, target.z)
                                )
                                this.entity.teleport(tmpV, {
                                    "facingLocation": targetFacing
                                });
                                new ExEntityQuery(this.entity.dimension).at(this.entity.location)
                                    .queryBall(2, {
                                        excludeFamilies: ["god_summoner"]
                                    })
                                    .except(this.entity)
                                    .except(this.shadow?.entity ?? this.entity)
                                    .forEach(e => {
                                        e.applyDamage(30);
                                    });
                            });
                        },
                        "3.04": () => {
                            //攻击
                            this.attack(6, 90)
                        },
                        "3.21": (time) => {
                            //落地
                            time.cancelTick("fly");
                        },
                        "4.13": () => {
                            this.attack(8, 120);
                            this.skillBox.forwords();
                        },
                        "4.7": () => {
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
                        this.runTimeout(() => {
                            this.exEntity.shootProj("wb:god_of_guard_sword_p", {
                                "speed": 0.9,
                                "delay": 0.8
                            }, tar);
                            mat1.rmulVector(tar);
                        }, p * 250);
                    }
                    this.tryRangeAttack();
                }
                this.shadow?.changeState();
                this.changePos();
            }).delay(2 * 20).startOnce();
        }).delay(20 * MathUtil.randomInteger(8, 13)).startOnce();
    }
    attack(r: number, angle: number) {
        let view = new Vector3(this.entity.getViewDirection());
        let q = new ExEntityQuery(this.entity.dimension).at(this.entity.location)
            .querySector(r, 4, view, angle, 0, {
                excludeFamilies: ["god_summoner"]
            })
            .except(this.entity)
            .except(this.shadow?.entity ?? this.entity)
            .forEach(e => {
                e.applyDamage(20 + this.passive.getDamage());
            });
        let arg = new MolangVariableMap();
        arg.setFloat("angle", angle);
        arg.setFloat("cent_angle", view.rotateAngleX());
        arg.setFloat("r", r);
        this.entity.dimension.spawnParticle("wb:god_of_guard_att", this.entity.location, arg);
        return q.getEntities();
    }

    attackTimer?: TickDelayTask;
    attackLiner?: ExTimeLine;
    tryMeleeAttack() {
        this.skillBox.addMelee();
        this.skillBox.addMove();
        this.attackTimer?.stop();
        this.attackTimer = ExSystem.tickTask(this, () => {
            if (this.entity.target && this.exEntity.position.distance(this.entity.target?.location) < 3) {
                this.skillBox.removeMove();
                this.skillBox.removeMelee();
                this.entity.playAnimation("animation.god_of_guard.melee_attack", {
                    "blendOutTime": 0.2
                });
                this.attackTimer?.stop();
                this.attackTimer = ExSystem.tickTask(this, () => {
                    const target = this.entity.target;
                    let listener = (e: EntityHurtAfterEvent) => {
                        if (e.damageSource.damagingEntity instanceof Player &&
                            this.exEntity.position.distance(e.damageSource.damagingEntity.location) < 5 &&
                            target == e.damageSource.damagingEntity) {
                            this.getEvents().exEvents.afterOnHurt.unsubscribe(listener);
                            for (let i = 0; i < 5; i++) this.passive.getDamage();
                            this.entity.dimension.spawnParticle("wb:god_of_guard_attack_breakdef_par", this.entity.location);
                        }
                    }
                    if (this.attack(5, 90).findIndex(e => e instanceof Player) === -1) {
                        this.getEvents().exEvents.afterOnHurt.subscribe(listener)
                        this.runTimeout(() => {
                            this.getEvents().exEvents.afterOnHurt.unsubscribe(listener)
                        }, 2000)
                    };
                    this.exEntity.shootProj("wb:god_of_guard_sword_p", {
                        "speed": 0.6,
                        "rotOffset": new Vector2(0, -30),
                        "delay": 0.8
                    });
                    this.exEntity.shootProj("wb:god_of_guard_sword_p", {
                        "speed": 0.6,
                        "delay": 0.8
                    });
                    this.exEntity.shootProj("wb:god_of_guard_sword_p", {
                        "speed": 0.6,
                        "rotOffset": new Vector2(0, 30),
                        "delay": 0.8
                    });
                    this.skillBox.forwords();
                    this.attackTimer?.stop();
                    this.attackTimer = ExSystem.tickTask(this, () => {
                        this.tryMeleeAttack();
                    }).delay(20 * 0.55).startOnce();
                }).delay(20 * 0.9).startOnce();
            }
        }).delay(2).start();
    }

    @registerEvent(ExOtherEventNames.onLongTick)
    keeper(e: TickEvent) {
        if (e.currentTick % 4 === 0) {
            if (!this.lazerState && !this.timer?.isStarted()) {
                console.warn("Warn: undef state");
                this.timer?.startOnce();
            }
        }
        if (ignorn(() => this.shadow?.entity.location) && this.shadow && !this.barrier.area.contains(this.shadow.entity.location)) {
            this.shadow?.exEntity.setPosition(this.barrier.area.center());
        }
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
        this.skillBox.addMove();
        this.attackTimer?.stop();
        this.attackTimer = ExSystem.tickTask(this, () => {
            if (this.entity.target && this.exEntity.position.distance(this.entity.target?.location) < 32) {
                this.entity.playAnimation("animation.god_of_guard.staff_effect_only", {
                    "blendOutTime": 0.2
                });
                this.attackTimer?.stop();
                this.attackTimer = ExSystem.tickTask(this, () => {
                    this.skillBox.addRange();
                    this.skillBox.removeMove();
                    if (this.entity.target) {
                        let startPos = new Vector3(this.entity.getHeadLocation()).add(0, 0, -1).add(this.exEntity.viewDirection.scl(1));
                        this.exEntity.shootProj("wb:god_of_guard_sword_p", {
                            "speed": 0.9,
                            "delay": 0.8
                        },
                            new Vector3(this.entity.target.location).add(0, 1, 0).sub(startPos).normalize(),
                            startPos
                        );
                        this.exEntity.shootProj("wb:god_of_guard_sword_p", {
                            "speed": 0.9,
                            "rotOffset": new Vector2(0, 40),
                            "delay": 0.8
                        },
                            new Vector3(this.entity.target.location).add(0, 1, 0).sub(startPos).normalize(),
                            startPos
                        );
                        this.exEntity.shootProj("wb:god_of_guard_sword_p", {
                            "speed": 0.9,
                            "rotOffset": new Vector2(0, -40),
                            "delay": 0.8
                        },
                            new Vector3(this.entity.target.location).add(0, 1, 0).sub(startPos).normalize(),
                            startPos
                        );
                    }
                    this.attackTimer?.stop();
                    this.attackTimer = ExSystem.tickTask(this, () => {
                        this.skillBox.removeRange();
                        this.tryRangeAttack();
                    }).delay(20 * 1).startOnce();
                }).delay(20 * 1).startOnce();
            }
        }).delay(2).start();
    }


    lazerState = false;
    tryLazerAttack() {
        this.timer?.stop();
        this.attackLiner?.stop();
        this.entity.teleport(this.barrier.center);
        this.skillBox.removeMove();
        this.skillBox.removeRange();
        this.skillBox.addMelee();

        this.shadow?.attackLiner?.stop();
        this.shadow?.attackTimer?.stop();

        this.lazerState = true;

        this.attackTimer?.stop();
        this.attackTimer = ExSystem.tickTask(this, () => {
            this.entity.dimension.spawnParticle("wb:god_of_guard_lazer_pre_par", this.entity.location);
            this.entity.playAnimation("animation.god_of_guard.staff_effect_only", {
                "blendOutTime": 0.2
            });
            let angle = Math.floor(Math.random() * 120) * 3;
            let numTotal = 360;
            let num = numTotal;
            this.attackTimer = ExSystem.tickTask(this, () => {
                for (let i = angle; i < 360 + angle; i += 72) {
                    this.skillBox.summonLazerPre(i)
                }
            }).delay(4).start();
            this.shadow?.skillBox.setMeleeState();
            this.shadow && (this.shadow.attackTimer = ExSystem.tickTask(this, () => {
                this.shadow?.tryStateSprint();
            }).delay(2.5 * 20).start());
            this.runTimeout(() => {
                this.passive.defense[0] = 20;
                this.entity.playAnimation("animation.god_of_guard.staff_effect_only", {
                    "blendOutTime": 0.2
                });

                this.attackTimer?.stop();

                this.attackTimer = ExSystem.tickTask(this, () => {
                    if (num > numTotal * 12 / 16) {
                        for (let i = angle; i < 360 + angle; i += 72) {
                            this.skillBox.summonLazer(i)
                        }
                    } else if (num > numTotal * 11 / 16) {
                        for (let i = angle; i < 360 + angle; i += 60) {
                            this.skillBox.summonLazerPre(i);
                        }
                    } else if (num > numTotal * 8 / 16) {
                        for (let i = angle; i < 360 + angle; i += 60) {
                            this.skillBox.summonLazer(i);
                        }
                    } else if (num > numTotal * 7 / 16) {
                        for (let i = angle + 45; i < 360 + angle + 45; i += 90) {
                            this.skillBox.summonLazerPre(i);
                        }
                    } else if (num > numTotal * 5 / 16) {
                        for (let i = angle + 45; i < 360 + angle + 45; i += 90) {
                            this.skillBox.summonLazer(i);
                        }
                    } else if (num > numTotal * 4 / 16) {
                        for (let i = angle; i < 360 + angle; i += 180) {
                            this.skillBox.summonLazerPre(i);
                        }
                    } else if (num > numTotal * 2 / 16) {
                        for (let i = angle; i < 360 + angle; i += 180) {
                            this.skillBox.summonLazer(i);
                        }
                    } else if (num > numTotal * 1 / 16) {
                        for (let i = angle + 45; i < 360 + angle + 45; i += 120) {
                            this.skillBox.summonLazerPre(i);
                        }
                    } else {
                        for (let i = angle + 45; i < 360 + angle + 45; i += 120) {
                            this.skillBox.summonLazer(i);
                        }
                    }
                    // this.summonLazer(angle);
                    angle += 1;
                    num -= 1;
                    if (num <= 0) {
                        this.attackTimer?.stop();
                        this.shadow?.attackTimer?.stop();
                        this.timer?.stop();
                        this.timer?.delay(20).startOnce();
                        this.lazerState = false;
                    }
                }).delay(1).start();
            }, 2 * 1000);
        }).delay(2 * 20).startOnce();

    }

    override onAppear(spawn: boolean): void {
        super.onAppear(spawn);
    }
    override onKilled(e: EntityDieAfterEvent): void {
        super.onKilled(e);
    }
    override onFail(): void {
        super.onFail();
    }
    override dispose(): void {
        this.attackTimer?.stop();
        this.timer?.stop();

        this.shadow?.attackTimer?.stop();
        this.shadow?.attackLiner?.stop();

        this.attackLiner?.stop();
        this.passive?.dispose();
        new ExEntityQuery(this.barrier.dim).at(this.barrier.center).queryBox(this.barrier.area.calculateWidth(), {
            "type": "wb:god_of_guard_shadow"
        }).getEntities().forEach(e => e.remove())
        super.dispose();
    }
}

export class PomGodOfGuardBossSword extends ExEntityController {
    longtick: (e: TickEvent) => void;
    constructor(e: Entity, server: PomServer, spawn: boolean, boss: PomGodOfGuardBoss3) {
        super(e, server, spawn);
        this.longtick = (e: TickEvent) => {
            if (e.currentTick % 4 === 0) {
                boss.passive.causeDamageToBoss(20);
            }
        }
        new ExEntityQuery(this.entity.dimension).at(this.entity.location)
            .queryBall(3, {
                "excludeFamilies": ["god"]
            }).forEach((p) => {
                p.applyDamage(200, { "cause": EntityDamageCause.magic, "damagingEntity": boss.entity });
                p.addEffect(MinecraftEffectTypes.Slowness, 20 * 3, { "amplifier": 5 });
            });
        this.getEvents().exEvents.onLongTick.subscribe(this.longtick);

    }
    override dispose(): void {
        this.getEvents().exEvents.onLongTick.unsubscribe(this.longtick);
    }
}


export class PomGodOfGuardBoss3 extends PomBossController {
    static typeId = "wb:god_of_guard_third";
    states: PomGodOfGuardBossStates;
    passive: PomGodOfGuardBossPassive;
    times = 0;
    skillBox: PomGodOfGuardSkillBox = new PomGodOfGuardSkillBox(this);
    attackLiner?: ExTimeLine;
    cycle?: () => void;
    constructor(e: Entity, server: PomServer, spawn: boolean) {
        super(e, server, spawn);
        this.states = new PomGodOfGuardBossStates(this);
        this.passive = new PomGodOfGuardBossPassive(this);

        //弹射加伤害
        this.getEvents().exEvents.afterEntityHitEntity.subscribe((e: EntityHurtAfterEvent) => {
            if (e.damageSource.cause == EntityDamageCause.projectile) {
                e.hurtEntity.applyDamage(this.damageAmount, {
                    "cause": EntityDamageCause.entityAttack,
                    "damagingEntity": this.entity
                });

            }
        });
        this.cycle = () => this.waitContext(this.act()).then(() => {
            return this.sleep(20);
        }).then(() => {
            return this.cycle?.();
        });
        this.cycle();
    }
    tmpV = new Vector3();
    act() {
        let actions = [
            async () => {
                await this.sprint(this.getRandomPos());
                await this.skipWithAttackHeavy(this.getTargetPos);
                await this.waitContext(this.sprint(this.getRandomPos()));
                this.summonBullet();
                let pos = this.getRandomPos();
                await this.waitContext(this.summonLazer(pos, this.getTargetPos().sub(pos)));
            },
            async () => {
                await this.sprint(this.getRandomPos())
                await this.sprint(this.getTargetPos(4));
                this.useBigSword();
                await this.sprint(this.getTargetPos(4));
                this.useBigSword();
                await this.sprint(this.getRandomPos());
                this.summonBullet();
                let pos = this.getRandomPos();
                await this.summonLazer(pos, this.getTargetPos().sub(pos), 5);
            },
            async () => {
                await this.sprint(this.getRandomPos());
                await this.skipWithAttackHeavy(this.getTargetPos);
                await this.summonBullet();
                this.useBigSword();
                await this.summonBullet();
                this.useBigSword();

                for (let i = 0; i < 2; i++) {
                    if (this.getTargetPos().distance(this.entity.location) < 6) {
                        await this.waitContext(this.normalAttack());
                    } else {
                        await this.waitContext(this.skipWithAttackHeavy(this.getTargetPos));
                    }
                }
            },
            async () => {
                await this.sprint(this.getRandomPos());
                this.useBigSword();
                await this.skipWithAttackHeavy(this.getTargetPos);
                for (let i = 0; i < 2; i++) {
                    if (this.getTargetPos().distance(this.entity.location) < 6) {
                        await this.normalAttack();
                    } else {
                        await this.skipWithAttackHeavy(this.getTargetPos);
                    }
                }
            }
        ];
        return Random.choice(actions)()
    }
    getTargetPos(offset: number = 0) {
        return new Vector3(ignorn(() => (this.entity.target?.location)) ?? Random.choice(Array.from(this.barrier.getPlayers())).location)
            .add(random.randDouble(-offset, offset), 0, random.randDouble(-offset, offset));
    }
    getRandomPos() {
        let v = ExBlockArea.randomPoint([this.barrier.area], 28);
        v.y = this.entity.location.y;
        return v;
    }
    override initBossEntity(): void {
        super.initBossEntity();
        let loc;
        new ExEntityQuery(this.entity.dimension).at(this.barrier.center).queryBox(this.barrier.area.calculateWidth(), {
            "type": "wb:god_of_guard_shadow"
        }).forEach((e) => { loc = e.location; e.remove(); });

        this.entity.dimension.createExplosion(this.entity.location, 10, {
            "breaksBlocks": false,
            "causesFire": false,
            "source": this.entity
        });
        this.entity.dimension.spawnParticle("wb:blast_par_small", new Vector3(this.entity.location).add(0, 1, 0));
        if (loc) {
            this.entity.dimension.createExplosion(loc, 10, {
                "breaksBlocks": false,
                "causesFire": false,
                "source": this.entity
            });
            this.entity.dimension.spawnParticle("wb:blast_par_small", new Vector3(loc).add(0, 1, 0));
        }
    }
    override onAppear(spawn: boolean): void {
        super.onAppear(spawn);
    }
    override onKilled(e: EntityDieAfterEvent): void {
        this.passive.dispose();
        super.onWin();
        this.server.say({ rawtext: [{ translate: "text.wb:defeat_god_of_guard.name" }] });
        super.onKilled(e);
    }
    override onFail(): void {
        this.passive.dispose();
        super.onFail();
    }

    listenForBreak(en: Entity[]) {
        if (en.findIndex(e => e instanceof Player) === -1) {
            const target = this.entity.target;
            let listener = (e: EntityHurtAfterEvent) => {
                if (e.damageSource.damagingEntity instanceof Player &&
                    this.exEntity.position.distance(e.damageSource.damagingEntity.location) < 5 &&
                    target == e.damageSource.damagingEntity) {
                    this.getEvents().exEvents.afterOnHurt.unsubscribe(listener);
                    for (let i = 0; i < 5; i++) this.passive.getDamage();
                    this.entity.dimension.spawnParticle("wb:god_of_guard_attack_breakdef_par", this.entity.location);
                }
            }
            this.getEvents().exEvents.afterOnHurt.subscribe(listener)
            this.runTimeout(() => {
                this.getEvents().exEvents.afterOnHurt.unsubscribe(listener)
            }, 2000);
        }
    }

    skillTimer?: TickDelayTask;
    normalAttack() {
        return new Promise<void>(resolve => {
            this.skillBox.removeRange();
            this.skillBox.addMelee();
            this.skillBox.addMove();
            this.skillBox.setMeleeState();
            this.skillTimer?.stop();
            this.skillTimer = ExSystem.tickTask(this, () => {
                if (this.entity.target && this.exEntity.position.distance(this.entity.target?.location) < 6) {
                    this.skillBox.removeMove();
                    this.skillBox.removeMelee();
                    this.entity.playAnimation("animation.god_of_guard.melee_attack", {
                        "blendOutTime": 0.2
                    });
                    this.skillTimer?.stop();
                    this.skillTimer = ExSystem.tickTask(this, () => {
                        this.listenForBreak(this.attack(15, 90));
                        this.exEntity.shootProj("wb:god_of_guard_sword_s", {
                            "speed": 1.0
                        }, undefined, new Vector3(this.entity.getHeadLocation()).add(0, -1, 0));
                        this.skillBox.forwords();
                        this.skillTimer?.stop();
                        this.skillTimer = ExSystem.tickTask(this, () => {
                            resolve();
                        }).delay(20 * 0.55).startOnce();
                    }).delay(20 * 0.9).startOnce();
                } else {
                    resolve();
                }
            }).delay(2).start();
        });
    }
    async useBigSword() {
        let entities: Entity[] = [];
        let start = this.exEntity.position;
        let tar = this.getTargetPos();
        tar.y = start.y;
        let step = tar.cpy().sub(start).normalize();
        (async () => {
            for (let i = 0; i <= Math.max(36, tar.cpy().sub(start).x / step.x); i++) {
                start.add(step);
                let e = this.entity.dimension.spawnEntity("wb:god_of_guard_big_sword", start, {
                    "initialPersistence": true
                });
                entities.push(e);
                e.setRotation({
                    "x": 0,
                    "y": i % 2 == 0 ? 0 : 180
                });
                await this.sleep(1);
            }
        })();
        return (async () => {
            await this.sleep(40);
            for (let i = 0; i < entities.length; i++) {
                new ExEntityQuery(this.entity.dimension).at(entities[i].location)
                    .queryBall(3, {
                        "excludeFamilies": ["god"]
                    }).forEach((p) => {
                        p.applyDamage(this.damageAmount + 50, {
                            "cause": EntityDamageCause.entityAttack,
                            "damagingEntity": this.entity
                        });
                        p.addEffect(MinecraftEffectTypes.Slowness, 20 * 3, { "amplifier": 5 });
                    });
                await this.sleep(1);
            }
            let swordCtrl = new PomGodOfGuardBossSword(this.entity.dimension.spawnEntity("wb:god_of_guard_big_sword", tar, {
                "initialPersistence": true
            }), this.server as PomServer, true, this);
            swordCtrl.entity.triggerEvent("scale");
        })();
    }

    skipWithAttack(targetLocGetter: () => Vector3) {
        return new Promise<void>(resolve => {
            this.skillBox.setMeleeState();
            this.skillBox.removeAll();
            this.entity.playAnimation("animation.god_of_guard.melee_attack_continuily", {
                "blendOutTime": 0.2
            });
            let getSmooth = (time: number, timeAll: number, a: number, b: number) => {
                return MathUtil.clamp(a + (b - a) * (-Math.pow(((time / timeAll) - 1), 2) + 1), a, b);
            }
            let startPos = new Vector3(this.entity.location);
            let tmpV = new Vector3();
            let targetFacing = new Vector3();
            let target = new Vector3();
            this.attackLiner = ExSystem.timeLine(this, {
                "0.0": (time) => {
                    //起飞
                    time.registerTick("fly", (time, pastTime) => {
                        this.entity.teleport(tmpV.set(startPos).add(0, getSmooth(pastTime, 0.25, 0, 0.5), 0), {
                            // "facingLocation": targetFacing
                        });
                    });
                },
                "0.25": (time) => {
                    targetFacing = targetLocGetter.call(this);
                    tmpV.set(startPos).sub(target).normalize().scl(2);
                    tmpV.y = 0.1;
                    target.set(tmpV.add(targetFacing));

                    //冲
                    time.cancelTick("fly");
                    time.registerTick("fly", (time, pastTime) => {
                        tmpV.set(startPos).add(0, 6, 0);
                        tmpV.set(
                            getSmooth(pastTime, 0.71 - 0.25, tmpV.x, target.x),
                            getSmooth(pastTime, 0.71 - 0.25, tmpV.y, target.y),
                            getSmooth(pastTime, 0.71 - 0.25, tmpV.z, target.z)
                        )
                        this.entity.teleport(tmpV, {
                            "facingLocation": targetFacing
                        });
                        new ExEntityQuery(this.entity.dimension).at(this.entity.location)
                            .queryBall(2, {
                                excludeFamilies: ["god_summoner"]
                            })
                            .except(this.entity)
                            .forEach(e => {
                                e.applyDamage(30);
                            });
                    });
                },
                "0.71": () => {
                    //攻击
                    this.attack(8, 90)
                },
                "0.85": (time) => {
                    //落地
                    time.cancelTick("fly");
                },
                "1.71": () => {
                    this.listenForBreak(this.attack(8, 100));
                    this.skillBox.forwords();
                },
                "2.08": () => {
                    resolve();
                }
            }).start();
        });
    }
    skipWithAttackHeavy(targetLocGetter: () => Vector3) {
        this.skillBox.setMeleeState();
        this.skillBox.removeAll();
        return new Promise<void>(resolve => {
            this.entity.playAnimation("animation.god_of_guard.melee_skill_all", {
                "blendOutTime": 0.2
            });
            let getSmooth = (time: number, timeAll: number, a: number, b: number) => {
                return MathUtil.clamp(a + (b - a) * (-Math.pow(((time / timeAll) - 1), 2) + 1), a, b);
            }
            let startPos = new Vector3(this.entity.location);
            let tmpV = new Vector3();
            let targetFacing = new Vector3();
            let target = new Vector3();
            this.attackLiner = ExSystem.timeLine(this, {
                "1.3": (time) => {
                    //起飞
                    time.registerTick("fly", (time, pastTime) => {
                        this.entity.teleport(tmpV.set(startPos).add(0, getSmooth(pastTime, 2.4 - 1.3, 0, 6), 0), {
                            // "facingLocation": targetFacing
                        });
                    });
                },
                "2.4": (time) => {
                    targetFacing = targetLocGetter.call(this);
                    tmpV.set(startPos).sub(target).normalize().scl(2);
                    tmpV.y = 0.1;
                    target.set(tmpV.add(targetFacing));

                    //冲
                    time.cancelTick("fly");
                    time.registerTick("fly", (time, pastTime) => {
                        tmpV.set(startPos).add(0, 6, 0);
                        tmpV.set(
                            getSmooth(pastTime, 3.04 - 2.4, tmpV.x, target.x),
                            getSmooth(pastTime, 3.04 - 2.4, tmpV.y, target.y),
                            getSmooth(pastTime, 3.04 - 2.4, tmpV.z, target.z)
                        )
                        this.entity.teleport(tmpV, {
                            "facingLocation": targetFacing
                        });
                        new ExEntityQuery(this.entity.dimension).at(this.entity.location)
                            .queryBall(2, {
                                excludeFamilies: ["god_summoner"]
                            })
                            .except(this.entity)
                            .forEach(e => {
                                e.applyDamage(this.damageAmount);
                            });

                    });
                },
                "3.04": () => {
                    //攻击
                    this.attack(8, 80)
                },
                "3.21": (time) => {
                    //落地
                    time.cancelTick("fly");
                },
                "4.13": () => {
                    this.listenForBreak(this.attack(10, 90));
                    this.skillBox.forwords();
                },
                "4.7": () => {
                    resolve();
                }
            }).start();
        });
    }
    attack(r: number, angle: number) {
        let view = new Vector3(this.entity.getViewDirection());
        let q = new ExEntityQuery(this.entity.dimension).at(this.entity.location)
            .querySector(r, 4, view, angle, 0, {
                excludeFamilies: ["god_summoner"]
            })
            .except(this.entity)
            .forEach(e => {
                e.applyDamage(30 + this.passive.getDamage());
            });
        let arg = new MolangVariableMap();
        arg.setFloat("angle", angle);
        arg.setFloat("cent_angle", view.rotateAngleX());
        arg.setFloat("r", r);
        this.entity.dimension.spawnParticle("wb:god_of_guard_att", this.entity.location, arg);
        return q.getEntities();
    }
    summonLazer(pos: Vector3, dic: Vector3, lazerNum = 3) {
        this.skillBox.setRangeState();

        return new Promise<void>((resolve, reject) => {
            this.skillBox.removeAll();
            this.exEntity.position = pos;
            this.exEntity.viewDirection = dic;

            this.skillTimer?.stop();
            this.skillTimer = ExSystem.tickTask(this, () => {
                this.entity.dimension.spawnParticle("wb:god_of_guard_lazer_pre_par", this.entity.location);
                this.entity.playAnimation("animation.god_of_guard.staff_effect_only", {
                    "blendOutTime": 0.2
                });
                let numTotal = 20 * 2;
                let num = numTotal;
                this.skillTimer?.stop();
                this.skillTimer = ExSystem.tickTask(this, () => {
                    this.skillBox.summonLazerPre(i);
                    this.skillBox.summonLazerPre(i + 30);
                    this.skillBox.summonLazerPre(i - 30);
                    this.skillBox.summonLazerPre(180 + i);
                    this.skillBox.summonLazerPre(180 + i + 30);
                    this.skillBox.summonLazerPre(180 + i - 30);
                    if (lazerNum == 5) {
                        this.skillBox.summonLazerPre(i + 60);
                        this.skillBox.summonLazerPre(i - 60);
                        this.skillBox.summonLazerPre(180 + i + 60);
                        this.skillBox.summonLazerPre(180 + i - 60);
                    }
                }).delay(4).start();
                const i = dic.rotateAngleX();
                this.runTimeout(() => {
                    this.entity.playAnimation("animation.god_of_guard.staff_effect_only", {
                        "blendOutTime": 0.2
                    });
                    this.skillTimer?.stop();
                    this.skillTimer = ExSystem.tickTask(this, () => {
                        this.skillBox.summonLazer(i);
                        this.skillBox.summonLazer(180 + i);
                        this.skillBox.summonLazer(i + 30);
                        this.skillBox.summonLazer(i - 30);
                        this.skillBox.summonLazer(180 + i + 30);
                        this.skillBox.summonLazer(180 + i - 30);
                        if (lazerNum == 5) {
                            this.skillBox.summonLazer(i + 60);
                            this.skillBox.summonLazer(i - 60);
                            this.skillBox.summonLazer(180 + i + 60);
                            this.skillBox.summonLazer(180 + i - 60);
                        }
                        num -= 1;
                        if (num <= 0) {
                            this.skillTimer?.stop();
                            resolve();
                        }
                    }).delay(1).start();
                }, 2 * 1000);
            }).delay(2 * 20).startOnce();
        });
    }
    summonBullet() {
        return new Promise<void>((resolve) => {
            this.skillBox.removeAll();
            this.skillBox.addMelee();
            this.skillBox.setRangeState();
            this.entity.playAnimation("animation.god_of_guard.staff_effect", {
                "blendOutTime": 0.2
            });
            let normal = [
                // PomGodOfGuardBossState1,
                // PomGodOfGuardBossState2,
                // PomGodOfGuardBossState3,
                // PomGodOfGuardBossState5,
                // PomGodOfGuardBossState6,
                // PomGodOfGuardBossState7,
                // PomGodOfGuardBossState9,
                // PomGodOfGuardBossState10
                PomGodOfGuardBossState11,
                PomGodOfGuardBossState12,
                PomGodOfGuardBossState13,
                PomGodOfGuardBossState14,
                PomGodOfGuardBossState15,
                PomGodOfGuardBossState16,
                PomGodOfGuardBossState17
            ];

            let hard = [
                // PomGodOfGuardBossState4,
                // PomGodOfGuardBossState8,
                // PomGodOfGuardBossState12
            ];

            if (this.states.isAvailable()) {
                let choice = Random.choice(normal);
                this.states.set(choice, this.passive.getDamage());
                this.states.listenOnExit(() => {
                    resolve();
                });
            };
        });
    }
    sprint(target: Vector3) {
        return new Promise<void>(resolve => {
            this.skillBox.removeAll();
            this.skillBox.addMelee();
            this.skillBox.setMeleeState();
            this.entity.playAnimation("animation.god_of_guard.shadow_melee_skill");
            let getSmooth = (time: number, timeAll: number, a: number, b: number) => {
                return MathUtil.clamp(a + (b - a) * (-Math.pow(((time / timeAll) - 1), 2) + 1), a, b);
            }
            let startPos = new Vector3(this.entity.location);
            let tmpV = new Vector3();

            target = target.cpy().sub(startPos).normalize().scl(7).add(target).add((Math.random() - 1) * 2, 0, (Math.random() - 1) * 2);

            target.y = startPos.y;

            tmpV.set(target).sub(startPos);
            let rot = new Vector2(tmpV.rotateAngleY(), tmpV.rotateAngleX())
            let dic = new Vector3(target).sub(startPos).normalize();

            this.attackLiner?.stop();
            this.attackLiner = ExSystem.timeLine(this, {
                "0.0": (time) => {
                    time.registerTick("fly", (time, pastTime) => {
                        this.entity.teleport(startPos.add(dic.scl(0.1)), {
                            facingLocation: target
                        });
                    });
                },
                "1.05": (time) => {
                    time.cancelTick("fly")
                    time.registerTick("fly", (time, pastTime) => {
                        tmpV.set(
                            getSmooth(pastTime, 1.75 - 1.05, startPos.x, target.x),
                            getSmooth(pastTime, 1.75 - 1.05, startPos.y, target.y),
                            getSmooth(pastTime, 1.75 - 1.05, startPos.z, target.z)
                        )
                        this.entity.teleport(tmpV, {
                            "facingLocation": target
                        });
                        new ExEntityQuery(this.entity.dimension).at(this.entity.location)
                            .queryBall(2, {
                                excludeFamilies: ["god_summoner"]
                            })
                            .except(this.entity)
                            .forEach(e => {
                                e.applyDamage(this.damageAmount);
                            });
                    });
                },
                "1.75": (time) => {
                    time.cancelTick("fly")
                    resolve();
                }
            }).start();
        });
    }
    get damageAmount() {
        return (30 + this.passive.getDamageWithoutConsume()) * (1 + this.passive.defense[0] / 10)
    }


    @registerEvent("onLongTick")
    onLongTick(e: TickEvent) {

    }


    @registerEvent("tick")
    onTick(e: TickEvent) {
        this.states.onTick(e);
    }
    override dispose(): void {
        super.dispose();
        this.attackLiner?.dispose();
        this.skillTimer?.dispose();
        this.cycle = undefined;
    }

}



export class PomGodOfGuardBossPassive implements DisposeAble {
    defense: [number, number] = [0, 0];
    listener: (e: EntityHurtAfterEvent) => void;
    nextText: [keyof langType | undefined, number | string][];
    skipper: (e: TickEvent) => void;
    playerSkipperData: Map<Player, [number[], number]> = new Map();
    healthReduce = 0;
    passiveShower: (e: TickEvent) => void;

    constructor(public ctrl: PomBossController, public state = 1) {
        this.listener = (e) => {
            if (e.hurtEntity instanceof Player && e.damageSource.damagingEntity == ctrl.entity) {
                if (e.damage > 100000) return;
                if (this.ctrl.barrier.players.has(e.hurtEntity)) {
                    ctrl.exEntity.addHealth(ctrl, e.damage);
                }
            }
            if (ctrl.entity == e.hurtEntity) {
                if (e.damageSource.cause !== EntityDamageCause.charging) {
                    ctrl.exEntity.addHealth(ctrl, e.damage * (this.defense[0] / 20));
                    if (state == 1) {
                        this.causeDamageToBoss(e.damage);
                    } else {
                        this.causeDamageToBoss(e.damage - (ctrl.exEntity.getPreRemoveHealth() ?? 0));
                    }
                    this.healthReduce += e.damage + (ctrl.exEntity.getPreRemoveHealth() ?? 0);
                } else {
                    this.causeDamageToBoss(e.damage);
                    this.healthReduce += e.damage;
                }
            }
        }
        this.nextText = [[undefined, 0], [undefined, 0]]
        this.ctrl.server.getEvents().events.afterEntityHurt.subscribe(this.listener);

        this.passiveShower = (e) => {
            for (let p of ctrl.barrier.clientsByPlayer()) {
                p.magicSystem.setActionbarByPass("godofguard", this.nextText.map(t => format(p.lang[t[0] ? t[0] : "unknown"], t[1])));
            }
        }

        for (let p of ctrl.barrier.getPlayers()) {
            this.playerSkipperData.set(p, [new Array<number>(15).fill(0), 0])
        }
        this.skipper = (e: TickEvent) => {
            if (e.currentTick % 4 === 0) {
                for (let p of ctrl.barrier.getPlayers()) {
                    let loc = new Vector3(p.location);
                    let under = ignorn(() => ctrl.entity.dimension.getBlock(loc.sub(0, 1, 0)));
                    let getter = this.playerSkipperData.get(p)!;
                    if (p.getGameMode() === GameMode.creative) continue;
                    getter[1] -= getter[0].shift()!;
                    getter[0].push(
                        (under?.typeId === "minecraft:air" ? 1 : 0) +
                        ((under = ignorn(() => under?.below(1)))?.typeId === "minecraft:air" ? 1 : 0) +
                        ((under = ignorn(() => under?.below(1)))?.typeId === "minecraft:air" ? 1 : 0) +
                        ((under = ignorn(() => under?.below(1)))?.typeId === "minecraft:air" ? 1 : 0)
                    );
                    getter[1] += getter[0][14];
                    if (ExPlayer.getInstance(p).getBag().itemOnMainHand?.typeId === MinecraftItemTypes.Shield) {
                        ExPlayer.getInstance(p).getBag().itemOnMainHand = undefined;
                    }
                    if (ExPlayer.getInstance(p).getBag().itemOnOffHand?.typeId === MinecraftItemTypes.Shield) {
                        ExPlayer.getInstance(p).getBag().itemOnOffHand = undefined;
                    }
                }

            }
        }
        ctrl.getEvents().exEvents.onLongTick.subscribe(this.skipper);
        ctrl.getEvents().exEvents.onLongTick.subscribe(this.passiveShower);
        // ctrl.getEvents().exEvents.afterEntityHitEntity.subscribe(this.sheidBreaker);

    }


    causeDamageToBoss(damage: number) {
        this.defense[1] += damage;
        this.defense[0] = Math.min(20, this.defense[0] + 1);
        this.upDateInf();
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
        this.ctrl.getEvents().exEvents.onLongTick.unsubscribe(this.passiveShower);
        // this.ctrl.getEvents().exEvents.afterEntityHitEntity.unsubscribe(this.sheidBreaker);


        for (let p of this.ctrl.barrier.clientsByPlayer()) {
            p.magicSystem.deleteActionbarPass("godofguard");
        }
    }
    upDateInf() {
        let d = this.defense[1] / this.defense[0];
        this.nextText[0] = ["extraCountererDamage", d.toFixed(2)];
        this.nextText[1] = ["defenseLayer", this.defense[0]];
    }
    getDamage() {
        if (this.defense[0] > 0) {
            this.upDateInf();
            let d = this.defense[1] / this.defense[0];

            this.defense[0] = Math.max(0, this.defense[0] - 1);
            this.defense[1] -= d;
            return 20 + (d ?? 0);
        } else {
            this.nextText[0] = ["extraCountererDamage", 0];
            this.nextText[1] = ["defenseLayer", 0];
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
        ignorn(() => this.dimension.spawnParticle("wb:ruin_desert_boss_shoot" + parStyle + "_par", this.center, map));
    }
    judgeHurt(pos: IVector3, pastTime: number) {
        let boxR = 0.6;
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