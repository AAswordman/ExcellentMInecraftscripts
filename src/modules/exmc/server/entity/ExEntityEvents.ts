import { BlockBreakAfterEvent, Entity, EntityHurtAfterEvent, ItemStack, Player } from "@minecraft/server";
import ExEventManager from "../../interface/ExEventManager.js";
import TickDelayTask from "../../utils/TickDelayTask.js";
import ExGameServer from '../ExGameServer.js';
import ExPlayer from '../entity/ExPlayer.js';
import EventHandle, { EventListenerSettings } from "../events/EventHandle.js";
import { ExEventNames, ExOtherEventNames, ItemOnHandChangeEvent, TickEvent } from "../events/events.js";
import ExEntityController from "./ExEntityController.js";
export default class ExEntityEvents implements ExEventManager {

    private static eventHandlers: EventHandle = new EventHandle();

    _subscribe(arg0: string, callback: (arg: any) => void) {
        ExEntityEvents.eventHandlers.subscribe(this._ctrl.entity, arg0, callback);
    }
    _unsubscribe(arg0: string, callback: (arg: any) => void) {
        ExEntityEvents.eventHandlers.unsubscribe(this._ctrl.entity, arg0, callback);
    }
    cancelAll() {
        console.warn("destroy all events");
        ExEntityEvents.eventHandlers.unsubscribeAll(this._ctrl.entity);
    }

    _ctrl: ExEntityController;

    static exEventSetting: EventListenerSettings = {
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
        [ExOtherEventNames.afterEntityHit]: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "entity"
            }
        },
        [ExOtherEventNames.afterOnHitEntity]: {
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
                        let nowItem = ExPlayer.getInstance(i[0]).getBag().getItemOnHand();

                        if (lastItem?.typeId !== nowItem?.typeId || i[0].selectedSlot !== lastItemCache?.[1]) {
                            i[1].forEach((f) => {
                                f(new ItemOnHandChangeEvent(lastItem, ExPlayer.getInstance(i[0]).getBag().getItemOnHand(), i[0]));
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
        [ExEventNames.afterBlockBreak]: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "player"
            }
        }
    }

    exEvents = {
        [ExEventNames.beforeItemUse]: new Listener<MouseEvent>(this, ExEventNames.beforeItemUse),
        [ExEventNames.afterItemUse]: new Listener<MouseEvent>(this, ExEventNames.afterItemUse),
        [ExOtherEventNames.tick]: new Listener<TickEvent>(this, ExOtherEventNames.tick),
        [ExOtherEventNames.afterEntityHit]: new Listener<EntityHurtAfterEvent>(this, ExOtherEventNames.afterEntityHit),
        [ExOtherEventNames.afterOnHitEntity]: new Listener<EntityHurtAfterEvent>(this, ExOtherEventNames.afterOnHitEntity),
        [ExOtherEventNames.afterOnHurt]: new Listener<EntityHurtAfterEvent>(this, ExOtherEventNames.afterOnHurt),
        [ExOtherEventNames.afterItemOnHandChange]: new Listener<ItemOnHandChangeEvent>(this,ExOtherEventNames.afterItemOnHandChange),
        [ExOtherEventNames.onLongTick]: new Listener<TrackEvent>(this, ExOtherEventNames.onLongTick),
        [ExEventNames.afterBlockBreak]: new Listener<BlockBreakAfterEvent>(this, ExEventNames.afterBlockBreak)
    };
    
    public static init(s: ExGameServer) {
        this.eventHandlers.setEventLiseners(this.exEventSetting);
        this.eventHandlers.init(s);
    }
    static onHandItemMap = new Map<Player, [ItemStack | undefined, number]>();
    static onceItemUseOnMap = new Map<Entity, [TickDelayTask, boolean]>();

    constructor(ctrl: ExEntityController) {
        this._ctrl = ctrl;
        console.warn("regist events");
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