import { Palette } from "./Palette";

export class Spectogram {
    private readonly allValues: Float32Array[] = [];
    private readonly bufferCanvas: HTMLCanvasElement;

    constructor(private readonly maxHistory: number, protected freqBins: number) {
        this.bufferCanvas = document.createElement("canvas");
        this.bufferCanvas.width = maxHistory;
        this.bufferCanvas.height = freqBins;
    }

    public getValues() {
        return this.allValues;
    }

    public add(values: Float32Array) {
        const hist = bucketize(values, this.freqBins);
        for (let i: number = 0; i < hist.length; i++) {
            hist[i] = this.transform(hist[i]);
        }
        this.allValues.push(hist);
        if (this.allValues.length > this.maxHistory)
            this.allValues.shift();
    }

    public transform(val: number): number {
        return Math.log(1 + val);
    }

    public draw(ctx: CanvasRenderingContext2D, palette?: Palette) {
        let max = Number.MIN_VALUE;
        for (const values of this.allValues) {
            for (let i: number = 0; i < values.length; i++)
                if (max < values[i])
                    max = values[i];
        }

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const bufferCtx = this.bufferCanvas.getContext("2d")!;
        const imgData = bufferCtx.getImageData(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
        let idx = 0;

        for (let x: number = 0; x < this.allValues.length; x++) {
            const values = this.allValues[x];
            // local max
            let max = Number.MIN_VALUE;
            let min = Number.MAX_VALUE;
            for (let i: number = 0; i < values.length; i++) {
                if (max < values[i])
                    max = values[i];
                if (min > values[i])
                    min = values[i];
            }
            idx = x * 4;
            for (let y: number = 0; y < values.length; y++) {
                if (typeof palette === "undefined") {
                    const val = Math.floor((values[y] - min) / (max - min) * 255);
                    imgData.data[idx] = val;
                    imgData.data[idx + 1] = val;
                    imgData.data[idx + 2] = val;
                    imgData.data[idx + 3] = 255; // Math.floor(values[y]/max * 255);
                } else {
                    const color = palette.getColorFromLookupAt(values[y] / max);
                    imgData.data[idx] = color.red;
                    imgData.data[idx + 1] = color.green;
                    imgData.data[idx + 2] = color.blue;
                    imgData.data[idx + 3] = 255;
                }
                idx += this.bufferCanvas.width * 4;
            }
        }
        bufferCtx.putImageData(imgData, 0, 0);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.bufferCanvas, 0, 0, this.bufferCanvas.width, this.bufferCanvas.height, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
}

function bucketize(values: Float32Array, nrBuckets: number): Float32Array {
    const cellSize = Math.floor(values.length / nrBuckets);

    const hist = new Float32Array(nrBuckets);
    for (let i: number = 0; i < values.length; i++) {
        const bucket = Math.floor(i / cellSize);
        hist[bucket] += values[i];
    }
    return hist;
}
