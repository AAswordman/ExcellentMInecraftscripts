import PomServer from "./pom/server/PomServer.js";
import ExConfig from "./modules/exmc/ExConfig.js";
import DecServer from "./dec/server/DecServer.js";
import ExGame from "./modules/exmc/server/ExGame.js";
import eventNew from "./pom/subscribe/eventNew.js"; 
import { bridge, RemoteCtrlObject } from "./modules/interact/BridgeProtocol.js";
import ExErrorQueue from "./modules/exmc/server/ExErrorQueue.js";
import { to } from './modules/exmc/server/ExErrorQueue';

let config = new ExConfig();
config.addonName = "POM";
config.addonVersion = "1.9.1R2";
config.gameVersion = "1.20.0";
config.watchDog = false;
config.debug = true;

ExGame.createServer(PomServer, config);
ExGame.createServer(DecServer, config);

ExGame.register("pomEvent", eventNew);


class Tester implements RemoteCtrlObject{
    __remote: true = true;
    public add(a: number, b: number){
        return a + b;
    }
    pi = 3.14;
}

let exportTest = {
    exportId:"",
    "newTester":() => {
        return new Tester();
    }
}

function newTester(){
    return new Tester();
}
bridge.exportFunctions = newTester;



to(bridge.solve(exportTest).newTester().then((e) => {
    e.add(1,2).then(num => console.warn("RES:1+2="+num));
    e.pi.then(pi => console.warn("RES:PI="+pi));
    console.warn(1111)
}))