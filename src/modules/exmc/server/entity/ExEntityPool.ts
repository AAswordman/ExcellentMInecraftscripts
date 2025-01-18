import ExEntityController from "./ExEntityController.js";

export default class ExEntityPool{
    public static pool: Map<string, ExEntityController> = new Map();

}