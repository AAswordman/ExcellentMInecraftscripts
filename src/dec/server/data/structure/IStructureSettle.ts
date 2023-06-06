import Vector3 from "../../../../modules/exmc/math/Vector3.js";
import { Dimension, MinecraftBlockTypes, Block } from '@minecraft/server';
import ExDimension from "../../../../modules/exmc/server/ExDimension";
import ExTaskRunner from "../../../../modules/exmc/server/ExTaskRunner.js";

export default class IStructureSettle {
    cmds: IStructureCommmand[] = [];
    block: Map<number, string> = new Map<number, string>();
    blockloads = new Map<string, number>();
    get length() {
        return this.cmds.length;
    }
    fill(s: [number, number, number], e: [number, number, number], blockName: string) {
        if (!this.blockloads.has(blockName)) {
            this.block.set(this.blockloads.size, blockName);
            this.blockloads.set(blockName, this.blockloads.size);
        }
        this.cmds.push({
            "start": s,
            "end": e,
            "blockId": this.blockloads.get(blockName) ?? 0
        })
    }
    set(s: [number, number, number], blockName: string) {
        if (!this.blockloads.has(blockName)) {
            this.block.set(this.blockloads.size, blockName);
            this.blockloads.set(blockName, this.blockloads.size);
        }
        this.cmds.push({
            "start": s,
            "blockId": this.blockloads.get(blockName) ?? 0
        })
    }
    run(dim: ExDimension, pos: Vector3) {
        const s = new Vector3(), e = new Vector3();
        let runner = new ExTaskRunner();
        const t = this;
        runner.run((function* () {
            for (let c of t.cmds) {
                s.set(...c.start);
                e.set(...(c.end ? c.end : c.start))
                if (c.end) e.sub(1);
                dim.fillBlocks(s, e, t.block.get(c.blockId) ?? MinecraftBlockTypes.air)
                yield true;
            }
            return false;
        }));

        runner.start(1, 5).then(() => {
            console.warn("over");
        });
    }
}

interface IStructureCommmand {
    start: [number, number, number];
    end?: [number, number, number];
    blockId: number;
}