import ExGameClient from "../ExGameClient.js";
import {
    BeforeChatEvent,
    BeforeItemUseOnEvent,
    BlockBreakEvent,
    ChatEvent,
    ItemUseEvent,
    ItemUseOnEvent,
    TickEvent
} from "@minecraft/server";
import ExEventManager from "../../interface/ExEventManager.js";
import ExGameServer from '../ExGameServer.js';
import { Player, EntityHurtEvent, ItemStack, EntityHitEvent, Entity } from '@minecraft/server';
import ExPlayer from '../entity/ExPlayer.js';
import { ItemOnHandChangeEvent } from "./events.js";
import ExGameConfig from "../ExGameConfig.js";
import TickDelayTask from "../../utils/TickDelayTask.js";
import EventHandle, { EventListenerSettings, EventListeners } from './EventHandle.js';
export default class ExClientEvents implements ExEventManager {

    private static eventHandlers: EventHandle = new EventHandle();

    _subscribe(arg0: string, callback: (arg: any) => void) {
        ExClientEvents.eventHandlers.subscribe(this._client.player, arg0, callback);
    }
    _unsubscribe(arg0: string, callback: (arg: any) => void) {
        ExClientEvents.eventHandlers.unsubscribe(this._client.player, arg0, callback);
    }
    cancelAll() {
        ExClientEvents.eventHandlers.unsubscribeAll(this._client.player);
    }

    _client: ExGameClient;

    static exEventSetting: EventListenerSettings = {
        itemUse: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "source"
            }
        },
        chat: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "sender"
            }
        },
        beforeChat: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "sender"
            }
        },
        tick: {
            pattern: ExClientEvents.eventHandlers.registerToServerByServerEvent
        },
        entityHit: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "entity"
            }
        },
        itemUseOn: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "source"
            }
        },

        beforeItemUseOn: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "source"
            }
        },
        onceItemUseOn: {
            pattern: (registerName: string, k: string) => {
                this.onceItemUseOnMap = new Map<Entity, [TickDelayTask, boolean]>();
                ExClientEvents.eventHandlers.server.getEvents().register(registerName, (e: ItemUseOnEvent) => {
                    if (!(e.source instanceof Player)) return;
                    let part = (<Map<Player, ((i: ItemUseOnEvent) => void)[]>>ExClientEvents.eventHandlers.monitorMap[k]);
                    if (!this.onceItemUseOnMap.has(e.source)) {
                        const player = e.source;
                        this.onceItemUseOnMap.set(e.source, [new TickDelayTask(ExClientEvents.eventHandlers.server.getEvents(), () => {
                            let res = this.onceItemUseOnMap.get(player);
                            if (res === undefined) return;
                            res[1] = true;
                        }).delay(3), true]);
                    }

                    let res = this.onceItemUseOnMap.get(e.source);
                    if (res === undefined) return;
                    if (res[1]) {
                        res[1] = false;
                        part.get(e.source)?.forEach((v) => v(e));
                    }
                    res[0].stop();
                    res[0].startOnce();

                });
            },
            filter: {
                "name": "source"
            },
            name: "beforeItemUseOn"
        },
        playerHitEntity: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "damagingEntity"
            },
            name: "entityHurt"
        },
        playerHurt: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "hurtEntity"
            },
            name: "entityHurt"
        },
        itemOnHandChange: {
            pattern: (registerName: string, k: string) => {
                this.onHandItemMap = new Map<Player, [ItemStack | undefined, number]>();
                ExClientEvents.eventHandlers.server.getEvents().register(registerName, (e: TickEvent) => {
                    for (let i of (<Map<Player, ((e: ItemOnHandChangeEvent) => void)[]>>ExClientEvents.eventHandlers.monitorMap[k])) {
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
            pattern: ExClientEvents.eventHandlers.registerToServerByServerEvent
        },
        blockBreak: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "player"
            }
        }
    }

    exEvents = {
        itemUse: new Listener<ItemUseEvent>(this, "itemUse"),
        chat: new Listener<ChatEvent>(this, "chat"),
        beforeChat: new Listener<BeforeChatEvent>(this, "beforeChat"),
        tick: new Listener<TickEvent>(this, "tick"),
        entityHit: new Listener<EntityHitEvent>(this, "entityHit"),
        itemUseOn: new Listener<ItemUseOnEvent>(this, "itemUseOn"),

        beforeItemUseOn: new Listener<BeforeItemUseOnEvent>(this, "beforeItemUseOn"),
        onceItemUseOn: new Listener<BeforeItemUseOnEvent>(this, "onceItemUseOn"),
        playerHitEntity: new Listener<EntityHurtEvent>(this, "playerHitEntity"),
        playerHurt: new Listener<EntityHurtEvent>(this, "playerHurt"),
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

    constructor(client: ExGameClient) {
        this._client = client;
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
    constructor(e: ExClientEvents, name: string) {
        this.subscribe = (callback: (arg: T) => void) => {
            e._subscribe(name, callback);
        }
        this.unsubscribe = (callback: (arg: T) => void) => {
            e._unsubscribe(name, callback);
        }
    }
}