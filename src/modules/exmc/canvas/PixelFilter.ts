export default class PixelFilter {
    pixels: Pixel[];
    constructor(pixels?: Pixel[]) {
        this.pixels = pixels ?? [];
    }
    filter(func: (pixels: Pixel) => boolean) {
        this.pixels = this.pixels.filter(func);
        return this;
    }

    generate(x1: number, y1: number, x2: number, y2: number) {
        if (x2 < x1) [x1, x2] = [x2, x1];
        if (y2 < y1) [y1, y2] = [y2, y1];
        
        for (let i = x1; i < x2; i++) {
            for (let j = y1; j < y2; j++) {
                this.pixels.push(new Pixel(i, j));
            }
        }
        return this;
    }

    betweenDistance(minDis: number, maxDis: number, targetX: number, targetY: number) {
        return this.filter(p => {
            const dis = p.getDistance(targetX, targetY);
            return dis >= minDis && dis <= maxDis;
        });;
    }

    maxDistance(maxDis: number, targetX: number, targetY: number) {
        return this.betweenDistance(0, maxDis, targetX, targetY);
    }
    minDistance(minDis: number, targetX: number, targetY: number) {
        return this.betweenDistance(minDis, 0, targetX, targetY);
    }

    lineCutRight(x1: number, y1: number, x2: number, y2: number) {
        return this.filter(p => (x2 - x1) * (p.y - y1) - (y2 - y1) * (p.x - x1) <= 0)
    }
    lineCutLeft(x1: number, y1: number, x2: number, y2: number) {
        return this.filter(p => (x2 - x1) * (p.y - y1) - (y2 - y1) * (p.x - x1) >= 0)
    }

    inEllipse(x1: number, y1: number, x2: number, y2: number, longAxis: number) {
        return this.filter(p => {
            let judge = p.getDistance(x1, y1) + p.getDistance(x2, y2);
            return judge <= longAxis;
        });
    }
    outEllipse(x1: number, y1: number, x2: number, y2: number, longAxis: number) {
        return this.filter(p => {
            let judge = p.getDistance(x1, y1) + p.getDistance(x2, y2);
            return judge >= longAxis;
        });
    }
}
export class Pixel {
    x!: number;
    y!: number;
    public static tmpV = new Pixel();
    constructor(x = 0, y = 0) {
        this.setPos(x, y);
    }
    setPos(x: [number, number]): this
    setPos(x: Pixel): this
    setPos(x: number, y: number): this
    setPos(x: number | [number, number] | Pixel, y?: number) {
        if (typeof x === 'number') {
            this.x = x;
            this.y = y!;
        } else if (x instanceof Array) {
            this.setPos(x[0], x[1]);
        } else {
            this.setPos(x.x, x.y);
        }
        return this;
    }
    getDistance(x: number, y: number) {
        return Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2);
    }
}