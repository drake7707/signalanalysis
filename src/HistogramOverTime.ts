import { Spectogram } from "./Spectogram";

export class HistogramOverTime extends Spectogram {

    constructor(maxHistory: number, bins: number) {
        super(maxHistory, bins);
    }

    public transform(val: number): number {
        return val;
    }
}
