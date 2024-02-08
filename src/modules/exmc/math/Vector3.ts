
import Matrix4 from './Matrix4.js';

export default class Vector3 {

    public static readonly down = new Vector3(0, -1, 0);
    public static readonly forward = new Vector3(0, 0, 1);
    public static readonly back = new Vector3(0, 0, -1);
    public static readonly left = new Vector3(-1, 0, 0);
    public static readonly one = new Vector3(1, 1, 1);
    public static readonly right = new Vector3(1, 0, 0);
    public static readonly up = new Vector3(0, 1, 0);
    public static readonly zero = new Vector3(0, 0, 0);
    constructor()
    constructor(v: IVector3)
    constructor(x: number, y: number, z: number)
    constructor(a?: any, b?: any, c?: any) {
        if (typeof a === "number" && typeof b === "number" && typeof c === "number") {
            this.x = a;
            this.y = b;
            this.z = c;
        } else if (a === undefined && b === undefined && c === undefined) {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        } else {
            this.x = a.x;
            this.y = a.y;
            this.z = a.z;
        }
    }
    x: number;
    y: number;
    z: number;
    public set(x: number | IVector3, y?: number, z?: number): Vector3 {
        if (typeof x === 'number') {
            if (typeof y === 'number' && typeof z === 'number') {
                this.x = x;
                this.y = y;
                this.z = z;
            } else {
                this.x = x;
                this.y = x;
                this.z = x;
            }
        } else {
            this.set(x.x, x.y, x.z);
        }
        return this;
    }
    public min(x: IVector3 | number, y?: number, z?: number): Vector3 {
        if (typeof x === 'number') {
            if (typeof y === 'number' && typeof z === 'number') {
                this.x = Math.min(this.x, x);
                this.y = Math.min(this.y, y);
                this.z = Math.min(this.z, z);
            } else {
                this.x = Math.min(this.x, x);
                this.y = Math.min(this.y, x);
                this.z = Math.min(this.z, x);
            }
        } else {
            this.min(x.x, x.y, x.z);
        }
        return this;
    }
    public add(x: IVector3 | number, y?: number, z?: number): Vector3 {
        if (typeof x === 'number') {
            if (typeof y === 'number' && typeof z === 'number') {
                this.x += x;
                this.y += y;
                this.z += z;
            } else {
                this.x += x;
                this.y += x;
                this.z += x;
            }
        } else {
            this.add(x.x, x.y, x.z);
        }
        return this;
    }
    public sub(x: IVector3 | number, y?: number, z?: number): Vector3 {
        if (typeof x === 'number') {
            if (typeof y === 'number' && typeof z === 'number') {
                this.x -= x;
                this.y -= y;
                this.z -= z;
            } else {
                this.y -= x;
                this.z -= x;
                this.x -= x;
            }
        } else {
            this.sub(x.x, x.y, x.z);
        }
        return this;
    }
    public scl(x: number | IVector3, y?: number, z?: number): Vector3 {
        if (typeof x === 'number') {
            if (typeof y === 'number' && typeof z === 'number') {
                this.x *= x;
                this.y *= y;
                this.z *= z;
            } else {
                this.x *= x;
                this.y *= x;
                this.z *= x;
            }
        } else {
            this.scl(x.x, x.y, x.z);
        }
        return this;
    }
    public div(x: number | IVector3, y?: number, z?: number): Vector3 {
        if (typeof x === 'number') {
            if (typeof y === 'number' && typeof z === 'number') {
                this.x /= x;
                this.y /= y;
                this.z /= z;
            } else {
                this.x /= x;
                this.y /= x;
                this.z /= x;
            }
        } else {
            this.div(x.x, x.y, x.z);
        }
        return this;
    }

    public len() {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    }
    public len2() {
        return this.x ** 2 + this.y ** 2 + this.z ** 2;
    }
    public equals(other: Vector3) {
        return this.x === other.x && this.y === other.y && this.z === other.z;
    }
    public distance(vec: Vector3) {
        return this.clone().sub(vec).len();
    }
    public toString() {
        return `(${this.x}, ${this.y}, ${this.z})`;
    }
    [Symbol.toStringTag]() {
        return this.toString();
    }
    public floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        this.z = Math.floor(this.z);
        return this;
    }
    public round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.z = Math.round(this.z);
        return this;
    }
    public ceil() {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        this.z = Math.ceil(this.z);
        return this;
    }
    public abs() {
        this.x = Math.abs(this.x);
        this.y = Math.abs(this.y);
        this.z = Math.abs(this.z);
        return this;
    }

    public mul(n: IVector3): number;
    public mul(n: Matrix4): Vector3;
    public mul(n: IVector3 | Matrix4) {
        if (n instanceof Matrix4) {
            return n.transformVector(this);
        } else {
            return n.x * this.x + n.y * this.y + n.z * this.z;
        }
    }

    public normalize() {
        this.div(this.len());
        return this;
    }

    public clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    public toArray() {
        return [this.x, this.y, this.z];
    }

    // Calculate the vertical rotation angle of the vector relative to the x-z plane
    // The angle ranges from -90 to 90 degrees, with the y-axis pointing vertically upwards, in the left-hand coordinate system
    public rotateAngleY() {
        let [x, y, z] = [this.x, this.y, this.z];
        let angle = Math.atan2(y, Math.sqrt(x * x + z * z));
        return angle * 180 / Math.PI;
    }
    // Calculate the horizontal rotation angle of the vector relative to the x-y vertical plane
    // The angle ranges from 0 to 360 degrees, with the y-axis pointing vertically upwards, in the left-hand coordinate system
    public rotateAngleX() {
        let [x, y, z] = [this.x, this.y, this.z];
        let angle = Math.atan2(x, z);
        if (angle < 0) {
            angle += 2 * Math.PI;
        }
        return angle * 180 / Math.PI;
    }

}

export interface IVector3 {
    x: number;
    y: number;
    z: number;
}