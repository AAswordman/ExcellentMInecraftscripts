import { world, MinecraftDimensionTypes } from '@minecraft/server';
import ExConfig from '../ExConfig.js';
import GameConsole from '../interface/GameConsole.js';

export default class ExGameConfig{
    static config: ExConfig;

    static async runCommandAsync(str: string) {
        try {
            return world.getDimension(MinecraftDimensionTypes.overworld).runCommandAsync(str);
        } catch (e) {
            console.error("Console error:", e);
        }
    }
    static runCommand(str: string) {
        return world.getDimension(MinecraftDimensionTypes.overworld).runCommand(str);
    }
}