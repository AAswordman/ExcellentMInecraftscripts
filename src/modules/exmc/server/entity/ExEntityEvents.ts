import { PlayerBreakBlockAfterEvent, Entity, EntityHurtAfterEvent, ItemStack, Player, EntityRemoveAfterEvent, EntityDieAfterEvent, EntityLoadAfterEvent, EntityRemoveBeforeEvent } from "@minecraft/server";
import ExEventManager from "../../interface/ExEventManager.js";
import TickDelayTask from "../../utils/TickDelayTask.js";
import ExGameServer from '../ExGameServer.js';
import ExPlayer from '../entity/ExPlayer.js';
import EventHandle, { EventListenerSettings } from "../events/EventHandle.js";
import { ExEventNames, ExOtherEventNames, ItemOnHandChangeEvent, TickEvent } from "../events/events.js";
import ExEntityController from "./ExEntityController.js";
import { falseIfError } from "../../utils/tool.js";
import ExEntityPool from "./ExEntityPool.js";
import MonitorManager from "../../utils/MonitorManager.js";
export default class ExEntityEvents implements ExEventManager {

    public static eventHandlers: EventHandle<ExEntityEvents["exEvents"]> = new EventHandle();
    monitorMapBackup: { [event: string]: MonitorManager<unknown> } = {

    }

    _subscribe(arg0: string, callback: (arg: any) => void) {
        ExEntityEvents.eventHandlers.subscribe(this._ctrl.entity, arg0, callback);
    }
    _unsubscribe(arg0: string, callback: (arg: any) => void) {
        ExEntityEvents.eventHandlers.unsubscribe(this._ctrl.entity, arg0, callback);
    }
    cancelAll() {
        ExEntityEvents.eventHandlers.unsubscribeAll(this._ctrl.entity);
    }

    _ctrl: ExEntityController;

