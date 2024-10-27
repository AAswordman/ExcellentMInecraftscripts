import { Entity } from "@minecraft/server";
import DecServer from "../DecServer.js";
import ExEntityController from "../../../modules/exmc/server/entity/ExEntityController.js";
import Vector3 from "../../../modules/exmc/utils/math/Vector3.js";
import ExTaskRunner from "../../../modules/exmc/server/ExTaskRunner.js";
import { MinecraftBlockTypes } from "../../../modules/vanilla-data/lib/index.js";
import { Objective } from "../../../modules/exmc/server/entity/ExScoresManager.js";
import GlobalSettings from "../../../pom/server/cache/GlobalSettings.js";
import ExGame from "../../../modules/exmc/server/ExGame.js";
import DecGlobal from "../DecGlobal.js";

export default class DecNukeController extends ExEntityController {
    constructor(e: Entity, server: DecServer) {
        super(e, server);
    }
    despawn() {
        this.entity.triggerEvent("minecraft:despawn");
    }
    override onSpawn(): void {
        super.onSpawn();
        if (!DecGlobal.isDec()) {
            if (!new GlobalSettings(new Objective("wpsetting")).nuclearBomb) {
                this.entity.remove();
                return;
            }
        }
        this.setTimeout(() => {
            const tmpV = new Vector3();
            // for (let i = 0; i <= 50; i += 10) {
            const i = 50;
            this.setTimeout(() => {
                const dim = this.exEntity.exDimension;
                const pos = this.entity.location;

                const blockMap = new Map<number, Vector3[]>();
                ExGame.runJob(function* () {
                    console.warn("start");
                    for (let x = -i; x <= i; x++) {
                        for (let y = -i; y <= i; y++) {
                            for (let z = -i; z <= i; z++) {
                                tmpV.set(x, y, z);
                                let len = Math.floor(tmpV.len());
                                if (blockMap.has(len)) {
                                    blockMap.get(len)!.push(tmpV.cpy());
                                } else {
                                    blockMap.set(len, (<Vector3[]>[tmpV.cpy()]));
                                }
                            }
                            dim.spawnParticle("dec:nuke_blast", pos);
                            yield void 0;
                        }
                    }
                    for (let x = 0; x <= i; x++) {
                        for (let v of blockMap.get(i) ?? []) {
                            dim.setBlock(tmpV.add(pos), MinecraftBlockTypes.Air)
                        }
                        yield void 0;
                        dim.spawnParticle("dec:nuke_blast", pos);
                    }


                });
            }, 3000);
            // }
        }, 10000);
    }
}