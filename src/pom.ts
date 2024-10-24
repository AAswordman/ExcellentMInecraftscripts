import PomServer from "./pom/server/PomServer.js";
import ExConfig from "./modules/exmc/ExConfig.js";
import DecServer from "./dec/server/DecServer.js";
import ExGame from "./modules/exmc/server/ExGame.js";
import { BlockPermutation, world } from "@minecraft/server";
import eventNew from "./pom/subscribe/eventNew.js";
let config = new ExConfig();
config.addonName = "POM";
config.addonVersion = "1.9.0B5";
config.gameVersion = "1.20.0";
config.watchDog = false;
config.debug = true;

ExGame.createServer(PomServer, config);
ExGame.createServer(DecServer, config);

ExGame.register("pomEvent",eventNew);