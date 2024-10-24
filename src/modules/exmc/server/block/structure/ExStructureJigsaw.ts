import Vector3 from '../../../utils/math/Vector3.js';
import { Dimension, StructureMirrorAxis } from '@minecraft/server';
import ExStructure from './ExStructure.js';

/**
 * 表示一个Jigsaw结构，用于管理多个结构块的拼接。
 */
export default class ExStructureJigsaw {
    /**
     * 结构的宽度。
     */
    width: number;

    /**
     * 结构的高度。
     */
    height: number;

    /**
     * 存储Jigsaw数据的三维数组。
     */
    jigsawData: (number | ExStructureData | undefined)[][][];

    /**
     * 每个网格的大小。
     */
    size: number;

    /**
     * 表示继续结构的常量。
     */
    private static readonly ContinueStructure = 1;

    /**
     * 构造一个新的ExStructureJigsaw实例。
     * @param gridSize 网格的大小。
     * @param gridWidthNum 宽度方向上的网格数量。
     * @param gridHeightNum 高度方向上的网格数量，默认为1。
     */
    constructor(girdSize: number, gridWidthNum: number, gridHeightNum: number = 1) {
        this.width = gridWidthNum;
        this.height = gridHeightNum;
        this.size = girdSize;

        this.jigsawData = Array.from(new Array(this.height), () => Array.from(new Array(this.width), () => new Array<number | undefined | ExStructureData>(this.width)));
    }

    /**
     * 检查指定位置是否为空。
     * @param x X坐标。
     * @param z Z坐标。
     * @param y Y坐标，默认为0。
     * @returns 如果指定位置为空，则返回true，否则返回false。
     */
    isEmpty(x: number, z: number): boolean;
    isEmpty(x: number, z: number, y: number): boolean;
    isEmpty(a: number, b: number, c: number = 0): boolean {
        return this.jigsawData[c][b][a] === undefined;
    }

    /**
     * 设置一个平面结构。
     * @param x X坐标。
     * @param z Z坐标。
     * @param offsetX 结构的X偏移量。
     * @param offsetY 结构的Y偏移量。
     * @param offsetZ 结构的Z偏移量。
     * @param structureName 结构的名称。
     * @param structureRot 结构的旋转角度，默认为0。
     * @param mirror 结构的镜像轴，默认为None。
     * @param coverGridLength 覆盖的网格长度，默认为1。
     * @param coverGridWidth 覆盖的网格宽度，默认为1。
     */
    setStructurePlane(x: number, z: number, offsetX: number, offsetY: number, offsetZ: number, structureName: string, structureRot = 0, mirror: StructureMirrorAxis = StructureMirrorAxis.None, coverGridLength = 1, coverGridWidth = 1) {
        this.setStructure(x, z, 0, offsetX, offsetY, offsetZ, structureName, structureRot, mirror, coverGridLength, coverGridWidth, 1);
    }

    /**
     * 设置一个结构。
     * @param x X坐标。
     * @param z Z坐标。
     * @param y Y坐标。
     * @param offsetX 结构的X偏移量。
     * @param offsetY 结构的Y偏移量。
     * @param offsetZ 结构的Z偏移量。
     * @param structureName 结构的名称。
     * @param structureRot 结构的旋转角度，默认为0。
     * @param mirror 结构的镜像轴，默认为None。
     * @param coverGridLength 覆盖的网格长度，默认为1。
     * @param coverGridWidth 覆盖的网格宽度，默认为1。
     * @param coverGridHeight 覆盖的网格高度，默认为1。
     */
    setStructure(x: number, z: number, y: number, offsetX: number, offsetY: number, offsetZ: number, structureName: string, structureRot = 0, mirror: StructureMirrorAxis = StructureMirrorAxis.None, coverGridLength = 1, coverGridWidth = 1, coverGridHeight = 1) {
        this.clearStructure(x, z, y);
        for (let ix = x; ix < coverGridLength + x; ix++) {
            for (let iz = z; iz < coverGridWidth + z; iz++) {
                for (let iy = y; iy < coverGridHeight + y; iy++) {
                    if (!this.isEmpty(ix, iz, iy)) {
                        throw new Error("Structure already contains " + ix + " , " + iy + " , " + iz);
                    }
                }
            }
        }
        for (let ix = x; ix < coverGridLength + x; ix++) {
            for (let iz = z; iz < coverGridWidth + z; iz++) {
                for (let iy = y; iy < coverGridHeight + y; iy++) {
                    this.jigsawData[iy][iz][ix] = ExStructureJigsaw.ContinueStructure;
                }
            }
        }
        this.jigsawData[y][z][x] = [offsetX, offsetY, offsetZ, structureName, structureRot, mirror, coverGridLength, coverGridWidth, coverGridHeight];
    }

