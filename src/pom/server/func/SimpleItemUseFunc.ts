import { MinecraftEffectTypes, MinecraftBlockTypes } from '@minecraft/server';
import { ModalFormData } from "@minecraft/server-ui";
import Vector3 from '../../../modules/exmc/math/Vector3.js';
import ExDimension from '../../../modules/exmc/server/ExDimension.js';
import ExErrorQueue from '../../../modules/exmc/server/ExErrorQueue.js';
import ExGameVector3 from '../../../modules/exmc/server/math/ExGameVector3.js';
import menuFunctionUI from "../data/menuFunctionUI.js";
import MenuUIAlert from "../ui/MenuUIAlert.js";
import GameController from "./GameController.js";
import ExSystem from '../../../modules/exmc/utils/ExSystem.js';

export default class SimpleItemUseFunc extends GameController {
    onJoin(): void {
        this.getEvents().exEvents.blockBreak.subscribe(e => {

            if ((e.brokenBlockPermutation.type.id === MinecraftBlockTypes.log.id || e.brokenBlockPermutation.type.id === MinecraftBlockTypes.log2.id) && this.exPlayer.getBag().getItemOnHand()?.typeId === "wb:axex_equipment_a") {
                this.chainDiggingLogs(new Vector3(e.block), true);
            }
        });
        this.getEvents().exEvents.onceItemUseOn.subscribe(e => {
            if (e.item.typeId === "wb:technology_world_explorer") {
                this.sayTo(this.getExDimension().getBlock(e.blockLocation).typeId);
            }
        });
        this.getEvents().exEvents.itemUse.subscribe((e) => {
            const {
                item
            } = e;

            if (item.typeId == "wb:power") {
                if (!this.data.lang) {
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
                } else {
                    new MenuUIAlert(this.client, menuFunctionUI(this.getLang())).showPage("main", "notice");
                }
            } else if (item.typeId === "wb:jet_pack") {
                // jet pack
                this.player.addEffect(MinecraftEffectTypes.levitation, 7, 15, false);
                this.player.addEffect(MinecraftEffectTypes.slowFalling, 150, 3, false);

                this.exPlayer.getDimension().spawnEntity("wb:ball_jet_pack", ExGameVector3.getBlockLocation(this.exPlayer.getPosition().sub(this.exPlayer.getViewDirection().scl(2))));
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

            }
        });

    }
    chainDiggingLogs(v: Vector3, origin: boolean) {
        const dim = ExDimension.getInstance(this.getDimension());
        const id = ExDimension.getInstance(this.getDimension()).getBlock(v).typeId;
        if (id === MinecraftBlockTypes.log.id || id === MinecraftBlockTypes.log2.id || origin) {
            dim.digBlock(v);
            this.chainDiggingLogs(v.add(0, 1, 0), false);
            //this.chainDiggingLogs(v.sub(0,1,0).add(1,0,0),false);
            //v.sub(0,1,0);
        }
    }
    onLoaded(): void {
    }
    onLeave(): void {
    }

}