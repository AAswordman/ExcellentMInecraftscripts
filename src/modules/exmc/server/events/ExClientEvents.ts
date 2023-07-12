import ExGameClient from "../ExGameClient.js";
import { BlockBreakAfterEvent, ChatSendAfterEvent, ChatSendBeforeEvent, EntityHitBlockAfterEvent, EntityHitEntityAfterEvent, EntityHurtAfterEvent, ItemUseAfterEvent, ItemUseBeforeEvent, ItemUseOnAfterEvent, ItemUseOnBeforeEvent } from '@minecraft/server';
import ExEventManager from "../../interface/ExEventManager.js";
import ExGameServer from '../ExGameServer.js';
import { Player, ItemStack, Entity } from '@minecraft/server';
import ExPlayer from '../entity/ExPlayer.js';
import { ExEventNames, ExOtherEventNames, ItemOnHandChangeEvent, TickEvent } from "./events.js";
import ExGameConfig from "../ExGameConfig.js";
import TickDelayTask from "../../utils/TickDelayTask.js";
import EventHandle, { EventListenerSettings, EventListeners } from './EventHandle.js';
import ExSystem from "../../utils/ExSystem.js";

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
        [ExEventNames.beforeItemUse]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "source"
            }
        },
        [ExEventNames.afterChatSend]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "sender"
            }
        },
        [ExEventNames.afterChatSend]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "sender"
            }
        },
        [ExEventNames.beforeChatSend]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "sender"
            }
        },
        [ExOtherEventNames.tick]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByServerEvent
        },
        [ExOtherEventNames.onLongTick]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByServerEvent
        },
        [ExEventNames.afterItemUseOn]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "source"
            }
        },
        [ExEventNames.beforeItemUseOn]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "source"
            }
        },
        // onceItemUseOn: {
        //     pattern: (registerName: string, k: string) => {
        //         this.onceItemUseOnMap = new Map<Entity, [TickDelayTask, boolean]>();
        //         ExClientEvents.eventHandlers.server.getEvents().register(registerName, (e: ItemUseOnEvent) => {
        //             if (!(e.source instanceof Player)) return;
        //             let part = (<Map<Player, ((i: ItemUseOnEvent) => void)[]>>ExClientEvents.eventHandlers.monitorMap[k]);
        //             if (!this.onceItemUseOnMap.has(e.source)) {
        //                 const player = e.source;
        //                 this.onceItemUseOnMap.set(e.source, [ExSystem.tickTask(() => {
        //                     let res = this.onceItemUseOnMap.get(player);
        //                     if (res === undefined) return;
        //                     res[1] = true;
        //                 }).delay(3), true]);
        //             }

        //             let res = this.onceItemUseOnMap.get(e.source);
        //             if (res === undefined) return;
        //             if (res[1]) {
        //                 res[1] = false;
        //                 part.get(e.source)?.forEach((v) => v(e));
        //             }
        //             res[0].stop();
        //             res[0].startOnce();

        //         });
        //     },
        //     filter: {
        //         "name": "source"
        //     },
        //     name: "itemUseOn"
        // },
        [ExOtherEventNames.afterPlayerHitBlock]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "damagingEntity"
            }
        },
        [ExOtherEventNames.afterPlayerHitEntity]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "damageSource.damagingEntity"
            },
            name: ExEventNames.afterEntityHurt
        },
        [ExOtherEventNames.afterPlayerHurt]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "hurtEntity"
            },
            name: ExEventNames.afterEntityHurt
        },
        [ExOtherEventNames.afterItemOnHandChange]: {
            pattern: (registerName: string, k: string) => {
                this.onHandItemMap = new Map<Player, [ItemStack | undefined, number]>();
                ExClientEvents.eventHandlers.server.getEvents().register(registerName, (e: TickEvent) => {
                    for (let i of (<Map<Player, ((e: ItemOnHandChangeEvent) => void)[]>>ExClientEvents.eventHandlers.monitorMap[k])) {
                        let lastItemCache = this.onHandItemMap.get(i[0]);
                        let lastItem = lastItemCache?.[0];
                        let nowItem = ExPlayer.getInstance(i[0]).getBag().itemOnMainHand;

                        if (lastItem?.typeId !== nowItem?.typeId || i[0].selectedSlot !== lastItemCache?.[1]) {
                            i[1].forEach((f) => {
                                f(new ItemOnHandChangeEvent(lastItem, ExPlayer.getInstance(i[0]).getBag().itemOnMainHand, i[0]));
                            });

                            this.onHandItemMap.set(i[0], [nowItem, i[0].selectedSlot]);
                        }
                    }

                });
            },
            name: ExOtherEventNames.onLongTick
        },

        [ExEventNames.afterBlockBreak]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "player"
            }
        }
    }

    exEvents = {
        [ExEventNames.beforeItemUse]: new Listener<ItemUseBeforeEvent>(this, ExEventNames.beforeItemUse),
        [ExEventNames.afterItemUse]: new Listener<ItemUseAfterEvent>(this, ExEventNames.beforeItemUse),
        [ExEventNames.afterChatSend]: new Listener<ChatSendAfterEvent>(this, ExEventNames.afterChatSend),
        [ExEventNames.beforeChatSend]: new Listener<ChatSendBeforeEvent>(this, ExEventNames.beforeChatSend),
        [ExOtherEventNames.tick]: new Listener<TickEvent>(this, ExOtherEventNames.tick),
        [ExOtherEventNames.onLongTick]: new Listener<TickEvent>(this, ExOtherEventNames.onLongTick),
        [ExEventNames.afterItemUseOn]: new Listener<ItemUseOnAfterEvent>(this, ExEventNames.afterItemUseOn),
        [ExEventNames.beforeItemUseOn]: new Listener<ItemUseOnBeforeEvent>(this, ExEventNames.beforeItemUseOn),
        [ExOtherEventNames.afterPlayerHitBlock]: new Listener<EntityHitBlockAfterEvent>(this, ExOtherEventNames.afterPlayerHitBlock),
        [ExOtherEventNames.afterPlayerHitEntity]: new Listener<EntityHurtAfterEvent>(this, ExOtherEventNames.afterPlayerHitEntity),
        [ExOtherEventNames.afterPlayerHurt]: new Listener<EntityHurtAfterEvent>(this, ExOtherEventNames.afterPlayerHurt),
        [ExOtherEventNames.afterItemOnHandChange]: new Listener<ItemOnHandChangeEvent>(this, ExOtherEventNames.afterItemOnHandChange),
        [ExEventNames.afterBlockBreak]: new Listener<BlockBreakAfterEvent>(this, ExEventNames.afterBlockBreak)
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