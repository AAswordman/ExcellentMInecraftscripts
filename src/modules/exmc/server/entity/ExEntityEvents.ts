import ExGameClient from "../ExGameClient.js";
import {
    BeforeChatEvent,
    BeforeItemUseOnEvent,
    BlockBreakEvent,
    ChatEvent,
    EntityCreateEvent,
    ItemUseEvent,
    ItemUseOnEvent,
    TickEvent
} from "@minecraft/server";
import ExEventManager from "../../interface/ExEventManager.js";
import ExGameServer from '../ExGameServer.js';
import { Player, EntityHurtEvent, ItemStack, EntityHitEvent, Entity } from '@minecraft/server';
import ExPlayer from '../entity/ExPlayer.js';
import TickDelayTask from "../../utils/TickDelayTask.js";
import EventHandle, { EventListenerSettings } from "../events/EventHandle.js";
import { ItemOnHandChangeEvent } from "../events/events.js";
import ExEntityController from "./ExEntityController.js";
export default class ExEntityEvents implements ExEventManager {

    private static eventHandlers: EventHandle = new EventHandle();

    _subscribe(arg0: string, callback: (arg: any) => void) {
        ExEntityEvents.eventHandlers.subscribe(this._ctrl.entity, arg0, callback);
    }
    _unsubscribe(arg0: string, callback: (arg: any) => void) {
        ExEntityEvents.eventHandlers.unsubscribe(this._ctrl.entity, arg0, callback);
    }
    unsubscribeAll() {
        ExEntityEvents.eventHandlers.unsubscribeAll(this._ctrl.entity);
    }

    _ctrl: ExEntityController;

    static exEventSetting: EventListenerSettings = {
        itemUse: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "source"
            }
        },
        tick: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByServerEvent
        },
        entityHit: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "entity"
            }
        },
        onHitEntity: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "damagingEntity"
            },
            name: "entityHurt"
        },
        onHurt: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "hurtEntity"
            },
            name: "entityHurt"
        },
        itemOnHandChange: {
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
            name: "onLongTick"
        },
        onLongTick: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByServerEvent
        },
        blockBreak: {
            pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "player"
            }
        }
    }

    exEvents = {
        itemUse: new Listener<ItemUseEvent>(this, "itemUse"),
        tick: new Listener<TickEvent>(this, "tick"),
        entityHit: new Listener<EntityHitEvent>(this, "entityHit"),
        onHitEntity: new Listener<EntityHurtEvent>(this, "playerHitEntity"),
        onHurt: new Listener<EntityHurtEvent>(this, "playerHurt"),
        itemOnHandChange: new Listener<ItemOnHandChangeEvent>(this, "itemOnHandChange"),
        onLongTick: new Listener<TickEvent>(this, "onLongTick"),
        blockBreak: new Listener<BlockBreakEvent>(this, "blockBreak")
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