import { Dimension, EntityQueryOptions, Block, ItemStack, Entity, BlockType, ExplosionOptions, MolangVariableMap, BlockPropertyType, MinecraftBlockTypes } from '@minecraft/server';
import { ExCommandNativeRunner } from '../interface/ExCommandRunner.js';
import Vector3, { IVector3 } from "../math/Vector3.js";
import ExGameConfig from './ExGameConfig.js';
import ExGameVector3 from './math/ExGameVector3.js';
import ExCommand from './env/ExCommand.js';

export default class ExDimension implements ExCommandNativeRunner {
    public command = new ExCommand(this);

    spawnParticle(p: string, v: IVector3) {
        this._dimension.spawnParticle(p, v, new MolangVariableMap())
    }
    createExplosion(location: IVector3, radius: number, explosionOptions?: ExplosionOptions): void {
        //console.warn(location, radius, explosionOptions);
        this._dimension.createExplosion(location, radius, explosionOptions);
    }

    private _dimension: Dimension;

    get dimension() {
        return this._dimension;
    }

    constructor(dimension: Dimension) {
        this._dimension = dimension;
    }

    getPlayers(entityQueryOptions?: EntityQueryOptions) {
        return Array.from(this._dimension.getPlayers(entityQueryOptions));
    }

    getEntities(entityQueryOptions?: EntityQueryOptions) {
        let entities = this._dimension.getEntities(entityQueryOptions);
        let res: Entity[] = [];
        for (let entity of entities) {
            if (entity.dimension === this._dimension) res.push(entity);
        }
        return res;
    }
    getBlock(vec: IVector3) {
        return this._dimension.getBlock(vec);
    }
    setBlock(vec: IVector3, blockId: string | BlockType) {
        if (typeof blockId === "string") blockId = MinecraftBlockTypes.get(blockId);

        let b = this.getBlock(vec);
        b?.setType(blockId);
        //b?.permutation;

    }
    setBlockAsync(vec: IVector3, blockId: string) {
        this.runCommandAsync(`setBlock ${vec.x} ${vec.y} ${vec.z} ${blockId}`);

    }
    digBlock(vec: IVector3) {
        try {
            this.command.run(`setBlock ${vec.x} ${vec.y} ${vec.z} air [] destroy`);
            return true;
        } catch (e) {
            return false;
        }
    }
    spawnItem(item: ItemStack, v: IVector3) {
        try {
            return this._dimension.spawnItem(item, v)
        } catch (error) {
            ExGameConfig.console.warn(error);
            return undefined;
        };
    }

    spawnEntity(id: string, v: IVector3) {
        try {
            return this._dimension.spawnEntity(id, v);
        } catch (error) {
            ExGameConfig.console.warn(error);
            return undefined;
        }
    }

    runCommandAsync(str: string) {
        return this._dimension.runCommandAsync(str);
    }

    static propertyNameCache = "exCache";
    static getInstance(source: Dimension): ExDimension {
        let dimension = <any>source;
        if (this.propertyNameCache in dimension) {
            return dimension[this.propertyNameCache];
        }
        return (dimension[this.propertyNameCache] = new ExDimension(dimension));
    }

}