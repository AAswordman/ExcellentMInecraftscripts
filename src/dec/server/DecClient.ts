import { EffectType, MinecraftEffectTypes, Player } from "@minecraft/server";
import ExGameClient from "../../modules/exmc/server/ExGameClient.js";
import ExGameServer from "../../modules/exmc/server/ExGameServer.js";
import { ArmorData,ArmorPlayerDec } from "./items/ArmorData.js";
import MathUtil from "../../modules/exmc/math/MathUtil.js";
import Vector3 from "../../modules/exmc/math/Vector3.js";
import ExGameVector3 from "../../modules/exmc/server/math/ExGameVector3.js";
import DecGlobal from "./DecGlobal.js";


export default class DecClient extends ExGameClient {
    useArmor: undefined | ArmorData = undefined;
    constructor(server: ExGameServer, id: string, player: Player) {
        super(server, id, player);

    }

    tmpV = new Vector3(0, 0, 0);
    override onJoin(): void {
        super.onJoin();
        this.getEvents().exEvents.playerHurt.subscribe(e => {
            let ra = MathUtil.randomInteger(1, 100);
            //鲁伯特套装受伤效果
            if (1 <= ra && ra <= 20) {
                if (this.useArmor === ArmorPlayerDec.rupert) {
                    this.player.addEffect(MinecraftEffectTypes.regeneration, 10 * 20);
                    this.player.addEffect(MinecraftEffectTypes.speed, 5 * 20);
                    this.tmpV.set(this.player.location).add(0, 1, 0);
                    this.getExDimension().spawnParticle("dec:tear_from_rupert", this.tmpV);
                    this.getExDimension().spawnParticle("dec:tear_from_rupert", this.tmpV);
                    this.getExDimension().spawnParticle("dec:tear_from_rupert", this.tmpV);
                    this.getExDimension().spawnParticle("dec:tear_from_rupert", this.tmpV);
                    this.getExDimension().spawnParticle("dec:tear_from_rupert", this.tmpV);
                }
            }
            //岩浆套受伤效果
            if (this.useArmor === ArmorPlayerDec.lava) {
                this.tmpV.set(this.player.location).add(0, 1, 0);
                this.getExDimension().spawnParticle("dec:fire_spurt_particle", this.tmpV);
                this.player.addEffect(MinecraftEffectTypes.fireResistance, 4 * 20);
            }

            //哭泣套受伤效果
            if (this.useArmor === ArmorPlayerDec.crying) {
                if (ra < 1) {

                } else if (1 <= ra && ra <= 10) {
                    this.player.addEffect(MinecraftEffectTypes.weakness, 5 * 20);
                } else if (ra <= 20) {
                    this.player.addEffect(MinecraftEffectTypes.slowness, 4 * 20);
                } else if (ra <= 30) {
                    this.player.addEffect(MinecraftEffectTypes.blindness, 5 * 20);
                } else if (ra <= 40) {
                    this.player.addEffect(MinecraftEffectTypes.nausea, 7 * 20);
                }
            }

            //永冬套受伤效果
            if (1 <= ra && ra <= 12) {
                if (this.useArmor === ArmorPlayerDec.everlasting_winter) {
                    for (let e of this.getDimension().getEntities({
                        "maxDistance": 5,
                        "location": ExGameVector3.getLocation(this.player.location)
                    })) {
                        if (e != this.player) {
                            e.addEffect(MinecraftEffectTypes.slowness, 3 * 20, 1);
                        }
                    }
                    this.player.addEffect(MinecraftEffectTypes.healthBoost, 30 * 20, 0);
                    this.tmpV.set(this.player.location);
                    this.getExDimension().spawnParticle("dec:everlasting_winter_spurt_particle", this.tmpV);
                }
            }


            if(!DecGlobal.isDec()){
                
            }
        });
    }

    async checkArmor() {
        return this.useArmor ? (await this.useArmor.detect(this.exPlayer)) : undefined;
    }
    chooseArmor(a: ArmorData) {
        this.useArmor = a;
    }

    override onLoaded(): void {
        super.onLoaded();
    }

    override onLeave(): void {
        super.onLeave();
    }
}