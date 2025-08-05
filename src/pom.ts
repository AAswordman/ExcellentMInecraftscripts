import PomServer from "./pom/server/PomServer.js";
import ExConfig from "./modules/exmc/ExConfig.js";
import DecServer from "./dec/server/DecServer.js";
import ExGame from "./modules/exmc/server/ExGame.js";
import eventNew from "./pom/subscribe/eventNew.js";
import bridge, { RemoteCtrlObject } from "./modules/interact/BridgeProtocol.js";

let config = new ExConfig();
config.addonName = "POM";
config.addonVersion = "1.10.0B2";
config.gameVersion = "1.20.0";
config.watchDog = false;
config.debug = true;

ExGame.createServer(PomServer, config);
ExGame.createServer(DecServer, config);
// ExGame.createServer(CustomServer, config);

ExGame.register("pomEvent", eventNew, config);