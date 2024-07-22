import ExEntitiesGetter from "../../interface/ExEntitiesGetter.js";
import Matrix4 from "../../utils/math/Matrix4.js";
import Vector3, { IVector3 } from "../../utils/math/Vector3.js";
import { Entity, EntityQueryOptions } from '@minecraft/server';
import { falseIfError } from "../../utils/tool.js";
import MathUtil from "../../utils/math/MathUtil.js";

export default class ExEntityQuery {
    private entities: Set<Entity> = new Set();
    //选区进行变换
    matrix = new Matrix4().idt();
    position: Vector3 = new Vector3();
    tmpV = new Vector3();
    constructor(public getter: ExEntitiesGetter) {
    }
    at(pos: IVector3) {
        this.position.set(pos);
        return this;
    }
    facingByDirection(dic: IVector3, dis: number) {
        this.position.add(this.tmpV.set(dic).normalize().scl(dis))
        return this;
    }
    facingByLTF(ltf: IVector3, dic: IVector3) {
        let mat = ExEntityQuery.getFacingMatrix(dic);
        this.position.add(mat.rmulVector(this.tmpV.set(ltf)));
        return this;
    }
    static getFacingMatrix(dic: IVector3) {
        let forz = new Vector3(dic).normalize();
        if (forz.y === 1 || forz.y === -1) {
            throw new SyntaxError("can find the matrix");
        }
        let x = Vector3.up.crs(dic).normalize();
        let z = forz;
        let y = z.crs(x).normalize();

        let mat = new Matrix4(
            x.x, y.x, z.x, 0,
            x.y, y.y, z.y, 0,
            x.z, y.z, z.z, 0,
            0, 0, 0, 1
        );
        return mat;
    }
    setMatrix(mat: Matrix4) {
        this.matrix = mat;
        return this;
    }
    editMatrix(func: (mat: Matrix4) => void) {
        func(this.matrix);
        return this;
    }
    editPosition(func: (pos: Vector3) => void) {
        func(this.position);
        return this;
    }
    query(entityQueryOptions: EntityQueryOptions = {}) {
        entityQueryOptions.location = this.position;
        for (let e of this.getter.getEntities(entityQueryOptions)) {
            this.add(e);
        }
        return this;
    }
    queryBox(xyz: IVector3, entityQueryOptions: EntityQueryOptions = {}) {
        return this.queryBall(Math.sqrt(xyz.x ** 2 + xyz.y ** 2 + xyz.z ** 2) / 2, entityQueryOptions).filterBox(xyz);
    }
    queryBall(r: number, entityQueryOptions: EntityQueryOptions = {}) {
        entityQueryOptions.maxDistance = r;
        return this.query(entityQueryOptions);
    }
    queryCircle(r: number, h: number, entityQueryOptions: EntityQueryOptions = {}) {
        return this.queryBall(Math.sqrt(r ** 2 + (h / 2) ** 2), entityQueryOptions).filterCircle(r, h);
    }
    querySector(r: number, h: number, dic: IVector3, angleMax: number, angleMin: number = 0, entityQueryOptions: EntityQueryOptions = {}) {
        return this.queryBall(Math.sqrt(r ** 2 + (h / 2) ** 2), entityQueryOptions).filterSector(r, h, dic, angleMax, angleMin);
    }
    queryPolygon(points: [IVector3, IVector3, IVector3], h: number, entityQueryOptions: EntityQueryOptions = {}) {
        return this.queryCircle(points.reduce((max, cur) => Math.max(max, Math.sqrt((cur.x - this.position.x) ** 2 + (cur.z - this.position.z) ** 2)), 0),
            h, entityQueryOptions).filterPolygon(points, h);
    }

    clear() {
        this.entities.clear();
    }
    forEach(callbackfn: (value: Entity) => void, thisArg?: any) {
        this.entities.forEach(callbackfn);
    }
    *[Symbol.iterator]() {
        for (let e of this.entities) {
            yield e;
        }
    }


    getEntities() {
        return Array.from(this.entities.values());
    }
    static isPointInsidePolygon(x: number, z: number, points: [IVector3, IVector3, IVector3]): boolean {
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const xi = points[i].x;
            const zi = points[i].z;
            const xj = points[j].x;
            const zj = points[j].z;

            const intersect = ((zi > z) !== (zj > z)) && (x < ((xj - xi) * (z - zi)) / (zj - zi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    filter(func: (e: Entity, relativePos: Vector3) => boolean) {
        let remains = new Set(this.entities)
        let fmat = this.matrix.cpy().invert();
        remains.forEach(e => {
            let v = new Vector3(e.location).sub(this.position);
            fmat.rmulVector(v);
            if (!falseIfError(() => e.isValid()) || !func(e, v)) this.except(e);
        })
        return this;
    }
    filterBox(xyz: IVector3) {
        return this.filter((e, relativePos) => Math.abs(relativePos.x) <= xyz.x &&
            Math.abs(relativePos.y) <= xyz.y &&
            Math.abs(relativePos.z) <= xyz.z);
    }
    filterPolygon(points: [IVector3, IVector3, IVector3], h: number) {
        return this.filter((e, relativePos) => ExEntityQuery.isPointInsidePolygon(relativePos.x, relativePos.z, points)
            && Math.abs(relativePos.y) <= h);
    }
    filterCircle(r: number, h: number) {
        return this.filter((e, relativePos) => relativePos.len() < r
            && Math.abs(relativePos.y) <= h);
    }
    filterBall(r: number) {
        return this.filter((e, relativePos) => (relativePos.len()) <= r);
    }
    filterSector(r: number, h: number, dic: IVector3, angleMax: number, angleMin: number = 0) {
        return this.filter((e, relativePos) => {
            let angle = Math.abs(MathUtil.IEEEremainder(this.tmpV.set(dic).rotateAngleX() - this.tmpV.set(relativePos).rotateAngleX(), 360));
            return relativePos.len() <= r
                && Math.abs(relativePos.y) <= h
                && angle >= angleMin
                && angle <= angleMax
        });
    }

    diffrence(other: ExEntityQuery) {
        other.entities.forEach(e => {
            this.except(e);
        });
        return this;
    }
    except(entity: Entity) {
        this.entities.delete(entity);
        return this;
    }
    add(entity: Entity) {
        this.entities.add(entity);
        return this;
    }
    merge(other: ExEntityQuery) {
        other.entities.forEach(e => {
            this.entities.add(e);
        });
        return this;
    }
}
