/**
 * All possible MinecraftDimensionTypes
 */
export declare enum MinecraftDimensionTypes {
    Nether = "minecraft:nether",
    Overworld = "minecraft:overworld",
    TheEnd = "minecraft:the_end"
}
/**
 * Union type equivalent of the MinecraftDimensionTypes enum.
 */
export declare type MinecraftDimensionTypesUnion = keyof typeof MinecraftDimensionTypes;
