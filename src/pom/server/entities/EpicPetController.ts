import { Entity, EntityHurtAfterEvent, EntityDamageCause, EntityDieAfterEvent, Player, EntityHealthChangedAfterEvent, EntityQueryOptions } from '@minecraft/server';
import ExEntityController from '../../../modules/exmc/server/entity/ExEntityController.js';
import PomBossBarrier from './barrier/PomBossBarrier.js';
import { ExBlockArea } from '../../../modules/exmc/server/block/ExBlockArea.js';
import PomServer from '../PomServer.js';
import Vector3 from '../../../modules/exmc/utils/math/Vector3.js';
import ExGameServer from '../../../modules/exmc/server/ExGameServer.js';
import TickDelayTask from '../../../modules/exmc/utils/TickDelayTask.js';
import ExSystem from '../../../modules/exmc/utils/ExSystem.js';
import { registerEvent } from '../../../modules/exmc/server/events/eventDecoratorFactory.js';
import { ExOtherEventNames, TickEvent } from '../../../modules/exmc/server/events/events.js';
import ExEntityQuery from '../../../modules/exmc/server/env/ExEntityQuery.js';
import ExEntity from '../../../modules/exmc/server/entity/ExEntity';

export default class EpicPetController extends ExEntityController {
    static typeId = "epic:tesla_tower";
    constructor(e: Entity, server: PomServer, spawn: boolean) {
        super(e, server, spawn);
    }
    private _owner: Player | undefined = undefined;
    public tameable = this.entity.getComponent("tameable")
    public tickNum: number = 0;
    public target: Entity | undefined = undefined
    shoot_offset: Vector3 = new Vector3(0,1.75,0)
    
    target_list: EntityQueryOptions = 
    {
        excludeTags:["wbmsyh"],
        excludeTypes: ["item"],
        families:["monster"],
        closest: 1
    }

    setOwner(owner: Player): void{
        this._owner = owner
    }

    getJsonTarget(): void{
        this.target = this.entity.target
    }

    addTame(player : Player): void{
        if (this.tameable)
            this.tameable.tame(player)
        if (this.tameable?.tamedToPlayer)
        this.setOwner(this.tameable?.tamedToPlayer)
    }
    getOwner(): Player | undefined {
        return this.tameable?.tamedToPlayer
    }

    override onAppear(spawn: boolean): void {
        this.entity.runCommand("/say 启动")
        super.onAppear(spawn);
    }
    
    @registerEvent("onLongTick")
    onLongTick(e: TickEvent) {
        this.tickNum++
        this.getJsonTarget()
        if (e.currentTick % 4 == 0 && this.target) {
            this.electric_shock(this.entity,this.target)
            this.chain_target(this.target,3)
        }
    }

    lockTarget(): void {
        if (this.findTarget()){
            this.target = this.findTarget()[0]
        }
        else 
            this.target = undefined
            this.findTarget()
    }

    electric_shock(attacker: Entity , target: Entity): void{
        target.applyDamage(10,{
            "cause":EntityDamageCause.magic,
            "damagingEntity": attacker
        })
        let from = new Vector3(attacker.location)
        from.y += this.shoot_offset.y
        let to = new Vector3(target.location)
        to.y += 1
        this.entity.dimension.playSound("epic.tesla.attack",from)
        this.lightning_par(from,to)
    }

    chain_shock(attacker: Entity, from: Entity , to: Entity): void{
        to.applyDamage(5,{
            "cause":EntityDamageCause.magic,
            "damagingEntity": attacker
        })
            let f = new Vector3(from.location)
            f.y += 1
            let t = new Vector3(to.location)
            t.y += 1
            this.entity.dimension.playSound("epic.lightning_chain.zap",t)
            this.lightning_par(f,t)
    }

    chain_target(mainTarget: Entity , maxCount: number): void{
        if(!mainTarget){
            return
        }
        const hitEntities: Entity[] = [mainTarget];
        const tag: string = "Selected" + Math.floor(Math.random() * 10000).toString().padStart(4, '0')//辨识码
        const select_data: EntityQueryOptions = 
        {
            excludeTags:["wbmsyh",tag],
            excludeTypes: ["item"],
            families:["monster"],
            closest: 1
        }
        try {
            mainTarget.addTag(tag);
            // mainTarget.runCommand("/say "+ tag)
        } 
        catch (error) {
        }
        let currentTarget: Entity = mainTarget;
            
        for (let i = 0; i < maxCount; i++) {
            let from = new Vector3(currentTarget.location)
            let q = this.rangeCircle(currentTarget,from,3,3,0,select_data)
            if (q.length < 1)
                break
            currentTarget = q[0]
            currentTarget.addTag(tag)
            hitEntities.push(currentTarget)
        }
        if (hitEntities.length < 2)
            return
        for (let i = 0; i < hitEntities.length-1; i++){
            this.runTimeout(() => {
                this.chain_shock(this.entity,hitEntities[i], hitEntities[i+1])
            }, (i+1) * 200);
        }

        for (const entity of hitEntities) {
            try {
                entity.removeTag(tag);
         } catch (error) {}
        }
    }

    lightning_par(from: Vector3 , to: Vector3): void{
        let points = this.lightning_par_point(from,to)
        for (const i of points) {
            this.entity.dimension.spawnParticle("epic:lightning_chain_particle",i)
        }
    }
    

    lightning_par_point(from: Vector3, to: Vector3, distance = 0.1, maxOffset = 2, points: Vector3[] = []): Vector3[] {
    // 计算起点和终点之间的距离
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dz = to.z - from.z;
    const dist = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);

    // 如果距离小于最小分段距离，直接添加终点并返回
    if (dist <= distance) {
        points.push(to);
        return points;
    }

    // 计算中点
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const midZ = (from.z + to.z) / 2;

    // 生成随机偏移（方向和幅度）
    const offsetX = (Math.random() - 0.5) * maxOffset;
    const offsetY = (Math.random() - 0.5) * maxOffset;
    const offsetZ = (Math.random() - 0.5) * maxOffset;

    // 应用偏移后的中点
    const midXWithOffset = midX + offsetX;
    const midYWithOffset = midY + offsetY;
    const midZWithOffset = midZ + offsetZ;

    // 递归处理左右两段
    this.lightning_par_point(
        from,
        new Vector3(midXWithOffset, midYWithOffset, midZWithOffset),
        distance,
        maxOffset * 0.5,
        points
    );
    this.lightning_par_point(
        new Vector3(midXWithOffset, midYWithOffset, midZWithOffset),
        to,
        distance,
        maxOffset * 0.5,
        points
    );

    return points;
}

    findTarget(): Entity[] {
        let e = this.entity
        let loc = new Vector3(this.entity.location)
        let data = this.target_list
        let t = this.rangeCircle(this.entity,loc,16,8,0,data)
        return t ?? []
    } 

    rangeCircle(user : Entity , point : Vector3, r : number, h : number , dis : number , data : EntityQueryOptions) {
          let view = new Vector3(user.getViewDirection());
          let q = new ExEntityQuery(user.dimension)
              .at(point)
              .facingByDirection(view,dis) 
              .queryCircle(r, h,data)
              .except(user)
              
          return q.getEntities();
       }

    }
