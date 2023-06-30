import { DynamicPropertiesDefinition, Entity, MinecraftEntityTypes, PropertyRegistry, system, world } from '@minecraft/server';
import { Serialize } from '../../../utils/Serialize.js';
import Random from '../../../utils/Random.js';
import GZIPUtil from '../../../utils/GZIPUtil.js';
import ExGameConfig from '../../ExGameConfig.js';

const cutLength = 980;
world.afterEvents.worldInitialize.subscribe((e) => {
    let def = new DynamicPropertiesDefinition().defineString("__cache0:", 980)
        .defineString("__cache1:", cutLength)
        .defineString("__cache2:", cutLength)
        .defineString("__cache3:", cutLength);
    e.propertyRegistry.registerEntityTypeDynamicProperties(def, MinecraftEntityTypes.player);
});

export default class EntityPropCache<T>{
    cache!: T;
    tagFrom!: string;
    entity: Entity;
    constructor(entity: Entity) {
        this.entity = entity;

    }
    load() {
        let tag = this._getStringCache();
        if (tag !== undefined && tag !== "") {
            try {
                tag = GZIPUtil.unzipString(tag);
            } catch (e) {
                return undefined;
            }
            this.tagFrom = tag;
            return tag;
        }
        return undefined;
    }
    get(def: T) {
        if (this.cache) {
            return this.cache;
        } else {
            let res = this.load();
            if (!res) {
                this.cache = def;
                this.tagFrom = JSON.stringify(this.cache);
                this._setStringCache(this.tagFrom);
                return def;
            } else {
                this.cache = Serialize.from(res, def);
                return this.cache;
            }
        }

    }
    save() {
        let nfrom = Serialize.to(this.cache);
        if (nfrom !== this.tagFrom) {
            let m = GZIPUtil.zipString(nfrom)
            this._setStringCache( m);
            // ExGameConfig.console.info("setDynamicProperty len "+m.length);
            // ExGameConfig.console.info("setDynamicO len "+nfrom.length);
            this.tagFrom = nfrom;
        }

    }

    _getStringCache() {
        return (this.entity.getDynamicProperty("__cache0:") as string ?? "") + (this.entity.getDynamicProperty("__cache1:") as string ?? "")
            + (this.entity.getDynamicProperty("__cache2:") as string ?? "") + (this.entity.getDynamicProperty("__cache3:") as string ?? "");
    }
    _setStringCache(str: string) {
        for (let i = 0; i < 4; i++) {
            let start = i * cutLength, end = (i + 1) * cutLength;
            let is = str.substring(Math.min(start, str.length), Math.min(end, str.length));
            this.entity.setDynamicProperty("__cache" + i + ":", is);
        }
    }
}
