import { Entity } from "@minecraft/server";
import ExEntityController from "./ExEntityController.js";

export default class ExEntityPool{
    public static pool: WeakMap<Entity, ExEntityController> = new WeakMap();

}