    /**
     * 填充整个结构。
     * @param offsetX 结构的X偏移量。
     * @param offsetY 结构的Y偏移量。
     * @param offsetZ 结构的Z偏移量。
     * @param structureName 结构的名称。
     * @param structureRot 结构的旋转角度，默认为0。
     * @param mirror 结构的镜像轴，默认为None。
     * @param coverGridLength 覆盖的网格长度，默认为1。
     * @param coverGridWidth 覆盖的网格宽度，默认为1。
     * @param coverGridHeight 覆盖的网格高度，默认为1。
     */
    fillStructure(offsetX: number, offsetY: number, offsetZ: number, structureName: string, structureRot = 0, mirror: StructureMirrorAxis = StructureMirrorAxis.None, coverGridLength = 1, coverGridWidth = 1, coverGridHeight = 1) {
        const i: ExStructureData = [offsetX, offsetY, offsetZ, structureName, structureRot, mirror, coverGridLength, coverGridWidth, coverGridHeight];
        for (let ix = 0; ix < this.width; ix++) {
            for (let iz = 0; iz < this.width; iz++) {
                for (let iy = 0; iy < this.height; iy++) {
                    this.jigsawData[iy][iz][ix] = i;
                }
            }
        }
    }

    /**
     * 获取指定位置的结构。
     * @param x X坐标。
     * @param z Z坐标。
     * @param y Y坐标。
     * @returns 返回结构的数据，如果不存在则返回undefined。
     */
    getStructure(x: number, z: number, y: number) {
        const base = this.findBaseStructure(x, z, y);
        if (base === undefined) {
            return undefined;
        }
        const s = this.jigsawData[base[0]][base[1]][base[2]];
        if (s instanceof Array) {
            return new ExStructureExportData(...s);
        } else {
            return undefined;
        }
    }

    /**
     * 清除指定位置的结构。
     * @param x X坐标。
     * @param z Z坐标。
     * @param y Y坐标，默认为0。
     */
    clearStructure(x: number, z: number): void;
    clearStructure(x: number, z: number, y: number): void;
    clearStructure(a: number, b: number, c: number = 0) {
        const pos = this.findBaseStructure(a, b, c);
        if (pos !== undefined) {
            const [x, z, y] = pos;
            const stc = this.jigsawData[y][z][x];
            if (stc !== undefined) {
                if (typeof (stc) === "number") {
                    throw new Error("Error clearing");
                } else {
                    for (let ix = 0; ix < stc[6]; ix++) {
                        for (let iz = 0; iz < stc[7]; iz++) {
                            for (let iy = 0; iy < stc[8]; iy++) {
                                this.jigsawData[iy + c][iz + b][ix + a] = undefined;
                            }
                        }
                    }
                }
            }
        }
    }

        /**
     * 查找基础结构的位置。
     * @param x X坐标。
     * @param z Z坐标。
     * @param y Y坐标，默认为0。
     * @returns 返回基础结构的位置，如果不存在则返回undefined。
     */
    findBaseStructure(x: number, z: number): [number, number, number] | undefined;
    findBaseStructure(x: number, z: number, y: number): [number, number, number] | undefined;
    findBaseStructure(a: number, b: number, c: number = 0) {
        let point = this.jigsawData[c][b][a];
        if (point !== undefined) {
            if (point === ExStructureJigsaw.ContinueStructure) {
                while (point === ExStructureJigsaw.ContinueStructure && c > 0) {
                    point = this.jigsawData[c--][b][a]
                }
                while (point === ExStructureJigsaw.ContinueStructure && b > 0) {
                    point = this.jigsawData[c][b--][a]
                }
                while (point === ExStructureJigsaw.ContinueStructure && a > 0) {
                    point = this.jigsawData[c][b][a--]
                }
                return [a, b, c];
            } else {
                return [a, b, c];
            }
        } else {
            return undefined;
        }
    }

    /**
     * 获取结构的总宽度。
     * @returns 返回结构的总宽度。
     */
    getWidth() {
        return this.size * this.width;
    }

    /**
     * 获取结构的总高度。
     * @returns 返回结构的总高度。
     */
    getHeight() {
        return this.size * this.height;
    }

