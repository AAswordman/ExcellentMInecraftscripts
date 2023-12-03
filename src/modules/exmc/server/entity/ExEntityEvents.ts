import { PlayerBreakBlockAfterEvent, Entity, EntityHurtAfterEvent, ItemStack, Player } from "@minecraft/server";
import ExEventManager from "../../interface/ExEventManager.js";
import TickDelayTask from "../../utils/TickDelayTask.js";
import ExGameServer from '../ExGameServer.js';
import ExPlayer from '../entity/ExPlayer.js';
import EventHandle, { EventListenerSettings } from "../events/EventHandle.js";
import { ExEventNames, ExOtherEventNames, ItemOnHandChangeEvent, TickEvent } from "../events/events.js";
import ExEntityController from "./ExEntityController.js";
export default class ExEntityEvents implements ExEventManager {

    private static eventHandlers: EventHandle<ExEntityEvents["exEvents"]> = new EventHandle();

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
            pattern: ExEntityEvents.eventHandlers.registerToServerByServerEvent
        },
        [ExOtherEventNames.beforeTick]: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByServerEvent
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
        [ExOtherEventNames.afterItemOnHandChange]: {
            pattern: (registerName: string, k: string) => {
                this.onHandItemMap = new Map<Player, [ItemStack | undefined, number]>();
                ExEntityEvents.eventHandlers.server.getEvents().register(registerName, (e: TickEvent) => {
                    for (let i of (<Map<Player, ((e: ItemOnHandChangeEvent) => void)[]>>ExEntityEvents.eventHandlers.monitorMap[k])) {
                        let lastItemCache = this.onHandItemMap.get(i[0]);
                        let lastItem = lastItemCache?.[0];
                        let nowItem = ExPlayer.getInstance(i[0]).getBag().itemOnMainHand;

                        if (lastItem?.typeId !== nowItem?.typeId || i[0].selectedSlot !== lastItemCache?.[1]) {
                            i[1].forEach((f) => {
                                f(new ItemOnHandChangeEvent(lastItem, lastItemCache?.[1] ?? 0, nowItem, i[0].selectedSlot, i[0]));
                            });

                            this.onHandItemMap.set(i[0], [nowItem, i[0].selectedSlot]);
                        }
                    }

                });
            },
            name: ExOtherEventNames.onLongTick
        },
        [ExOtherEventNames.onLongTick]: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByServerEvent
        },
        [ExEventNames.afterPlayerBreakBlock]: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "player"
            }
        },
        [ExEventNames.afterEntityRemove]: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByServerEvent
        }
    }

    exEvents = {
        [ExEventNames.beforeItemUse]: new Listener<MouseEvent>(this, ExEventNames.beforeItemUse),
        [ExEventNames.afterItemUse]: new Listener<MouseEvent>(this, ExEventNames.afterItemUse),
        [ExOtherEventNames.tick]: new Listener<TickEvent>(this, ExOtherEventNames.tick),
        [ExEventNames.afterEntityHitBlock]: new Listener<EntityHurtAfterEvent>(this, ExEventNames.afterEntityHitBlock),
        [ExEventNames.afterEntityHitEntity]: new Listener<EntityHurtAfterEvent>(this, ExEventNames.afterEntityHitEntity),
        [ExOtherEventNames.afterOnHurt]: new Listener<EntityHurtAfterEvent>(this, ExOtherEventNames.afterOnHurt),
        [ExOtherEventNames.afterItemOnHandChange]: new Listener<ItemOnHandChangeEvent>(this,ExOtherEventNames.afterItemOnHandChange),
        [ExOtherEventNames.onLongTick]: new Listener<TickEvent>(this, ExOtherEventNames.onLongTick),
        [ExOtherEventNames.beforeTick]: new Listener<TickEvent>(this, ExOtherEventNames.beforeTick),
        [ExEventNames.afterPlayerBreakBlock]: new Listener<PlayerBreakBlockAfterEvent>(this, ExEventNames.afterPlayerBreakBlock),
        [ExEventNames.afterEntityRemove]: new Listener<PlayerBreakBlockAfterEvent>(this, ExEventNames.afterEntityRemove)
    };
    
    public static init(s: ExGameServer) {
        this.eventHandlers.setEventLiseners(this.exEventSetting);
        this.eventHandlers.init(s);
    }
    static onHandItemMap = new Map<Player, [ItemStack | undefined, number]>();
    static onceItemUseOnMap = new Map<Entity, [TickDelayTask, boolean]>();

    constructor(ctrl: ExEntityController) {
        this._ctrl = ctrl;
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
}

class Listener<T>{
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