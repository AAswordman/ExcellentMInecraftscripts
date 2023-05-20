export default class Matrix4 {

    public readonly val: number[][];

    constructor(mat?: number[][]) {
        this.val = mat ?? [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
    }

    public clone(): Matrix4 {
        return new Matrix4(this.val.map(v => v.map(i => i)));
    }
    public mul(mat:Matrix4) {
        const nmat = new Matrix4();

        for(let i = 0; i < 4; i++) {
            for(let j = 0; j < 4; j++) {
                let num = 0;
                this.val[i].forEach((e,index) => num += e * mat.val[index][j]);
                nmat.val[i][j] = num;
            }
        }
        return nmat;
    }

    public add(mat: Matrix4): Matrix4 {
        const nmat = this.clone();

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                this.val[i][j] = this.val[i][j] + mat.val[i][j];
            }
        }

        return nmat;
    }

    public subtract(mat: Matrix4): Matrix4 {
        const nmat = this.clone();

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                nmat.val[i][j] = this.val[i][j] - mat.val[i][j];
            }
        }

        return nmat;
    }

    public invert(): Matrix4 {
        const nmat = this.clone();

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                nmat.val[i][j] = 1.0 / (this.val[i][j] * this.val[i][j]);
            }
        }

        return nmat;
    }

    public get(row: number, col: number): number {
        return this.val[row][col];
    }

    public set(row: number, col: number, val: number): void {
        this.val[row][col] = val;
    }

    public print(): void {
        console.log(this);
    }
}