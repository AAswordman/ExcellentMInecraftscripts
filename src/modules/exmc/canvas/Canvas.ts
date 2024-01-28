import Bitmap from "./Bitmap.js";
import Paint, { Style } from "./Paint.js";
import PixelFilter, { Pixel } from "./PixelFilter.js";

export default class Canvas {
    private _context: Bitmap;
    constructor(bitmap: Bitmap) {
        this._context = bitmap;
    }
    getBitmap() {
        return this._context;
    }
    getWidth() {
        return this._context.width;
    }
    getHeight() {
        return this._context.height;
    }

    clear(): void {
        this._context.clear();
    }
    drawPixelFilter(filter: PixelFilter, paint: Paint) {
        for (let p of filter.pixels) {
            if (p.x >= 0 && p.x <= this._context.width && p.y >= 0 && p.y <= this._context.height) {
                this.drawPoint(p.x, p.y, paint);
            }
        }
    }

    drawCircle(x: number, y: number, r: number, paint: Paint) {
        switch (paint.style) {
            case Style.STROKE:
                this.drawPixelFilter(new PixelFilter().generate(x - r, y - r, x + r, y + r)
                    .betweenDistance(r - paint.strokeWidth / 2, r + paint.strokeWidth / 2, x, y), paint);
                break;
            case Style.FILL:
                this.drawPixelFilter(new PixelFilter().generate(x - r, y - r, x + r, y + r)
                    .maxDistance(r, x, y), paint);
                break;
            case Style.FILL_AND_STROKE:
                this.drawPixelFilter(new PixelFilter().generate(x - r, y - r, x + r, y + r)
                    .maxDistance(r + paint.strokeWidth / 2, x, y), paint);
                break;
        }
    }
    drawPoint(x: number, y: number, paint: Paint) {
        this._context.setPixel(x, y, paint.color);
    }
    drawLine() {

    }
    drawRect() {

    }
    drawRoundRect() {

    }
    drawOval() {

    }
    drawArc() {

    }
    drawText() {

    }
    drawTextOnPath() {

    }
    drawBitmap(bitmap: Bitmap, srcX1: number, srcY1: number, srcX2: number, srcY2: number,
        dstX1: number, dstY1: number, dstX2: number, dstY2: number, paint: Paint) {
        //paint未实现
        if (srcX2 < srcX1) [srcX1, srcX2] = [srcX2, srcX1];
        if (srcY2 < srcY1) [srcY1, srcY2] = [srcY2, srcY1];
        if (dstX2 < dstX1) [dstX1, dstX2] = [dstX2, dstX1];
        if (dstY2 < dstY1) [dstY1, dstY2] = [dstY2, dstY1];

        const dis1 = srcX2 - srcX1, dis2 = srcY2 - srcY1;
        const dis3 = dstX1 - dstX1, dis4 = dstY2 - dstY1;

        let paintX = new Paint();
        for (let i = dstX1; i < dstX2; i++) {
            for (let j = dstY1; j < dstY2; j++) {
                paintX.color = bitmap.getPixel(
                    Math.floor(srcX1 + dis1 * ((i - dstX1) / dis3)),
                    Math.floor(srcY1 + dis2 * ((j - dstY1) / dis4))
                );
                this.drawPoint(i, j, paintX)
            }
        }
    }
    private static _dataColor = ``;
    private static _dataColor2 = ``;
    private static _saturation = ``;
    private static _grayscale = ``;
    private static _saturation2 = ``;
    private static _grayscale2 = ``;
    private static _canvasStart = ""

    draw() {
        let layer1 = "", layer2 = "", layer3 = "", layer4 = "", layer5 = "", layer6 = "";
        for (let j = 0; j < this._context.height; j++) {
            layer1 += Canvas._canvasStart[0];
            layer3 += Canvas._canvasStart[0];
            layer5 += Canvas._canvasStart[0];
            layer2 += Canvas._canvasStart[1];
            layer4 += Canvas._canvasStart[1];
            layer6 += Canvas._canvasStart[1];
            for (let i = 0; i < this._context.width; i++) {
                const color = this._context.getPixel(i, j).toHSV();
                const h = Math.floor(color.h / 360 * Canvas._dataColor.length) % Canvas._dataColor.length;
                const s = Math.min(Math.round((100 - color.s) / 100 * Canvas._saturation.length), Canvas._saturation.length - 1);
                const v = Math.min(Math.round((100 - color.v) / 100 * Canvas._grayscale.length), Canvas._grayscale.length - 1);

                layer1 += Canvas._dataColor[h];
                layer2 += Canvas._dataColor2[h];
                layer3 += Canvas._saturation[s];
                layer4 += Canvas._saturation2[s];
                layer5 += Canvas._grayscale[v];
                layer6 += Canvas._grayscale2[v];
            }
            layer1 += "\n";
            layer2 += "\n";
            layer3 += "\n";
            layer4 += "\n";
            layer5 += "\n";
            layer6 += "\n";
        }
        return {
            layer1: layer1,
            layer2: layer2,
            layer3: layer3,
            layer4: layer4,
            layer5: layer5,
            layer6: layer6
        }
    }
}