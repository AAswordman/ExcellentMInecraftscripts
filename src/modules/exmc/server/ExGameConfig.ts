import { world } from '@minecraft/server';
import ExConfig from '../ExConfig.js';
import { MinecraftDimensionTypes } from '../../vanilla-data/lib/index.js';

export default class ExGameConfig{
    static config: ExConfig;

    static async runCommandAsync(str: string) {
        try {
            return world.getDimension(MinecraftDimensionTypes.Overworld).runCommandAsync(str);
        } catch (e) {
            console.error("Console error:", e);
        }
    }
    static runCommand(str: string) {
        return world.getDimension(MinecraftDimensionTypes.Overworld).runCommand(str);
    }
}