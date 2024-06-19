import { Entity, EntityQueryOptions } from "@minecraft/server";

export default interface ExEntitiesGetter {
    getEntities(entityQueryOptions?: EntityQueryOptions): Iterable<Entity>;
}