    static exEventSetting: EventListenerSettings<ExEntityEvents["exEvents"]> = {
        [ExEventNames.beforeItemUse]: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "source"
            }
        },
        [ExEventNames.afterItemUse]: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "source"
            }
        },
        [ExOtherEventNames.tick]: {
            pattern: (registerName: string, k: string) => {}
        },
        [ExOtherEventNames.beforeTick]: {
            pattern: (registerName: string, k: string) => {}
        },
        [ExEventNames.afterEntityHitBlock]: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "entity"
            }
        },
        [ExEventNames.afterEntityHitEntity]: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "damageSource.damagingEntity"
            },
            name: ExEventNames.afterEntityHurt
        },
        [ExOtherEventNames.afterOnHurt]: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "hurtEntity"
            },
            name: ExEventNames.afterEntityHurt
        },
        [ExOtherEventNames.onLongTick]: {
            pattern: (registerName: string, k: string) => {}
        },
        [ExEventNames.afterPlayerBreakBlock]: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "player"
            }
        },
        [ExEventNames.afterEntityDie]: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "deadEntity"
            }
        },
        [ExEventNames.afterEntityRemove]: {
            pattern: (registerName: string, k: string) => {
                ExEntityEvents.eventHandlers.server.getEvents().register(registerName, (e: EntityRemoveAfterEvent) => {
                    for (let [key, value] of ExEntityEvents.eventHandlers.monitorMap[k]) {
                        if (key.id === e.removedEntityId) {
                            value.trigger(e);
                        }
                    }
                })
            }
        },
        [ExEventNames.beforeEntityRemove]: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "removedEntity"
            }
        },
        [ExEventNames.afterEntityLoad]: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "entity"
            }
        }
    }

    exEvents = {
        [ExEventNames.beforeItemUse]: new Listener<MouseEvent>(this, ExEventNames.beforeItemUse),
        [ExEventNames.afterItemUse]: new Listener<MouseEvent>(this, ExEventNames.afterItemUse),
        [ExOtherEventNames.tick]: new Listener<TickEvent>(this, ExOtherEventNames.tick),
        [ExEventNames.afterEntityHitBlock]: new Listener<EntityHurtAfterEvent>(this, ExEventNames.afterEntityHitBlock),
        [ExEventNames.afterEntityHitEntity]: new Listener<EntityHurtAfterEvent>(this, ExEventNames.afterEntityHitEntity),
        [ExOtherEventNames.afterOnHurt]: new Listener<EntityHurtAfterEvent>(this, ExOtherEventNames.afterOnHurt),
        [ExOtherEventNames.onLongTick]: new Listener<TickEvent>(this, ExOtherEventNames.onLongTick),
        [ExOtherEventNames.beforeTick]: new Listener<TickEvent>(this, ExOtherEventNames.beforeTick),
        [ExEventNames.afterPlayerBreakBlock]: new Listener<PlayerBreakBlockAfterEvent>(this, ExEventNames.afterPlayerBreakBlock),
        [ExEventNames.afterEntityDie]: new Listener<EntityDieAfterEvent>(this, ExEventNames.afterEntityDie),
        [ExEventNames.afterEntityRemove]: new Listener<EntityRemoveAfterEvent>(this, ExEventNames.afterEntityRemove),
        [ExEventNames.beforeEntityRemove]: new Listener<EntityRemoveBeforeEvent>(this, ExEventNames.beforeEntityRemove),
        [ExEventNames.afterEntityLoad]: new Listener<EntityLoadAfterEvent>(this, ExEventNames.afterEntityLoad)
    };

    public static init(s: ExGameServer) {
        this.eventHandlers.setEventLiseners(this.exEventSetting);
        this.eventHandlers.init(s);
    }
    static onHandItemMap = new Map<Entity, [ItemStack | undefined, number]>();
    static onceItemUseOnMap = new Map<Entity, [TickDelayTask, boolean]>();

    constructor(ctrl: ExEntityController) {
        this._ctrl = ctrl;
        this.exEvents[ExOtherEventNames.tick] = ctrl.tickMonitor;
        this.exEvents[ExOtherEventNames.onLongTick] = ctrl.longTickMonitor;
        this.exEvents[ExOtherEventNames.beforeTick] = ctrl.beforeTickMonitor;
    }
    register(name: string, fun: (...arg: unknown[]) => void) {
        let func: (...arg: unknown[]) => void = fun;
        if (name in this.exEvents) {
            return (<any>this.exEvents)[name].subscribe(func);
        }

        console.warn("No event registered for name " + name);
    }


    cancel(name: string, fun: (...arg: unknown[]) => void) {
        if (name in this.exEvents) {
            return (<any>this.exEvents)[name].unsubscribe(fun);
        }
    }

    stopContext() {
        if (ExEntityEvents.eventHandlers.monitorMap[ExOtherEventNames.onLongTick].has(this._ctrl.entity)) {
            this.monitorMapBackup[ExOtherEventNames.onLongTick] =
                ExEntityEvents.eventHandlers.monitorMap[ExOtherEventNames.onLongTick].get(this._ctrl.entity)!
            ExEntityEvents.eventHandlers.monitorMap[ExOtherEventNames.onLongTick].delete(this._ctrl.entity)

        }
        if (ExEntityEvents.eventHandlers.monitorMap[ExOtherEventNames.tick].has(this._ctrl.entity)) {
            this.monitorMapBackup[ExOtherEventNames.tick] =
                ExEntityEvents.eventHandlers.monitorMap[ExOtherEventNames.tick].get(this._ctrl.entity)!
            ExEntityEvents.eventHandlers.monitorMap[ExOtherEventNames.tick].delete(this._ctrl.entity)
        }
    }
    startContext() {
        if (ExOtherEventNames.tick in this.monitorMapBackup) {
            ExEntityEvents.eventHandlers.monitorMap[ExOtherEventNames.tick].set(this._ctrl.entity, this.monitorMapBackup[ExOtherEventNames.tick]);
        }
        if (ExOtherEventNames.onLongTick in this.monitorMapBackup) {
            ExEntityEvents.eventHandlers.monitorMap[ExOtherEventNames.onLongTick].set(this._ctrl.entity, this.monitorMapBackup[ExOtherEventNames.onLongTick]);
        }
        this.monitorMapBackup = {};
    }
}

class Listener<T> {
    subscribe: (callback: (arg: T) => void) => void;
    unsubscribe: (callback: (arg: T) => void) => void;
    constructor(e: ExEntityEvents, name: string) {
        this.subscribe = (callback: (arg: T) => void) => {
            e._subscribe(name, callback);
        }
        this.unsubscribe = (callback: (arg: T) => void) => {
            e._unsubscribe(name, callback);
        }
    }
}
class CallBackListener<T, V> {
    subscribe: (callback: (arg1: T) => V) => void;
    unsubscribe: (callback: (arg1: T) => V) => void;
    constructor(e: ExEntityEvents, name: string) {
        this.subscribe = (callback: (arg1: T) => V) => {
            e._subscribe(name, callback);
        }
        this.unsubscribe = (callback: (arg1: T) => V) => {
            e._unsubscribe(name, callback);
        }
    }
}