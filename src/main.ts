import * as FFT from "./fft";
import { HistogramOverTime } from "./HistogramOverTime";
import { Color, Palette } from "./Palette";
import { Spectogram } from "./Spectogram";
import { Stats } from "./Stats";

// too lazy to sort out the typescript issue right now
declare const Highcharts:any;

function draw(ctx: CanvasRenderingContext2D, values: Float32Array, offset: number = 0, length: number = -1) {

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    let maxVal = Number.MIN_VALUE;
    let minVal = Number.MAX_VALUE;

    let len = values.length;
    if (length !== -1)
        len = length - offset;

    for (let i: number = offset; i < len; i++) {
        if (maxVal < values[i]) maxVal = values[i];
        if (minVal > values[i]) minVal = values[i];
    }

    for (let i: number = offset; i < len; i++) {
        const x = i / len * ctx.canvas.width;
        const y = ctx.canvas.height - ((values[i] - minVal) / (maxVal - minVal)) * ctx.canvas.height;

        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2, false);
        ctx.fill();
    }

    ctx.beginPath();
    ctx.strokeStyle = "blue";

    const x0 = 0;
    const y0 = ctx.canvas.height - ((values[0] - minVal) / (maxVal - minVal)) * ctx.canvas.height;
    ctx.moveTo(x0, y0);
    for (let i: number = 1; i < len; i++) {
        const x = i / len * ctx.canvas.width;
        const y = ctx.canvas.height - ((values[i] - minVal) / (maxVal - minVal)) * ctx.canvas.height;
        ctx.lineTo(x, y);
    }
    ctx.stroke();

}

async function delay(ms: number) {
    return new Promise(then => window.setTimeout(then, ms));
}

async function runOverTime(WINDOW_SIZE: number, ctxInput: CanvasRenderingContext2D, ctxOutput: CanvasRenderingContext2D, ctxSpectogram: CanvasRenderingContext2D, ctxHistogram: CanvasRenderingContext2D, palette: Palette) {
    let t = 0;
    const spectogram: Spectogram = new Spectogram(200, WINDOW_SIZE / 8);

    const bins = WINDOW_SIZE / 8;
    const histogramOverTime = new HistogramOverTime(200, bins);

    while (true) {
        const complex: FFT.ComplexArray = { im: new Float32Array(WINDOW_SIZE), re: new Float32Array(WINDOW_SIZE) };
        const baseFrequency = t / 100;
        for (let i: number = 0; i < WINDOW_SIZE; i++) {
            const val = 2.0 * Math.sin((i + t) / WINDOW_SIZE * (Math.PI * 2 * baseFrequency * 40))
                + 1 * Math.cos((i + t) / WINDOW_SIZE * (Math.PI * 2 * baseFrequency * 20))
                + 0.5 * Math.sin((i + t) / WINDOW_SIZE * (Math.PI * 2 * baseFrequency * 10))
                + Math.random() * 0.25 * Math.sin((i + t) / WINDOW_SIZE * (Math.PI * 2 * baseFrequency * 5));
            complex.re[i] = val;
        }
        draw(ctxInput, complex.re);

        let max: number = Number.MIN_VALUE;
        let min: number = Number.MAX_VALUE;

        for (let i: number = 0; i < WINDOW_SIZE; i++) {
            if (max < complex.re[i]) max = complex.re[i];
            if (min > complex.re[i]) min = complex.re[i];
        }

        const histogram = new Float32Array(bins);
        for (let i: number = 0; i < WINDOW_SIZE; i++) {
            const val = complex.re[i];
            const alpha = (min === max) ? 0 : (val - min) / (max - min);
            // alpha *= windowFunction(i);

            const idx = Math.floor(alpha * (bins - 1));
            histogram[idx]++;
        }
        histogramOverTime.add(histogram);

        // changes complex
        FFT.fft(complex, false);
        const magnitude = new Float32Array(complex.re.length / 2);
        for (let i: number = 0; i < complex.re.length / 2; i++) {
            const mag = Math.sqrt(complex.re[i] * complex.re[i] + complex.im[i] * complex.im[i]);
            magnitude[i] = mag;
        }
        spectogram.add(magnitude);
        draw(ctxOutput, magnitude);
        spectogram.draw(ctxSpectogram, palette);
        histogramOverTime.draw(ctxHistogram, palette);
        await delay(25);
        t++;
    }
}

