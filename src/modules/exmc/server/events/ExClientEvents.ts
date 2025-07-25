import ExGameClient from "../ExGameClient.js";
import { PlayerBreakBlockAfterEvent, ChatSendAfterEvent, ChatSendBeforeEvent, EffectAddAfterEvent, EntityHealthChangedAfterEvent, EntityHitBlockAfterEvent, EntityHurtAfterEvent, ItemReleaseUseAfterEvent, ItemStopUseAfterEvent, ItemUseAfterEvent, ItemUseBeforeEvent, PlayerSpawnAfterEvent, ItemUseOnEvent, PlayerInteractWithBlockBeforeEvent, PlayerInteractWithEntityBeforeEvent, EffectAddBeforeEvent } from '@minecraft/server';
import ExEventManager from "../../interface/ExEventManager.js";
import ExGameServer from '../ExGameServer.js';
import { Player, ItemStack, Entity } from '@minecraft/server';
import ExPlayer from '../entity/ExPlayer.js';
import { ExEventNames, ExOtherEventNames, ItemOnHandChangeEvent, PlayerShootProjectileEvent, TickEvent } from "./events.js";
import TickDelayTask from "../../utils/TickDelayTask.js";
import EventHandle, { EventListenerSettings } from './EventHandle.js';
import ExEntity from "../entity/ExEntity.js";
import Vector3 from "../../utils/math/Vector3.js";
import { MinecraftEntityTypes } from "../../../vanilla-data/lib/index.js";
import { ItemStartUseAfterEvent } from "@minecraft/server";
import MonitorManager from "../../utils/MonitorManager.js";
import ExSystem from "../../utils/ExSystem.js";
import ExListener from "../../interface/ExListener.js";


export default class ExClientEvents implements ExEventManager {

    private static eventHandlers: EventHandle<ExClientEvents["exEvents"]> = new EventHandle();

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