    /**
     * 在指定的世界位置生成结构。
     * @param worldX 世界X坐标。
     * @param worldY 世界Y坐标。
     * @param worldZ 世界Z坐标。
     * @param dim 维度。
     */
    generate(worldX: number, worldY: number, worldZ: number, dim: Dimension) {
        let structure = new ExStructure("", new Vector3(), 0);
        this.jigsawData.forEach((arr0, y) => {
            arr0.forEach((arr1, z) => {
                arr1.forEach((v, x) => {
                    if (typeof v !== "number" && v !== undefined) {
                        structure.position.set(worldX + x * this.size + v[0], worldY + y * this.size + v[1], worldZ + z * this.size + v[2]);
                        structure.structureId = v[3];
                        structure.rotation = v[4];
                        structure.mirror = v[5];
                        structure.generate(dim);
                    }
                });
            });
        });
    }

    /**
     * 返回对象的字符串表示形式。
     * @returns 返回对象的字符串表示形式。
     */
    [Symbol.toStringTag]() {
        return "symbol";
    }

    /**
     * 遍历所有结构并执行回调函数。
     * @param fun 回调函数，接受结构数据和坐标作为参数。
     */
    foreach(fun: (data: ExStructureExportData, x: number, z: number, y: number) => void) {
        const data = new ExStructureExportData(0, 0, 0, "", 0, StructureMirrorAxis.None, 1, 1, 1);
        for (let y = 0; y < this.height; y++) {
            for (let z = 0; z < this.width; z++) {
                for (let x = 0; x < this.width; x++) {
                    let d = this.jigsawData[y][z][x];
                    if (d instanceof Array) {
                        data.set(...d);
                        fun(data, x, z, y);
                    }
                }
            }
        }
    }
}

/**
 * 表示结构数据的类型。
 * @typedef {Array} ExStructureData
 * @property {number} offsetX - X偏移量。
 * @property {number} offsetY - Y偏移量。
 * @property {number} offsetZ - Z偏移量。
 * @property {string} structureName - 结构名称。
 * @property {number} structureRot - 结构旋转角度。
 * @property {StructureMirrorAxis} mirror - 结构镜像轴。
 * @property {number} coverGridLength - 覆盖的网格长度。
 * @property {number} coverGridWidth - 覆盖的网格宽度。
 * @property {number} coverGridHeight - 覆盖的网格高度。
 */
export type ExStructureData = [number, number, number, string, number, StructureMirrorAxis, number, number, number];

/**
 * 表示导出的结构数据。
 */
export class ExStructureExportData {
    /**
     * X偏移量。
     */
    offsetX!: number;

    /**
     * Y偏移量。
     */
    offsetY!: number;

    /**
     * Z偏移量。
     */
    offsetZ!: number;

    /**
     * 结构名称。
     */
    structureName!: string;

    /**
     * 结构旋转角度。
     */
    structureRot!: number;

    /**
     * 结构镜像轴。
     */
    mirror!: StructureMirrorAxis;

    /**
     * 覆盖的网格长度。
     */
    coverGridLength!: number;

    /**
     * 覆盖的网格宽度。
     */
    coverGridWidth!: number;

    /**
     * 覆盖的网格高度。
     */
    coverGridHeight!: number;

    /**
     * 构造一个新的ExStructureExportData实例。
     * @param offsetX X偏移量。
     * @param offsetY Y偏移量。
     * @param offsetZ Z偏移量。
     * @param structureName 结构名称。
     * @param structureRot 结构旋转角度。
     * @param mirror 结构镜像轴。
     * @param coverGridLength 覆盖的网格长度。
     * @param coverGridWidth 覆盖的网格宽度。
     * @param coverGridHeight 覆盖的网格高度。
     */
    constructor(offsetX: number, offsetY: number, offsetZ: number, structureName: string, structureRot: number, mirror: StructureMirrorAxis, coverGridLength: number, coverGridWidth: number, coverGridHeight: number) {
        this.set(offsetX, offsetY, offsetZ, structureName, structureRot, mirror, coverGridHeight, coverGridWidth, coverGridLength);
    }

    /**
     * 设置结构数据。
     * @param offsetX X偏移量。
     * @param offsetY Y偏移量。
     * @param offsetZ Z偏移量。
     * @param structureName 结构名称。
     * @param structureRot 结构旋转角度。
     * @param mirror 结构镜像轴。
     * @param coverGridHeight 覆盖的网格高度。
     * @param coverGridWidth 覆盖的网格宽度。
     * @param coverGridLength 覆盖的网格长度。
     */
    set(offsetX: number, offsetY: number, offsetZ: number, structureName: string, structureRot: number, mirror: StructureMirrorAxis, coverGridHeight: number, coverGridWidth: number, coverGridLength: number) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.offsetZ = offsetZ;
        this.structureName = structureName;
        this.structureRot = structureRot;
        this.mirror = mirror;
        this.coverGridHeight = coverGridHeight;
        this.coverGridWidth = coverGridWidth;
        this.coverGridLength = coverGridLength;
    }
}