function getHannValues(size: number) {
    const values = new Float32Array(size);
    for (let i: number = 0; i < size; i++) {
        const sin = Math.sin(Math.PI * i / size);
        values[i] = sin * sin;
    }
    return values;
}

async function main() {

    const cInput = <HTMLCanvasElement>document.getElementById("input");
    const ctxInput = cInput.getContext("2d")!;
    const cOutput = <HTMLCanvasElement>document.getElementById("output");
    const ctxOutput = cOutput.getContext("2d");

    const cSpectogram = <HTMLCanvasElement>document.getElementById("spectogram");
    const ctxSpectogram = cSpectogram.getContext("2d");

    const cHistogram = <HTMLCanvasElement>document.getElementById("histogram");
    const ctxHistogram = cHistogram.getContext("2d");

    const palette = new Palette();
    palette.addColor(new Color(50, 55, 100, 0));
    palette.addColor(new Color(67, 113, 179, 0.1));
    palette.addColor(new Color(108, 163, 204, 0.2));
    palette.addColor(new Color(155, 204, 225, 0.3));
    palette.addColor(new Color(204, 234, 243, 0.4));
    palette.addColor(new Color(239, 233, 193, 0.5));
    palette.addColor(new Color(254, 202, 123, 0.6));
    palette.addColor(new Color(250, 153, 87, 0.7));
    palette.addColor(new Color(237, 95, 61, 0.8));
    palette.addColor(new Color(208, 42, 39, 0.9));
    palette.addColor(new Color(208, 42, 39, 0.9));
    palette.addColor(new Color(146, 11, 39, 1));
    palette.buildLookup();

    let WINDOW_SIZE = 256;

    let WINDOW_OVERLAP = 0.5;
    let FREQUENCY_BINS = 128; // max half a window size

    let NR_SAMPLES_PER_SEC = 10;

    document.getElementById("testOverTime").onclick = async () => {
        await runOverTime(WINDOW_SIZE, ctxInput, ctxOutput, ctxSpectogram, ctxHistogram, palette);
    };

    document.getElementById("testSpectogramMultiSample").onclick = () => {
        const NR_SAMPLES = WINDOW_SIZE * 5;
        testGenerateSpectogram(NR_SAMPLES, WINDOW_SIZE, NR_SAMPLES_PER_SEC, ctxInput, WINDOW_OVERLAP, FREQUENCY_BINS, ctxSpectogram, ctxHistogram, palette);
    };

    (<HTMLInputElement>document.getElementById("windowSize")).onchange = function() {
        WINDOW_SIZE = (<HTMLInputElement>this).valueAsNumber;
    };

    (<HTMLInputElement>document.getElementById("windowOverlap")).onchange = function() {
        WINDOW_OVERLAP = (<HTMLInputElement>this).valueAsNumber;
        console.log("Window overlap: " + WINDOW_OVERLAP);
    };

    (<HTMLInputElement>document.getElementById("frequencyBins")).onchange = function() {
        FREQUENCY_BINS = (<HTMLInputElement>this).valueAsNumber;
    };

    (<HTMLInputElement>document.getElementById("nrSamplesPerSec")).onchange = function() {
        NR_SAMPLES_PER_SEC = (<HTMLInputElement>this).valueAsNumber;
    };

    let lines: string[] = [];

    document.getElementById("analyzeCSV").onclick = () => {

        const loadText = new Promise<string>((then, reject) => {
            const fileToLoad = (<HTMLInputElement>document.getElementById("file")).files[0];
            if (typeof fileToLoad === "undefined") {
                const text = (<HTMLTextAreaElement>document.getElementById("txt")).value;
                then(text);
            } else {
                const fileReader = new FileReader();
                fileReader.onload = function(fileLoadedEvent) {
                    const text = (<any>fileLoadedEvent.target).result;
                    then(text);
                };
                fileReader.readAsText(fileToLoad, "UTF-8");
            }
        });

        loadText.then(text => {
            const textToAnalyze = text;
            lines = textToAnalyze.split("\n");
            if (lines.length > 0) {
                const parts = lines[0].split(/[;,\t]/);

                const el = (<HTMLSelectElement>document.getElementById("columnSelect"));
                for (let i: number = el.childNodes.length - 1; i >= 0; i--) {
                    el.removeChild(el.childNodes[i]);
                }

                for (let i: number = 0; i < parts.length; i++) {
                    const opt = document.createElement("option");
                    opt.value = i.toString();
                    opt.textContent = "Column " + i;
                    el.appendChild(opt);
                }
            }
            try {
                analyze(lines);
            } catch (err) {
                alert("Error: " + err.name + " - " + err.message);
            }
        }).catch(err => {
            alert("Error loading text");
        });

    };

    (<HTMLSelectElement>document.getElementById("columnSelect")).onchange = () => {
        const el = (<HTMLSelectElement>document.getElementById("columnSelect"));
        try {

            analyze(lines, el.selectedIndex);
        } catch (err) {
            alert("Error: " + err.name + " - " + err.message + " " + err.stack);
        }
    };

    function analyze(lines: string[], columnIdx: number = 0) {
        const arr = lines.map(l => {
            const parts = l.split(/[;,\t]/);
            if (columnIdx < parts.length)
                return parseFloat(parts[columnIdx].trim().replace(/\"/g, ""));
            else {
                return Number.NaN;
            }
        }).filter(val => !isNaN(val));
        let data = new Float32Array(arr);

        if ((<HTMLInputElement>document.getElementById("filterOutliers")).checked) {
            const stats = getStatistics(data);
            data = data.filter(val => val >= stats.q5 && val <= stats.q95);
        }

        if (data.length <= 0) {
            alert("No data points");
            return;
        }

        if (data.length < WINDOW_SIZE) {
            alert("Window size can't be larger than the amount of data points");
            return;
        }
        if (FREQUENCY_BINS > WINDOW_SIZE) {
            alert("Frequency bins can't be larger than the window size");
            return;
        }

        // draw(ctxInput, data, 0, 1024);
        generateChart("container", "Input data", data, function(this:any) {
            return `${this.value} (${(this.value / NR_SAMPLES_PER_SEC).toFixed(2)}s)`;
        });

        cInput.setAttribute("style", "display:none");
        document.getElementById("fldOutput").setAttribute("style", "display:none");

        analyzeData(WINDOW_SIZE, WINDOW_OVERLAP, NR_SAMPLES_PER_SEC, data, FREQUENCY_BINS, ctxSpectogram, ctxHistogram, palette);
    }

}

function generateChart(containerId: string, title: string, data: Float32Array | number[], formatter?: Function) {
    Highcharts.chart(containerId, <any>{

        chart: {
            zoomType: "x"
        },

        title: {
            text: title
        },
        tooltip: {
            valueDecimals: 2
        },
        credits: {
            enabled: false
        },
        xAxis: {
            labels: {
                formatter: typeof formatter !== "undefined" ? formatter : function(this:any) {
                    return `${this.value}`;
                }
            }
        },

        series: [{
            data: data,
            lineWidth: 0.5,
            name: "Data points",
            showInLegend: false
        }]
    });
}

function generateChartWithSeries(containerId: string, title: string, series: Array<{ data: Float32Array | number[], name: string }>, formatter?: Function) {
    Highcharts.chart(containerId, <any>{

        chart: {
            zoomType: "x"
        },

        title: {
            text: title
        },
        tooltip: {
            valueDecimals: 2
        },
        credits: {
            enabled: false
        },
        xAxis: {
            labels: {
                formatter: typeof formatter !== "undefined" ? formatter : function(this:any) {
                    return `${this.value}`;
                }
            }
        },

        series: series.map(s => {
            return {
                data: s.data,
                lineWidth: 0.5,
                name: s.name,
                showInLegend: false
            };
        })
    });
}

function testGenerateSpectogram(nrSamples: number, windowSize: number, nrSamplesPerSec: number, ctxInput: CanvasRenderingContext2D, windowOverlap: number, frequencyBins: number, ctxSpectogram: CanvasRenderingContext2D, ctxHistogram: CanvasRenderingContext2D, palette: Palette) {
    const nrFullWindows = nrSamples / windowSize;
    const data = new Float32Array(nrSamples);
    let dataIdx = 0;
    for (let t: number = 0; t < nrFullWindows; t++) {

        for (let i: number = 0; i < windowSize; i++) {
            if (i % 10 < 4) {
                data[dataIdx++] = 10;
            } else if (i % 10 < 8) {
                data[dataIdx++] = 5;
            } else
                data[dataIdx++] = 0;
        }
        /*   let baseFrequency = t;
           for (let i: number = 0; i < windowSize; i++) {
               const val = 2.0 * Math.sin((i + t) / windowSize * (Math.PI * 2 * baseFrequency * 40))
                   + 1 * Math.cos((i + t) / windowSize * (Math.PI * 2 * baseFrequency * 20))
                   + 0.5 * Math.sin((i + t) / windowSize * (Math.PI * 2 * baseFrequency * 10))
                   + Math.random() * 0.25 * Math.sin((i + t) / windowSize * (Math.PI * 2 * baseFrequency * 5));
               data[dataIdx++] = val;
           }*/
    }

    try {
        generateChart("container", "Input data", data, function(this:any) {
            return `${this.value} (${(this.value / nrSamplesPerSec).toFixed(2)}s)`;
        });
        analyzeData(windowSize, windowOverlap, nrSamplesPerSec, data, frequencyBins, ctxSpectogram, ctxHistogram, palette);
    } catch (err) {
        alert("Error: " + err.name + " - " + err.message);
    }

}

function analyzeData(windowSize: number, windowOverlap: number, nrSamplesPerSec: number, data: Float32Array, frequencyBins: number, ctxSpectogram: CanvasRenderingContext2D, ctxHistogram: CanvasRenderingContext2D, palette: Palette) {

    const windowStep = windowSize * (1 - windowOverlap);
    const hannValues = getHannValues(windowSize);
    const windowFunction = (i: number) => hannValues[i];
    const nrWindows = data.length / windowStep;

    const powerSpectralDensities: number[] = [];

    const spectogram: Spectogram = new Spectogram(nrWindows, frequencyBins);

    let globalMax: number = Number.MIN_VALUE;
    let globalMin: number = Number.MAX_VALUE;
    for (let i: number = 0; i < data.length; i++) {
        if (globalMax < data[i]) globalMax = data[i];
        if (globalMin > data[i]) globalMin = data[i];
    }

    const histogramOverTime = new HistogramOverTime(nrWindows, frequencyBins);

    const powerDensities: number[] = [];

    const statsArray: Stats[] = [];

    for (let offset: number = 0; offset < data.length - windowSize; offset += windowStep) {
        const complex: FFT.ComplexArray = { im: new Float32Array(windowSize), re: new Float32Array(windowSize) };

        let max: number = Number.MIN_VALUE;
        let min: number = Number.MAX_VALUE;

        for (let i: number = 0; i < windowSize; i++) {
            if (max < data[offset + i]) max = data[offset + i];
            if (min > data[offset + i]) min = data[offset + i];
        }

        const alphas: number[] = [];
        const histogram = new Float32Array(frequencyBins);
        for (let i: number = 0; i < windowSize; i++) {
            const val = data[offset + i];
            const alpha = (globalMin === globalMax) ? 0 : (val - globalMin) / (globalMax - globalMin);
            alphas.push(alpha);

            const idx = Math.floor(alpha * (frequencyBins - 1));
            histogram[idx]++;
        }
        histogramOverTime.add(histogram);

        const windowData = new Float32Array(windowSize);
        for (let i: number = 0; i < windowSize; i++) {
            complex.re[i] = windowFunction(i) * data[offset + i];
            windowData[i] = data[offset + i];
        }

        const stats = getStatistics(windowData);
        statsArray.push(stats);

        FFT.fft(complex, false);
        const magnitude = new Float32Array(windowSize);
        for (let i: number = 0; i < complex.re.length; i++) {
            magnitude[i] = Math.sqrt(complex.re[i] * complex.re[i] + complex.im[i] * complex.im[i]);
        }

        spectogram.add(magnitude);

        let pi = 0;
        for (let i: number = 0; i < magnitude.length; i++)
            pi += magnitude[i] * magnitude[i];

        pi /= windowSize;

        powerDensities.push(alphas.reduce((sum, val) => sum + val, 0) / windowSize);

        powerSpectralDensities.push(pi);

    }

    spectogram.draw(ctxSpectogram, palette);
    histogramOverTime.draw(ctxHistogram, palette);

    const totalPSD = powerSpectralDensities.reduce((sum, val) => sum + val, 0);
    const probabilitySpectralDensities = powerSpectralDensities.map(psd => psd / totalPSD);

    const PSE = -probabilitySpectralDensities.filter(pi => pi > 0).map(pi => pi * Math.log(pi)).reduce((sum, val) => sum + val, 0);
    console.log("PSE: " + PSE);

    const totalPD = powerDensities.reduce((sum, val) => sum + val, 0);
    const probabilityDensities = powerDensities.filter(pi => pi > 0).map(psd => psd / totalPD);
    const entropy = -probabilityDensities.map(pi => pi * Math.log(pi)).reduce((sum, val) => sum + val, 0);

    console.log("Entropy: " + entropy);

    const freqStep = 1 * nrSamplesPerSec / windowSize;
    const binLength = windowSize / frequencyBins;

    const lowerFreq = 0 * nrSamplesPerSec / windowSize;
    const midFreq = (windowSize / 2) * nrSamplesPerSec / windowSize;
    const upperFreq = (windowSize - 1) * nrSamplesPerSec / windowSize;

    document.getElementById("lowerFreq").textContent = `${lowerFreq.toFixed(2)} - ${(lowerFreq + freqStep * binLength).toFixed(2)} Hz`;
    document.getElementById("midFreq").textContent = `${midFreq.toFixed(2)} - ${(midFreq + freqStep * binLength).toFixed(2)} Hz`;
    document.getElementById("upperFreq").textContent = `${upperFreq.toFixed(2)} - ${(upperFreq + freqStep * binLength).toFixed(2)} Hz`;

    document.getElementById("histogramMin").textContent = `${globalMin.toFixed(2)}`;
    document.getElementById("histogramMax").textContent = `${globalMax.toFixed(2)}`;

    document.getElementById("pse").textContent = PSE + "";
    document.getElementById("entropy").textContent = entropy + "";

    generateChart("mean", "Mean", statsArray.map(s => s.mean));
    generateChart("median", "Median", statsArray.map(s => s.median));
    generateChart("variance", "Variance", statsArray.map(s => s.variance));
    generateChart("skewness", "Skewness", statsArray.map(s => s.skewness));
    generateChart("kurtosis", "Kurtosis", statsArray.map(s => s.kurtosis));
    generateChart("ginicoeff", "Gini coeff.", statsArray.map(s => s.giniCoefficient));

}

function normalize(values: Float32Array | number[]): void {
    let min: number = Number.MAX_VALUE;
    let max: number = Number.MIN_VALUE;

    for (let i: number = 0; i < values.length; i++) {
        if (min > values[i]) min = values[i];
        if (max < values[i]) max = values[i];
    }
    if (max - min > 0) {
        const range = max - min;
        for (let i: number = 0; i < values.length; i++) {
            values[i] = (values[i] - min) / range;
        }
    }
}

function getDistanceSeries(spectogram: Spectogram) {
    const values = spectogram.getValues();
    const distances = new Float32Array(values.length - 1);
    for (let i: number = 1; i < values.length; i++) {
        const distance = calculateDistance(values[i - 1], values[i]);

        distances[i - 1] = distance;
    }
    return distances;
}

function calculateDistance(values1: Float32Array, values2: Float32Array) {

    const stats1 =getStatistics(values1);
    const stats2 = getStatistics(values2);
    return Math.abs(stats1.giniCoefficient - stats2.giniCoefficient);

    const sum1 = values1.reduce((sum, val) => sum + val, 0);
    const Px = values1.map(v => v / sum1);

    const sum2 = values2.reduce((sum, val) => sum + val, 0);
    const Qx = values2.map(v => v / sum2);

    let total = 0;
    for (let i: number = 0; i < values1.length; i++) {
        total += Math.abs(Px[i] - Qx[i]);
    }
    return total;
}

function calculateKullbeckLeibler(values1: Float32Array, values2: Float32Array) {
    const sum1 = values1.reduce((sum, val) => sum + val, 0);
    const Px = values1.map(v => v / sum1);

    const sum2 = values2.reduce((sum, val) => sum + val, 0);
    const Qx = values2.map(v => v / sum2);

    let total = 0;
    for (let i: number = 0; i < values1.length; i++) {
        if (Qx[i] !== 0 && Px[i] !== 0)
            total += Px[i] * Math.log(Px[i] / Qx[i]);
    }
    return total;
}

function getStatistics(arr: Float32Array): Stats {

    const sum = arr.reduce((s, val) => s + val, 0);
    const mean = sum / arr.length;

    const stddevsum = arr.reduce((s, val) => s + (val - mean) * (val - mean), 0);
    const variance = stddevsum / (arr.length - 1);
    const stddev = Math.sqrt(variance);

    const thirdMoment = arr.reduce((s, val) => s + (val - mean) * (val - mean) * (val - mean), 0) / arr.length;
    const skewness = thirdMoment / (stddev * stddev * stddev);

    const fourthMoment = arr.reduce((s, val) => s + (val - mean) * (val - mean) * (val - mean) * (val - mean), 0) / arr.length;
    const kurtosis = fourthMoment / (stddev * stddev * stddev * stddev);

    const sortedValues = arr.slice(0).sort((a, b) => a - b);
    
    const median = quartile(sortedValues, 0.5);
    const q95 = quartile(sortedValues, 0.95);
    const q75 = quartile(sortedValues, 0.75);
    const q25 = quartile(sortedValues, 0.25);
    const q5 = quartile(sortedValues, 0.05);

    let sumAbs = 0;
    for (let j: number = 0; j < arr.length; j++) {
        for (let i: number = 0; i < arr.length; i++) {
            sumAbs += Math.abs(arr[i] - arr[j]);
        }
    }
    const giniCoefficient = sumAbs / (2 * arr.length * sum);

    return {
        mean: mean,
        variance: variance,
        stddev: stddev,
        median: median,
        skewness: skewness,
        kurtosis: kurtosis,
        q95: q95,
        q5: q5,
        q25: q25,
        q75: q75,
        giniCoefficient: giniCoefficient
    };
}

function quartile(sortedData: Float32Array, q: number) {
    const pos = ((sortedData.length) - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if ((sortedData[base + 1] !== undefined))
        return sortedData[base] + rest * (sortedData[base + 1] - sortedData[base]);
    else
        return sortedData[base];
}

main().then(() => {

}).catch((err) => {
    console.error(err.name + " " + err.message);
});