    static exEventSetting: EventListenerSettings<ExClientEvents["exEvents"]> = {
        [ExEventNames.beforeItemUse]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "source"
            }
        },
        [ExEventNames.afterItemUse]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "source"
            }
        },
        [ExEventNames.afterItemStopUse]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "source"
            }
        },
        [ExEventNames.afterItemReleaseUse]: {
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
        [ExEventNames.beforeChatSend]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "sender"
            }
        },
        [ExOtherEventNames.tick]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByServerEvent
        },
        [ExOtherEventNames.beforeTick]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByServerEvent
        },
        [ExOtherEventNames.onLongTick]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByServerEvent
        },
        [ExEventNames.beforePlayerInteractWithBlock]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "player"
            }
        },
        [ExOtherEventNames.beforeOncePlayerInteractWithBlock]: {
            pattern: (registerName: string, k: string) => {
                this.onceInteractWithBlockMap = new Map<Entity, [TickDelayTask, boolean]>();
                ExClientEvents.eventHandlers.server.getEvents().register(registerName, (e: PlayerInteractWithEntityBeforeEvent) => {
                    if (!(e.player instanceof Player)) return;
                    let part = (ExClientEvents.eventHandlers.monitorMap[k]);
                    if (!this.onceInteractWithBlockMap.has(e.player)) {
                        const player = e.player;
                        this.onceInteractWithBlockMap.set(e.player, [ExSystem.tickTask(ExClientEvents.eventHandlers.server, () => {
                            let res = this.onceInteractWithBlockMap.get(player);
                            if (res === undefined) return;
                            res[1] = true;
                        }).delay(3), true]);
                    }

                    let res = this.onceInteractWithBlockMap.get(e.player);
                    if (res === undefined) return;
                    if (res[1]) {
                        res[1] = false;
                        part.get(e.player)?.forEach((v) => v(e));
                    }
                    res[0].stop();
                    res[0].startOnce();

                });
            },
            filter: {
                "name": "player"
            },
            name: ExEventNames.beforePlayerInteractWithBlock
        },
        [ExOtherEventNames.afterPlayerHitBlock]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "damagingEntity"
            },
            name: ExEventNames.afterEntityHitBlock
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
                    for (let i of (ExClientEvents.eventHandlers.monitorMap[k])) {
                        let lastItemCache = this.onHandItemMap.get(<Player>i[0]);
                        if (e.currentTick % 4 === 0 || ((<Player>i[0]).selectedSlotIndex !== lastItemCache?.[1])) {
                            let lastItem = lastItemCache?.[0];
                            let nowItem = ExPlayer.getInstance(<Player>i[0]).getBag().itemOnMainHand;

                            if (lastItem?.typeId !== nowItem?.typeId || (<Player>i[0]).selectedSlotIndex !== lastItemCache?.[1]) {
                                let res: ItemStack | undefined = nowItem;
                                i[1].forEach((f) => {
                                    res = <ItemStack | undefined>f(new ItemOnHandChangeEvent(lastItem, lastItemCache?.[1] ?? 0, res, (<Player>i[0]).selectedSlotIndex, <Player>i[0])) ?? res;
                                });
                                if (res !== undefined) {
                                    if (res.isWillBeRemoved) {
                                        ExPlayer.getInstance(<Player>i[0]).getBag().itemOnMainHand = undefined;
                                    } else {
                                        ExPlayer.getInstance(<Player>i[0]).getBag().itemOnMainHand = res;
                                    }
                                }

                                this.onHandItemMap.set(<Player>i[0], [res, (<Player>i[0]).selectedSlotIndex]);
                            }
                        }
                    }

                });
            },
            name: ExOtherEventNames.tick
        },
        [ExOtherEventNames.afterPlayerShootProj]: {
            pattern: (registerName: string, k: string) => {
                const func = (p: Entity, e: { "itemStack": ItemStack }) => {
                    let liss = ExClientEvents.eventHandlers.monitorMap[k].get(p);
                    if (!liss || liss.length === 0) return;

                    let arr: Entity[] = [];
                    const viewDic = ExEntity.getInstance(p).viewDirection;
                    const viewLen = viewDic.len();
                    const tmpV = new Vector3();
                    for (let e of p.dimension.getEntities({
                        "location": p.location,
                        "maxDistance": 16,
                        "families": ["arrow"]
                    })) {
                        tmpV.set(e.getVelocity());
                        const len = tmpV.len();
                        if (len === 0) continue;
                        if (tmpV.len() > 0.15
                            && Math.acos(tmpV.mul(viewDic) / viewLen / tmpV.len()) < 0.25) {
                            arr.push(e);
                        }
                    }
                    if (arr.length === 0) {
                        for (let e of p.dimension.getEntities({
                            "location": p.location,
                            "maxDistance": 6,
                            "excludeFamilies": [MinecraftEntityTypes.Player]
                        })) {
                            tmpV.set(e.getVelocity());
                            const len = tmpV.len();
                            if (len === 0) continue;
                            if (tmpV.len() > 0.15
                                && Math.acos(tmpV.mul(viewDic) / viewLen / tmpV.len()) < 0.25) {
                                arr.push(e);
                            }
                        }
                    }
                    if (arr.length > 0) {
                        for (let i of liss) {
                            i(new PlayerShootProjectileEvent(p, arr[0]));
                        }
                    }
                };
                ExClientEvents.eventHandlers.server.getEvents().events.afterItemReleaseUse.subscribe((e) => {
                    if (e.itemStack) func(e.source, { "itemStack": e.itemStack });
                });
                ExClientEvents.eventHandlers.server.getEvents().events.afterItemUse.subscribe((e) => {
                    func(e.source, e);
                });
            }
        },

        [ExEventNames.afterPlayerBreakBlock]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "player"
            }
        },
        [ExEventNames.afterPlayerSpawn]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "player"
            }
        },
        [ExEventNames.afterEntityHealthChanged]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "entity"
            }
        },
        [ExEventNames.afterEffectAdd]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "entity"
            }
        },
        [ExEventNames.beforeEffectAdd]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "entity"
            }
        },
        [ExEventNames.afterItemStartUse]: {
            pattern: ExClientEvents.eventHandlers.registerToServerByEntity,
            filter: {
                "name": "source"
            }
        },
    }

    exEvents = {
        [ExEventNames.beforeItemUse]: new Listener<ItemUseBeforeEvent>(this, ExEventNames.beforeItemUse),
        [ExEventNames.afterItemUse]: new Listener<ItemUseAfterEvent>(this, ExEventNames.afterItemUse),
        [ExEventNames.afterItemStopUse]: new Listener<ItemStopUseAfterEvent>(this, ExEventNames.afterItemStopUse),
        [ExEventNames.afterItemReleaseUse]: new Listener<ItemReleaseUseAfterEvent>(this, ExEventNames.afterItemReleaseUse),
        [ExEventNames.afterChatSend]: new Listener<ChatSendAfterEvent>(this, ExEventNames.afterChatSend),
        [ExEventNames.beforeChatSend]: new Listener<ChatSendBeforeEvent>(this, ExEventNames.beforeChatSend),
        [ExOtherEventNames.tick]: new Listener<TickEvent>(this, ExOtherEventNames.tick),
        [ExOtherEventNames.beforeTick]: new Listener<TickEvent>(this, ExOtherEventNames.beforeTick),
        [ExOtherEventNames.onLongTick]: new Listener<TickEvent>(this, ExOtherEventNames.onLongTick),
        [ExEventNames.beforePlayerInteractWithBlock]: new Listener<PlayerInteractWithBlockBeforeEvent>(this, ExEventNames.beforePlayerInteractWithBlock),
        [ExOtherEventNames.beforeOncePlayerInteractWithBlock]: new Listener<PlayerInteractWithBlockBeforeEvent>(this, ExOtherEventNames.beforeOncePlayerInteractWithBlock),
        [ExOtherEventNames.afterPlayerHitBlock]: new Listener<EntityHitBlockAfterEvent>(this, ExOtherEventNames.afterPlayerHitBlock),
        [ExOtherEventNames.afterPlayerHitEntity]: new Listener<EntityHurtAfterEvent>(this, ExOtherEventNames.afterPlayerHitEntity),
        [ExOtherEventNames.afterPlayerHurt]: new Listener<EntityHurtAfterEvent>(this, ExOtherEventNames.afterPlayerHurt),
        [ExOtherEventNames.afterItemOnHandChange]: new CallBackListener<ItemOnHandChangeEvent, ItemStack | void>(this, ExOtherEventNames.afterItemOnHandChange),
        [ExOtherEventNames.afterPlayerShootProj]: new Listener<PlayerShootProjectileEvent>(this, ExOtherEventNames.afterPlayerShootProj),
        [ExEventNames.afterPlayerBreakBlock]: new Listener<PlayerBreakBlockAfterEvent>(this, ExEventNames.afterPlayerBreakBlock),
        [ExEventNames.afterPlayerSpawn]: new Listener<PlayerSpawnAfterEvent>(this, ExEventNames.afterPlayerSpawn),
        [ExEventNames.afterEntityHealthChanged]: new Listener<EntityHealthChangedAfterEvent>(this, ExEventNames.afterEntityHealthChanged),
        [ExEventNames.beforeEffectAdd]: new Listener<EffectAddBeforeEvent>(this, ExEventNames.beforeEffectAdd),
        [ExEventNames.afterEffectAdd]: new Listener<EffectAddAfterEvent>(this, ExEventNames.afterEffectAdd),

        [ExEventNames.afterItemStartUse]: new Listener<ItemStartUseAfterEvent>(this, ExEventNames.afterItemStartUse)
    };

    public static init(s: ExGameServer) {
        this.eventHandlers.setEventLiseners(this.exEventSetting);
        this.eventHandlers.init(s);
    }
    static onHandItemMap = new Map<Player, [ItemStack | undefined, number]>();
    static onceItemUseOnMap = new Map<Entity, [TickDelayTask, boolean]>();
    static onceInteractWithBlockMap = new Map<Entity, [TickDelayTask, boolean]>();

    constructor(client: ExGameClient) {
        this._client = client;
        this.exEvents[ExOtherEventNames.tick] = client.tickMonitor;
        this.exEvents[ExOtherEventNames.onLongTick] = client.longTickMonitor;
        this.exEvents[ExOtherEventNames.beforeTick] = client.beforeTickMonitor;
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

class Listener<T> implements ExListener<T> {
    subscribe: (callback: (arg: T) => void) => (((arg1: T) => void));
    unsubscribe: (callback: (arg: T) => void) => (((arg1: T) => void));
    constructor(e: ExClientEvents, name: string) {
        this.subscribe = (callback: (arg: T) => void) => {
            e._subscribe(name, callback);
            return callback;
        }
        this.unsubscribe = (callback: (arg: T) => void) => {
            e._unsubscribe(name, callback);
            return callback;
        }
    }
}

class CallBackListener<T, V> implements CallBackListener<T, V> {
    subscribe: (callback: (arg1: T) => V) => ((arg1: T) => V);
    unsubscribe: (callback: (arg1: T) => V) => ((arg1: T) => V);
    constructor(e: ExClientEvents, name: string) {
        this.subscribe = (callback: (arg1: T) => V) => {
            e._subscribe(name, callback);
            return callback;
        }
        this.unsubscribe = (callback: (arg1: T) => V) => {
            e._unsubscribe(name, callback);
            return callback;
        }
    }
}