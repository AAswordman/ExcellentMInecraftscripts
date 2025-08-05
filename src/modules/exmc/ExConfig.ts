import { gameContext } from "./server/ExGame.js";

export default class ExConfig {
    addonName = "";
    gameVersion = "1.9.20";
    addonVersion = "1.10.0B2";
    debug = false;
    watchDog = false;
    gameContext = gameContext;
}