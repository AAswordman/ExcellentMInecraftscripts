import { MinecraftEffectTypes, MinecraftBlockTypes, ItemStack, world, BlockType, ItemTypes, system } from '@minecraft/server';
import { ModalFormData } from "@minecraft/server-ui";
import Vector3 from '../../../modules/exmc/math/Vector3.js';
import ExDimension from '../../../modules/exmc/server/ExDimension.js';
import ExErrorQueue from '../../../modules/exmc/server/ExErrorQueue.js';
import ExGameVector3 from '../../../modules/exmc/server/math/ExGameVector3.js';
import menuFunctionUI from "../data/menuFunctionUI.js";
import MenuUIAlert from "../ui/MenuUIAlert.js";
import GameController from "./GameController.js";

export default class SimpleItemUseFunc extends GameController {
    onJoin(): void {

        //连锁挖矿
        this.getEvents().exEvents.afterBlockBreak.subscribe(e => {
            const itemId = this.exPlayer.getBag().getItemOnHand()?.typeId;
            if (itemId === "wb:axex_equipment_a") {
                if (e.brokenBlockPermutation.hasTag("log")) {
                    this.chainDigging(new Vector3(e.block), e.brokenBlockPermutation.type.id, 16);
                }
            } else if (itemId === "wb:pickaxex_equipment_a") {
                if (this.globalSettings.chainMining) {
                    this.chainDigging(new Vector3(e.block), e.brokenBlockPermutation.type.id, 5);
                }
            }
        });
        this.getEvents().exEvents.beforeItemUseOn.subscribe(e => {
            if (e.itemStack.typeId === "wb:technology_world_explorer") {
                this.sayTo(e.block?.typeId ?? "");
            }
        });
        this.getEvents().exEvents.beforeItemUse.subscribe((e) => {
            const item = e.itemStack;

            if (item.typeId == "wb:power") {
                if (!this.data.lang) {
                    this.setTimeout(() => {
                        new ModalFormData()
                            .title("Choose a language")
                            .dropdown("Language List", ["English", "简体中文"], 0)
                            .show(this.player).then((e) => {
                                if (!e.canceled) {
                                    this.data.lang = (e.formValues && e.formValues[0] == 0) ? "en" : "zh";
                                }
                            })
                            .catch((e) => {
                                ExErrorQueue.throwError(e);
                            });
                    }, 0);
                } else {
                    new MenuUIAlert(this.client, menuFunctionUI(this.getLang())).showPage("main", "notice");
                }
            } else if (item.typeId === "wb:jet_pack") {
                // jet pack
                this.setTimeout(() => {
                    this.exPlayer.addEffect(MinecraftEffectTypes.levitation, 7, 15, false);
                    this.exPlayer.addEffect(MinecraftEffectTypes.slowFalling, 150, 3, false);

                    this.exPlayer.dimension.spawnEntity("wb:ball_jet_pack", this.exPlayer.getPosition().sub(this.exPlayer.viewDirection.scl(2)));
                }, 0);
            } else if (item.typeId === "wb:start_key") {

            } else if (item.typeId === "wb:technology_world_explorer") {
                // this.exPlayer.command.run("locate biome ice_plains").then((e) => {
                //     // console.warn(JSON.stringify(e));
                //     // console.warn((e.toLocaleString()));
                //     // console.warn((e.toString()));
                //     // console.warn(ExSystem.parseObj(e));
                // })
                //     .catch((err) => {
                //         console.warn(err);
                //     })

            } else if (item.typeId === "wb:pickaxex_equipment_a") {
                if (this.globalSettings.chainMining) {
                } else {
                    this.exPlayer.command.run([
                        "execute as @s[scores={wbfl=..39}] at @s run tellraw @s {\"rawtext\":[{\"translate\":\"tell.play.29.name\"}]}",
                        "execute as @s[tag=!wbplot,scores={wbfl=40..},m=!adventure] at @s run fill ~+4 ~+4 ~+4 ~-4 ~ ~-4 air [] replace stone []",
                        "execute as @s[tag=!wbplot,scores={wbfl=40..},m=!adventure] at @s run fill ~+4 ~+4 ~+4 ~-4 ~ ~-4 air [] replace end_stone []",
                        "execute as @s[tag=!wbplot,scores={wbfl=40..},m=!adventure] at @s run fill ~+4 ~+4 ~+4 ~-4 ~ ~-4 air [] replace cobblestone []",
                        "execute as @s[tag=!wbplot,scores={wbfl=40..},m=!adventure] at @s run fill ~+4 ~+4 ~+4 ~-4 ~ ~-4 air [] replace netherrack []",
                        "execute as @s[tag=!wbplot,scores={wbfl=40..},m=!adventure] at @s run fill ~+4 ~+4 ~+4 ~-4 ~ ~-4 air [] replace red_sandstone []",
                        "execute as @s[scores={wbfl=40..}] at @s run scoreboard players remove @s wbfl 40"
                    ]);
                }
            }
        });

        this.getEvents().exEvents.afterItemOnHandChange.subscribe((e) => {

        });

    }
    chainDigging(v: Vector3, idType: string, times: number, posData?: Set<string>) {
        let o = posData === undefined;
        if (!posData) {
            posData = new Set<string>();
        }
        if (times > 0) {
            times--;
        } else {
            return;
        }
        const pos = v.floor().toString();
        if (posData.has(pos)) return;
        posData.add(pos);
        const dim = ExDimension.getInstance(this.getDimension());
        const id = dim.getBlock(v)?.typeId;
        if (id === idType || o) {
            dim.digBlock(v);
            this.chainDigging(v.add(0, 1, 0), idType, times, posData);
            this.chainDigging(v.sub(0, 1, 0).add(0, -1, 0), idType, times, posData);
            this.chainDigging(v.sub(0, -1, 0).add(0, 0, 1), idType, times, posData);
            this.chainDigging(v.sub(0, 0, 1).add(0, 0, -1), idType, times, posData);
            this.chainDigging(v.sub(0, 0, -1).add(1, 0, 0), idType, times, posData);
            this.chainDigging(v.sub(1, 0, 0).add(-1, 0, 0), idType, times, posData);
            v.sub(-1, 0, 0);

            this.chainDigging(v.add(1, 1, 0), idType, times, posData);
            this.chainDigging(v.sub(1, 1, 0).add(1, -1, 0), idType, times, posData);
            this.chainDigging(v.sub(1, -1, 0).add(1, 0, 1), idType, times, posData);
            this.chainDigging(v.sub(1, 0, 1).add(1, 0, -1), idType, times, posData);
            this.chainDigging(v.sub(1, 0, -1).add(-1, -1, 0), idType, times, posData);
            this.chainDigging(v.sub(-1, -1, 0).add(-1, 1, 0), idType, times, posData);
            this.chainDigging(v.sub(-1, 1, 0).add(-1, 0, 1), idType, times, posData);
            this.chainDigging(v.sub(-1, 0, 1).add(-1, 0, -1), idType, times, posData);
            v.sub(-1, 0, -1);

        }
    }
    onLoaded(): void {
        this.initialMagicPickaxe();
    }
    onLeave(): void {
    }

    initialMagicPickaxe() {
        if (this.globalSettings.initialMagicPickaxe) {
            if (!this.data.initialMagicPickaxe) {
                this.exPlayer.getBag().addItem(new ItemStack(ItemTypes.get("wb:pickaxex_equipment_a")));
                this.data.initialMagicPickaxe = true;
            }
        }
    }

}