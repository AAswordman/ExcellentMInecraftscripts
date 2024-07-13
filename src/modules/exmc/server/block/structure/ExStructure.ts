import Vector3 from '../../../utils/math/Vector3.js';
import { Dimension, StructureMirrorAxis, StructureRotation, world } from '@minecraft/server';
import Vector2 from '../../../utils/math/Vector2.js';
import ExDimension from '../../ExDimension.js';
import { to } from '../../ExErrorQueue.js';
export default class ExStructure {
    structureId: string;
    mirror: StructureMirrorAxis = StructureMirrorAxis.None;
    position: Vector3;
    rotation: number;

    constructor(id: string, pos: Vector3, rotation = 0) {
        this.structureId = id;
        this.position = pos;
        this.rotation = rotation;
    }
    generate(dim: Dimension) {
        let opi = {
            rotation: ({
                "0": StructureRotation.None,
                "90": StructureRotation.Rotate90,
                "180": StructureRotation.Rotate180,
                "270": StructureRotation.Rotate270
            }
            )[this.rotation + ""],

            mirror: this.mirror
        }
        world.structureManager.place(this.structureId, dim, this.position, opi);
    }
}