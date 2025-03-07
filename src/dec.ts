import DecServer from './dec/server/DecServer.js';
import ExConfig from './modules/exmc/ExConfig.js';
import ExGame from './modules/exmc/server/ExGame.js';
import eventNew from './pom/subscribe/eventNew.js';


let config = new ExConfig();
config.addonName = "DEC";
config.addonVersion = "1.0.0";
config.gameVersion = "1.9.70";
config.watchDog = false;
config.debug = true;
ExGame.createServer(DecServer,config);
ExGame.register("pomEvent",eventNew,config);
