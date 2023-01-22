import Vector3 from "../../../../modules/exmc/math/Vector3.js";

export default class RuinsLoaction {
    public static readonly DESERT_RUIN_NUM = 0;
    public static readonly DESERT_RUIN_LOCATION_START = new Vector3(16384, 64, 16384);
    public static readonly DESERT_RUIN_LOCATION_SIZE = new Vector3(512, 191, 512);
    public static readonly DESERT_RUIN_LOCATION_END = this.DESERT_RUIN_LOCATION_START.clone().add(this.DESERT_RUIN_LOCATION_SIZE);
    public static readonly DESERT_RUIN_LOCATION_CENTER = this.DESERT_RUIN_LOCATION_START.clone().add(this.DESERT_RUIN_LOCATION_SIZE.x / 2, 0, this.DESERT_RUIN_LOCATION_SIZE.z / 2);

    public static readonly STONE_RUIN_NUM = 1;
    public static readonly STONE_RUIN_LOCATION_START = new Vector3(15360, 64, 15360);
    public static readonly STONE_RUIN_LOCATION_SIZE = new Vector3(128, 128, 128);
    public static readonly STONE_RUIN_LOCATION_END = this.STONE_RUIN_LOCATION_START.clone().add(this.STONE_RUIN_LOCATION_SIZE);
    public static readonly STONE_RUIN_LOCATION_CENTER = this.STONE_RUIN_LOCATION_START.clone().add(this.STONE_RUIN_LOCATION_SIZE.x / 2, 0, this.STONE_RUIN_LOCATION_SIZE.z / 2);
}