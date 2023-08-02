import { Player, MinecraftItemTypes, MinecraftBlockTypes } from "@minecraft/server";
import Vector2 from "../modules/exmc/math/Vector2.js";
import Vector3 from "../modules/exmc/math/Vector3.js";
import ExStructureJigsaw from "../modules/exmc/server/block/structure/ExStructureJigsaw.js";
import ExGameClient from "../modules/exmc/server/ExGameClient.js";
import ExGameServer from "../modules/exmc/server/ExGameServer.js";
import Random from "../modules/exmc/utils/Random.js";


export default class CustomClient extends ExGameClient {
    constructor(server: ExGameServer, id: string, player: Player) {
        super(server, id, player);
    }

    override onJoin(): void {

    }

    override onLoad(): void {

    }

    override onLeave(): void {

    }
}