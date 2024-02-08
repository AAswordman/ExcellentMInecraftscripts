import Vector3 from "./Vector3.js";

export default class Matrix4 {
    val!: Float32Array;
    
    constructor(val?: Float32Array | Matrix4)
    constructor(m00: number, m01: number, m02: number, m03: number,
        m10: number, m11: number, m12: number, m13: number,
        m20: number, m21: number, m22: number, m23: number,
        m30: number, m31: number, m32: number, m33: number)
    constructor(val?: Float32Array | Matrix4 | number, m01?: number, m02?: number, m03?: number,
        m10?: number, m11?: number, m12?: number, m13?: number,
        m20?: number, m21?: number, m22?: number, m23?: number,
        m30?: number, m31?: number, m32?: number, m33?: number) {
        this.set(...arguments);

    }
    set(val?: Float32Array | Matrix4): this;
    set(m00: number, m01: number, m02: number, m03: number,
        m10: number, m11: number, m12: number, m13: number,
        m20: number, m21: number, m22: number, m23: number,
        m30: number, m31: number, m32: number, m33: number): this;
        set(val?: Float32Array | Matrix4 | number, m01?: number, m02?: number, m03?: number,
        m10?: number, m11?: number, m12?: number, m13?: number,
        m20?: number, m21?: number, m22?: number, m23?: number,
        m30?: number, m31?: number, m32?: number, m33?: number) {
        if (val instanceof Matrix4) {
            this.val = new Float32Array(val.val);
        } else if (val instanceof Float32Array) {
            this.val = new Float32Array(val);
        } else if (!val) {
            this.val = new Float32Array(16);
            this.idt();
        } else {
            this.val[0] = val;
            this.val[1] = m01!;
            this.val[2] = m02!;
            this.val[3] = m03!;
            this.val[4] = m10!;
            this.val[5] = m11!;
            this.val[6] = m12!;
            this.val[7] = m13!;
            this.val[8] = m20!;
            this.val[9] = m21!;
            this.val[10] = m22!;
            this.val[11] = m23!;
            this.val[12] = m30!;
            this.val[13] = m31!;
            this.val[14] = m32!;
            this.val[15] = m33!;
        }
        return this;
    }
    
    public idt(): Matrix4 {
        this.val.set([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        return this;
    }
    
    public setTranslation(x: number, y: number, z: number): Matrix4 {
        this.idt();
        this.val[12] = x;
        this.val[13] = y;
        this.val[14] = z;
        return this;
    }
    
    public setRotationX(angle: number): Matrix4 {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        this.idt();
        this.val[5] = c;
        this.val[6] = -s;
        this.val[9] = s;
        this.val[10] = c;
        return this;
    }
    
    public setRotationY(angle: number): Matrix4 {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        this.idt();
        this.val[0] = c;
        this.val[2] = s;
        this.val[8] = -s;
        this.val[10] = c;
        return this;
    }
    
    public setRotationZ(angle: number): Matrix4 {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        this.idt();
        this.val[0] = c;
        this.val[1] = -s;
        this.val[4] = s;
        this.val[5] = c;
        return this;
    }
    
    public setScale(x: number, y: number, z: number): Matrix4 {
        this.idt();
        this.val[0] = x;
        this.val[5] = y;
        this.val[10] = z;
        return this;
    }
    
    public translate(x: number, y: number, z: number): Matrix4 {
        const translationMatrix = new Matrix4().setTranslation(x, y, z);
        return this.mul(translationMatrix);
    }
    
    public rotateX(angle: number): Matrix4 {
        const rotationMatrix = new Matrix4().setRotationX(angle);
        return this.mul(rotationMatrix);
    }
    
    public rotateY(angle: number): Matrix4 {
        const rotationMatrix = new Matrix4().setRotationY(angle);
        return this.mul(rotationMatrix);
    }
    
    public rotateZ(angle: number): Matrix4 {
        const rotationMatrix = new Matrix4().setRotationZ(angle);
        return this.mul(rotationMatrix);
    }
    
    public scl(x: number, y: number, z: number): Matrix4 {
        const scaleMatrix = new Matrix4().setScale(x, y, z);
        return this.mul(scaleMatrix);
    }
    
    public mul(matrix: Matrix4): Matrix4 {
        const result = new Matrix4();
        const a = this.val;
        const b = matrix.val;
        const out = result.val;
        
        const a11 = a[0], a12 = a[4], a13 = a[8], a14 = a[12];
        const a21 = a[1], a22 = a[5], a23 = a[9], a24 = a[13];
        const a31 = a[2], a32 = a[6], a33 = a[10], a34 = a[14];
        const a41 = a[3], a42 = a[7], a43 = a[11], a44 = a[15];
        
        const b11 = b[0], b12 = b[4], b13 = b[8], b14 = b[12];
        const b21 = b[1], b22 = b[5], b23 = b[9], b24 = b[13];
        const b31 = b[2], b32 = b[6], b33 = b[10], b34 = b[14];
        const b41 = b[3], b42 = b[7], b43 = b[11], b44 = b[15];
        
        out[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        out[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        out[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        out[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
        
        out[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        out[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        out[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        out[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
        
        out[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        out[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        out[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        out[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
        
        out[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        out[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        out[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        out[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
        
        this.val = out;
        return this;
    }
    
    public transformVector(vector: Vector3): Vector3 {
        const x = vector.x;
        const y = vector.y;
        const z = vector.z;

        const m = this.val;
        
        const newX = m[0] * x + m[4] * y + m[8] * z + m[12];
        const newY = m[1] * x + m[5] * y + m[9] * z + m[13];
        const newZ = m[2] * x + m[6] * y + m[10] * z + m[14];
        
        return vector.set(newX, newY, newZ);
    }
    public cpy(): Matrix4 {
        return new Matrix4(this);
    }
    public getValue(): Float32Array {
        return this.val;
    }
}