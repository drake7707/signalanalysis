export class Palette {

    private readonly colors: Color[] = [];
    private lookup: Color[] = [];

    public buildLookup() {
        this.lookup = [];
        for (let i = 0; i < 1000; i++)
            this.lookup.push(this.getColorAt(i / 1000));
    }

    public getColorFromLookupAt(position: number) {
        let idx;
        if (isNaN(position))
            idx = 0;
        else
            idx = Math.floor(position * this.lookup.length);
        if (idx < 0)
            idx = 0;
        if (idx >= this.lookup.length)
            idx = this.lookup.length - 1;
        return this.lookup[idx];
    }

    public getColorAt(position: number): Color {
        if (position < this.colors[0].position)
            return this.colors[0];

        if (position >= this.colors[this.colors.length - 1].position)
            return this.colors[this.colors.length - 1];

        for (let i = 0; i < this.colors.length; i++) {
            if (position >= this.colors[i].position && position < this.colors[i + 1].position) {
                const relColorAlpha = (position - this.colors[i].position) / (this.colors[i + 1].position - this.colors[i].position);
                const red = this.colors[i].red * (1 - relColorAlpha) + this.colors[i + 1].red * (relColorAlpha);
                const green = this.colors[i].green * (1 - relColorAlpha) + this.colors[i + 1].green * (relColorAlpha);
                const blue = this.colors[i].blue * (1 - relColorAlpha) + this.colors[i + 1].blue * (relColorAlpha);
                return new Color(red, green, blue, position);
            }
        }
        return this.colors[0];
    }

    public addColor(c: Color) {
        this.colors.push(c);
    }

    public drawTo(ctx: CanvasRenderingContext2D) {
        for (let i: number = 0; i < ctx.canvas.width; i++) {
            const pos = i / ctx.canvas.width;
            const c = this.getColorFromLookupAt(pos);
            ctx.fillStyle = `rgb(${c.red},${c.green},${c.blue})`;
            ctx.fillRect(i, 0, 1, ctx.canvas.height);
        }
    }
}

export class Color {
    public red: number;
    public green: number;
    public blue: number;
    public position: number;

    constructor(red: number, green: number, blue: number, position: number) {
        this.red = Math.floor(red);
        this.green = Math.floor(green);
        this.blue = Math.floor(blue);
        this.position = Math.round(position * 100) / 100;
    }
}
