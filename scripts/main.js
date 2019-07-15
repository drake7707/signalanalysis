var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define("Palette", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Palette = /** @class */ (function () {
        function Palette() {
            this.colors = [];
            this.lookup = [];
        }
        Palette.prototype.buildLookup = function () {
            this.lookup = [];
            for (var i = 0; i < 1000; i++)
                this.lookup.push(this.getColorAt(i / 1000));
        };
        Palette.prototype.getColorFromLookupAt = function (position) {
            var idx;
            if (isNaN(position))
                idx = 0;
            else
                idx = Math.floor(position * this.lookup.length);
            if (idx < 0)
                idx = 0;
            if (idx >= this.lookup.length)
                idx = this.lookup.length - 1;
            return this.lookup[idx];
        };
        Palette.prototype.getColorAt = function (position) {
            if (position < this.colors[0].position)
                return this.colors[0];
            if (position >= this.colors[this.colors.length - 1].position)
                return this.colors[this.colors.length - 1];
            for (var i = 0; i < this.colors.length; i++) {
                if (position >= this.colors[i].position && position < this.colors[i + 1].position) {
                    var relColorAlpha = (position - this.colors[i].position) / (this.colors[i + 1].position - this.colors[i].position);
                    var red = this.colors[i].red * (1 - relColorAlpha) + this.colors[i + 1].red * (relColorAlpha);
                    var green = this.colors[i].green * (1 - relColorAlpha) + this.colors[i + 1].green * (relColorAlpha);
                    var blue = this.colors[i].blue * (1 - relColorAlpha) + this.colors[i + 1].blue * (relColorAlpha);
                    return new Color(red, green, blue, position);
                }
            }
            return this.colors[0];
        };
        Palette.prototype.addColor = function (c) {
            this.colors.push(c);
        };
        Palette.prototype.drawTo = function (ctx) {
            for (var i = 0; i < ctx.canvas.width; i++) {
                var pos = i / ctx.canvas.width;
                var c = this.getColorFromLookupAt(pos);
                ctx.fillStyle = "rgb(" + c.red + "," + c.green + "," + c.blue + ")";
                ctx.fillRect(i, 0, 1, ctx.canvas.height);
            }
        };
        return Palette;
    }());
    exports.Palette = Palette;
    var Color = /** @class */ (function () {
        function Color(red, green, blue, position) {
            this.red = Math.floor(red);
            this.green = Math.floor(green);
            this.blue = Math.floor(blue);
            this.position = Math.round(position * 100) / 100;
        }
        return Color;
    }());
    exports.Color = Color;
});
define("Spectogram", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Spectogram = /** @class */ (function () {
        function Spectogram(maxHistory, freqBins) {
            this.maxHistory = maxHistory;
            this.freqBins = freqBins;
            this.allValues = [];
            this.bufferCanvas = document.createElement("canvas");
            this.bufferCanvas.width = maxHistory;
            this.bufferCanvas.height = freqBins;
        }
        Spectogram.prototype.getValues = function () {
            return this.allValues;
        };
        Spectogram.prototype.add = function (values) {
            var hist = bucketize(values, this.freqBins);
            for (var i = 0; i < hist.length; i++) {
                hist[i] = this.transform(hist[i]);
            }
            this.allValues.push(hist);
            if (this.allValues.length > this.maxHistory)
                this.allValues.shift();
        };
        Spectogram.prototype.transform = function (val) {
            return Math.log(1 + val);
        };
        Spectogram.prototype.draw = function (ctx, palette) {
            var max = Number.MIN_VALUE;
            for (var _i = 0, _a = this.allValues; _i < _a.length; _i++) {
                var values = _a[_i];
                for (var i = 0; i < values.length; i++)
                    if (max < values[i])
                        max = values[i];
            }
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            var bufferCtx = this.bufferCanvas.getContext("2d");
            var imgData = bufferCtx.getImageData(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
            var idx = 0;
            for (var x = 0; x < this.allValues.length; x++) {
                var values = this.allValues[x];
                // local max
                var max_1 = Number.MIN_VALUE;
                var min = Number.MAX_VALUE;
                for (var i = 0; i < values.length; i++) {
                    if (max_1 < values[i])
                        max_1 = values[i];
                    if (min > values[i])
                        min = values[i];
                }
                idx = x * 4;
                for (var y = 0; y < values.length; y++) {
                    if (typeof palette === "undefined") {
                        var val = Math.floor((values[y] - min) / (max_1 - min) * 255);
                        imgData.data[idx] = val;
                        imgData.data[idx + 1] = val;
                        imgData.data[idx + 2] = val;
                        imgData.data[idx + 3] = 255; // Math.floor(values[y]/max * 255);
                    }
                    else {
                        var color = palette.getColorFromLookupAt(values[y] / max_1);
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
        };
        return Spectogram;
    }());
    exports.Spectogram = Spectogram;
    function bucketize(values, nrBuckets) {
        var cellSize = Math.floor(values.length / nrBuckets);
        var hist = new Float32Array(nrBuckets);
        for (var i = 0; i < values.length; i++) {
            var bucket = Math.floor(i / cellSize);
            hist[bucket] += values[i];
        }
        return hist;
    }
});
define("HistogramOverTime", ["require", "exports", "Spectogram"], function (require, exports, Spectogram_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var HistogramOverTime = /** @class */ (function (_super) {
        __extends(HistogramOverTime, _super);
        function HistogramOverTime(maxHistory, bins) {
            return _super.call(this, maxHistory, bins) || this;
        }
        HistogramOverTime.prototype.transform = function (val) {
            return val;
        };
        return HistogramOverTime;
    }(Spectogram_1.Spectogram));
    exports.HistogramOverTime = HistogramOverTime;
});
define("Stats", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
// from https://github.com/Microsoft/ELT/blob/master/app/ts/stores/dataStructures/fft.ts
define("fft", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // FFT code adapted from github: https://github.com/dntj/jsfft/blob/master/lib/fft.js, MIT License
    // Converted to TypeScript.
    function fft(input, inverse) {
        var n = input.re.length;
        if (n & (n - 1)) {
            throw new Error("Cannot handle size " + n + " currently");
            // return FFT_Recursive(input, inverse)
        }
        else {
            return fftPowerOf2(input, inverse);
        }
    }
    exports.fft = fft;
    function fftPowerOf2(input, inverse) {
        var n = input.re.length;
        var output = bitReverseComplexArray(input);
        var oRE = output.re;
        var oIM = output.im;
        // Loops go like O(n log n):
        //   width ~ log n; i,j ~ n
        // width of each sub-array for which we're iteratively calculating FFT.
        var width = 1;
        while (width < n) {
            var delFRE = Math.cos(Math.PI / width);
            var delFIM = (inverse ? -1 : 1) * Math.sin(Math.PI / width);
            for (var i = 0; i < n / (2 * width); i++) {
                var fRE = 1;
                var fIM = 0;
                for (var j = 0; j < width; j++) {
                    var l_index = 2 * i * width + j;
                    var r_index = l_index + width;
                    var lRE = oRE[l_index];
                    var lIM = oIM[l_index];
                    var rRE = fRE * oRE[r_index] - fIM * oIM[r_index];
                    var rIM = fIM * oRE[r_index] + fRE * oIM[r_index];
                    oRE[l_index] = Math.SQRT1_2 * (lRE + rRE);
                    oIM[l_index] = Math.SQRT1_2 * (lIM + rIM);
                    oRE[r_index] = Math.SQRT1_2 * (lRE - rRE);
                    oIM[r_index] = Math.SQRT1_2 * (lIM - rIM);
                    var temp = fRE * delFRE - fIM * delFIM;
                    fIM = fRE * delFIM + fIM * delFRE;
                    fRE = temp;
                }
            }
            width <<= 1;
        }
        return output;
    }
    function bitReverseIndex(index, n) {
        var bitreversed_index = 0;
        while (n > 1) {
            bitreversed_index <<= 1;
            bitreversed_index += index & 1;
            index >>= 1;
            n >>= 1;
        }
        return bitreversed_index;
    }
    function bitReverseComplexArray(array) {
        var n = array.re.length;
        var flips = new Uint8Array(n);
        for (var i = 0; i < n; i++) {
            flips[i] = 0;
        }
        for (var i = 0; i < n; i++) {
            var r_i = bitReverseIndex(i, n);
            if (flips[i] || flips[r_i]) {
                continue;
            }
            var swap = array.re[r_i];
            array.re[r_i] = array.re[i];
            array.re[i] = swap;
            swap = array.im[r_i];
            array.im[r_i] = array.im[i];
            array.im[i] = swap;
            flips[i] = flips[r_i] = 1;
        }
        return array;
    }
});
define("main", ["require", "exports", "fft", "HistogramOverTime", "Palette", "Spectogram"], function (require, exports, FFT, HistogramOverTime_1, Palette_1, Spectogram_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function draw(ctx, values, offset, length) {
        if (offset === void 0) { offset = 0; }
        if (length === void 0) { length = -1; }
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        var maxVal = Number.MIN_VALUE;
        var minVal = Number.MAX_VALUE;
        var len = values.length;
        if (length !== -1)
            len = length - offset;
        for (var i = offset; i < len; i++) {
            if (maxVal < values[i])
                maxVal = values[i];
            if (minVal > values[i])
                minVal = values[i];
        }
        for (var i = offset; i < len; i++) {
            var x = i / len * ctx.canvas.width;
            var y = ctx.canvas.height - ((values[i] - minVal) / (maxVal - minVal)) * ctx.canvas.height;
            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2, false);
            ctx.fill();
        }
        ctx.beginPath();
        ctx.strokeStyle = "blue";
        var x0 = 0;
        var y0 = ctx.canvas.height - ((values[0] - minVal) / (maxVal - minVal)) * ctx.canvas.height;
        ctx.moveTo(x0, y0);
        for (var i = 1; i < len; i++) {
            var x = i / len * ctx.canvas.width;
            var y = ctx.canvas.height - ((values[i] - minVal) / (maxVal - minVal)) * ctx.canvas.height;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    function delay(ms) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (then) { return window.setTimeout(then, ms); })];
            });
        });
    }
    function runOverTime(WINDOW_SIZE, ctxInput, ctxOutput, ctxSpectogram, ctxHistogram, palette) {
        return __awaiter(this, void 0, void 0, function () {
            var t, spectogram, bins, histogramOverTime, complex, baseFrequency, i, val, max, min, i, histogram, i, val, alpha, idx, magnitude, i, mag;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        t = 0;
                        spectogram = new Spectogram_2.Spectogram(200, WINDOW_SIZE / 8);
                        bins = WINDOW_SIZE / 8;
                        histogramOverTime = new HistogramOverTime_1.HistogramOverTime(200, bins);
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 3];
                        complex = { im: new Float32Array(WINDOW_SIZE), re: new Float32Array(WINDOW_SIZE) };
                        baseFrequency = t / 100;
                        for (i = 0; i < WINDOW_SIZE; i++) {
                            val = 2.0 * Math.sin((i + t) / WINDOW_SIZE * (Math.PI * 2 * baseFrequency * 40))
                                + 1 * Math.cos((i + t) / WINDOW_SIZE * (Math.PI * 2 * baseFrequency * 20))
                                + 0.5 * Math.sin((i + t) / WINDOW_SIZE * (Math.PI * 2 * baseFrequency * 10))
                                + Math.random() * 0.25 * Math.sin((i + t) / WINDOW_SIZE * (Math.PI * 2 * baseFrequency * 5));
                            complex.re[i] = val;
                        }
                        draw(ctxInput, complex.re);
                        max = Number.MIN_VALUE;
                        min = Number.MAX_VALUE;
                        for (i = 0; i < WINDOW_SIZE; i++) {
                            if (max < complex.re[i])
                                max = complex.re[i];
                            if (min > complex.re[i])
                                min = complex.re[i];
                        }
                        histogram = new Float32Array(bins);
                        for (i = 0; i < WINDOW_SIZE; i++) {
                            val = complex.re[i];
                            alpha = (min === max) ? 0 : (val - min) / (max - min);
                            idx = Math.floor(alpha * (bins - 1));
                            histogram[idx]++;
                        }
                        histogramOverTime.add(histogram);
                        // changes complex
                        FFT.fft(complex, false);
                        magnitude = new Float32Array(complex.re.length / 2);
                        for (i = 0; i < complex.re.length / 2; i++) {
                            mag = Math.sqrt(complex.re[i] * complex.re[i] + complex.im[i] * complex.im[i]);
                            magnitude[i] = mag;
                        }
                        spectogram.add(magnitude);
                        draw(ctxOutput, magnitude);
                        spectogram.draw(ctxSpectogram, palette);
                        histogramOverTime.draw(ctxHistogram, palette);
                        return [4 /*yield*/, delay(25)];
                    case 2:
                        _a.sent();
                        t++;
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
    function getHannValues(size) {
        var values = new Float32Array(size);
        for (var i = 0; i < size; i++) {
            var sin = Math.sin(Math.PI * i / size);
            values[i] = sin * sin;
        }
        return values;
    }
    function main() {
        return __awaiter(this, void 0, void 0, function () {
            function analyze(lines, columnIdx) {
                if (columnIdx === void 0) { columnIdx = 0; }
                var arr = lines.map(function (l) {
                    var parts = l.split(/[;,\t]/);
                    if (columnIdx < parts.length)
                        return parseFloat(parts[columnIdx].trim().replace(/\"/g, ""));
                    else {
                        return Number.NaN;
                    }
                }).filter(function (val) { return !isNaN(val); });
                var data = new Float32Array(arr);
                if (document.getElementById("filterOutliers").checked) {
                    var stats_1 = getStatistics(data);
                    data = data.filter(function (val) { return val >= stats_1.q5 && val <= stats_1.q95; });
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
                generateChart("container", "Input data", data, function () {
                    return this.value + " (" + (this.value / NR_SAMPLES_PER_SEC).toFixed(2) + "s)";
                });
                cInput.setAttribute("style", "display:none");
                document.getElementById("fldOutput").setAttribute("style", "display:none");
                analyzeData(WINDOW_SIZE, WINDOW_OVERLAP, NR_SAMPLES_PER_SEC, data, FREQUENCY_BINS, ctxSpectogram, ctxHistogram, palette);
            }
            var cInput, ctxInput, cOutput, ctxOutput, cSpectogram, ctxSpectogram, cHistogram, ctxHistogram, palette, WINDOW_SIZE, WINDOW_OVERLAP, FREQUENCY_BINS, NR_SAMPLES_PER_SEC, lines;
            var _this = this;
            return __generator(this, function (_a) {
                cInput = document.getElementById("input");
                ctxInput = cInput.getContext("2d");
                cOutput = document.getElementById("output");
                ctxOutput = cOutput.getContext("2d");
                cSpectogram = document.getElementById("spectogram");
                ctxSpectogram = cSpectogram.getContext("2d");
                cHistogram = document.getElementById("histogram");
                ctxHistogram = cHistogram.getContext("2d");
                palette = new Palette_1.Palette();
                palette.addColor(new Palette_1.Color(50, 55, 100, 0));
                palette.addColor(new Palette_1.Color(67, 113, 179, 0.1));
                palette.addColor(new Palette_1.Color(108, 163, 204, 0.2));
                palette.addColor(new Palette_1.Color(155, 204, 225, 0.3));
                palette.addColor(new Palette_1.Color(204, 234, 243, 0.4));
                palette.addColor(new Palette_1.Color(239, 233, 193, 0.5));
                palette.addColor(new Palette_1.Color(254, 202, 123, 0.6));
                palette.addColor(new Palette_1.Color(250, 153, 87, 0.7));
                palette.addColor(new Palette_1.Color(237, 95, 61, 0.8));
                palette.addColor(new Palette_1.Color(208, 42, 39, 0.9));
                palette.addColor(new Palette_1.Color(208, 42, 39, 0.9));
                palette.addColor(new Palette_1.Color(146, 11, 39, 1));
                palette.buildLookup();
                WINDOW_SIZE = 256;
                WINDOW_OVERLAP = 0.5;
                FREQUENCY_BINS = 128;
                NR_SAMPLES_PER_SEC = 10;
                document.getElementById("testOverTime").onclick = function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, runOverTime(WINDOW_SIZE, ctxInput, ctxOutput, ctxSpectogram, ctxHistogram, palette)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); };
                document.getElementById("testSpectogramMultiSample").onclick = function () {
                    var NR_SAMPLES = WINDOW_SIZE * 5;
                    testGenerateSpectogram(NR_SAMPLES, WINDOW_SIZE, NR_SAMPLES_PER_SEC, ctxInput, WINDOW_OVERLAP, FREQUENCY_BINS, ctxSpectogram, ctxHistogram, palette);
                };
                document.getElementById("windowSize").onchange = function () {
                    WINDOW_SIZE = this.valueAsNumber;
                };
                document.getElementById("windowOverlap").onchange = function () {
                    WINDOW_OVERLAP = this.valueAsNumber;
                    console.log("Window overlap: " + WINDOW_OVERLAP);
                };
                document.getElementById("frequencyBins").onchange = function () {
                    FREQUENCY_BINS = this.valueAsNumber;
                };
                document.getElementById("nrSamplesPerSec").onchange = function () {
                    NR_SAMPLES_PER_SEC = this.valueAsNumber;
                };
                lines = [];
                document.getElementById("analyzeCSV").onclick = function () {
                    var loadText = new Promise(function (then, reject) {
                        var fileToLoad = document.getElementById("file").files[0];
                        if (typeof fileToLoad === "undefined") {
                            var text = document.getElementById("txt").value;
                            then(text);
                        }
                        else {
                            var fileReader = new FileReader();
                            fileReader.onload = function (fileLoadedEvent) {
                                var text = fileLoadedEvent.target.result;
                                then(text);
                            };
                            fileReader.readAsText(fileToLoad, "UTF-8");
                        }
                    });
                    loadText.then(function (text) {
                        var textToAnalyze = text;
                        lines = textToAnalyze.split("\n");
                        if (lines.length > 0) {
                            var parts = lines[0].split(/[;,\t]/);
                            var el = document.getElementById("columnSelect");
                            for (var i = el.childNodes.length - 1; i >= 0; i--) {
                                el.removeChild(el.childNodes[i]);
                            }
                            for (var i = 0; i < parts.length; i++) {
                                var opt = document.createElement("option");
                                opt.value = i.toString();
                                opt.textContent = "Column " + i;
                                el.appendChild(opt);
                            }
                        }
                        try {
                            analyze(lines);
                        }
                        catch (err) {
                            alert("Error: " + err.name + " - " + err.message);
                        }
                    }).catch(function (err) {
                        alert("Error loading text");
                    });
                };
                document.getElementById("columnSelect").onchange = function () {
                    var el = document.getElementById("columnSelect");
                    try {
                        analyze(lines, el.selectedIndex);
                    }
                    catch (err) {
                        alert("Error: " + err.name + " - " + err.message + " " + err.stack);
                    }
                };
                return [2 /*return*/];
            });
        });
    }
    function generateChart(containerId, title, data, formatter) {
        Highcharts.chart(containerId, {
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
                    formatter: typeof formatter !== "undefined" ? formatter : function () {
                        return "" + this.value;
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
    function generateChartWithSeries(containerId, title, series, formatter) {
        Highcharts.chart(containerId, {
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
                    formatter: typeof formatter !== "undefined" ? formatter : function () {
                        return "" + this.value;
                    }
                }
            },
            series: series.map(function (s) {
                return {
                    data: s.data,
                    lineWidth: 0.5,
                    name: s.name,
                    showInLegend: false
                };
            })
        });
    }
    function testGenerateSpectogram(nrSamples, windowSize, nrSamplesPerSec, ctxInput, windowOverlap, frequencyBins, ctxSpectogram, ctxHistogram, palette) {
        var nrFullWindows = nrSamples / windowSize;
        var data = new Float32Array(nrSamples);
        var dataIdx = 0;
        for (var t = 0; t < nrFullWindows; t++) {
            for (var i = 0; i < windowSize; i++) {
                if (i % 10 < 4) {
                    data[dataIdx++] = 10;
                }
                else if (i % 10 < 8) {
                    data[dataIdx++] = 5;
                }
                else
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
            generateChart("container", "Input data", data, function () {
                return this.value + " (" + (this.value / nrSamplesPerSec).toFixed(2) + "s)";
            });
            analyzeData(windowSize, windowOverlap, nrSamplesPerSec, data, frequencyBins, ctxSpectogram, ctxHistogram, palette);
        }
        catch (err) {
            alert("Error: " + err.name + " - " + err.message);
        }
    }
    function analyzeData(windowSize, windowOverlap, nrSamplesPerSec, data, frequencyBins, ctxSpectogram, ctxHistogram, palette) {
        var windowStep = windowSize * (1 - windowOverlap);
        var hannValues = getHannValues(windowSize);
        var windowFunction = function (i) { return hannValues[i]; };
        var nrWindows = data.length / windowStep;
        var powerSpectralDensities = [];
        var spectogram = new Spectogram_2.Spectogram(nrWindows, frequencyBins);
        var globalMax = Number.MIN_VALUE;
        var globalMin = Number.MAX_VALUE;
        for (var i = 0; i < data.length; i++) {
            if (globalMax < data[i])
                globalMax = data[i];
            if (globalMin > data[i])
                globalMin = data[i];
        }
        var histogramOverTime = new HistogramOverTime_1.HistogramOverTime(nrWindows, frequencyBins);
        var powerDensities = [];
        var statsArray = [];
        for (var offset = 0; offset < data.length - windowSize; offset += windowStep) {
            var complex = { im: new Float32Array(windowSize), re: new Float32Array(windowSize) };
            var max = Number.MIN_VALUE;
            var min = Number.MAX_VALUE;
            for (var i = 0; i < windowSize; i++) {
                if (max < data[offset + i])
                    max = data[offset + i];
                if (min > data[offset + i])
                    min = data[offset + i];
            }
            var alphas = [];
            var histogram = new Float32Array(frequencyBins);
            for (var i = 0; i < windowSize; i++) {
                var val = data[offset + i];
                var alpha = (globalMin === globalMax) ? 0 : (val - globalMin) / (globalMax - globalMin);
                alphas.push(alpha);
                var idx = Math.floor(alpha * (frequencyBins - 1));
                histogram[idx]++;
            }
            histogramOverTime.add(histogram);
            var windowData = new Float32Array(windowSize);
            for (var i = 0; i < windowSize; i++) {
                complex.re[i] = windowFunction(i) * data[offset + i];
                windowData[i] = data[offset + i];
            }
            var stats = getStatistics(windowData);
            statsArray.push(stats);
            FFT.fft(complex, false);
            var magnitude = new Float32Array(windowSize);
            for (var i = 0; i < complex.re.length; i++) {
                magnitude[i] = Math.sqrt(complex.re[i] * complex.re[i] + complex.im[i] * complex.im[i]);
            }
            spectogram.add(magnitude);
            var pi = 0;
            for (var i = 0; i < magnitude.length; i++)
                pi += magnitude[i] * magnitude[i];
            pi /= windowSize;
            powerDensities.push(alphas.reduce(function (sum, val) { return sum + val; }, 0) / windowSize);
            powerSpectralDensities.push(pi);
        }
        spectogram.draw(ctxSpectogram, palette);
        histogramOverTime.draw(ctxHistogram, palette);
        var totalPSD = powerSpectralDensities.reduce(function (sum, val) { return sum + val; }, 0);
        var probabilitySpectralDensities = powerSpectralDensities.map(function (psd) { return psd / totalPSD; });
        var PSE = -probabilitySpectralDensities.filter(function (pi) { return pi > 0; }).map(function (pi) { return pi * Math.log(pi); }).reduce(function (sum, val) { return sum + val; }, 0);
        console.log("PSE: " + PSE);
        var totalPD = powerDensities.reduce(function (sum, val) { return sum + val; }, 0);
        var probabilityDensities = powerDensities.filter(function (pi) { return pi > 0; }).map(function (psd) { return psd / totalPD; });
        var entropy = -probabilityDensities.map(function (pi) { return pi * Math.log(pi); }).reduce(function (sum, val) { return sum + val; }, 0);
        console.log("Entropy: " + entropy);
        var freqStep = 1 * nrSamplesPerSec / windowSize;
        var binLength = windowSize / frequencyBins;
        var lowerFreq = 0 * nrSamplesPerSec / windowSize;
        var midFreq = (windowSize / 2) * nrSamplesPerSec / windowSize;
        var upperFreq = (windowSize - 1) * nrSamplesPerSec / windowSize;
        document.getElementById("lowerFreq").textContent = lowerFreq.toFixed(2) + " - " + (lowerFreq + freqStep * binLength).toFixed(2) + " Hz";
        document.getElementById("midFreq").textContent = midFreq.toFixed(2) + " - " + (midFreq + freqStep * binLength).toFixed(2) + " Hz";
        document.getElementById("upperFreq").textContent = upperFreq.toFixed(2) + " - " + (upperFreq + freqStep * binLength).toFixed(2) + " Hz";
        document.getElementById("histogramMin").textContent = "" + globalMin.toFixed(2);
        document.getElementById("histogramMax").textContent = "" + globalMax.toFixed(2);
        document.getElementById("pse").textContent = PSE + "";
        document.getElementById("entropy").textContent = entropy + "";
        generateChart("mean", "Mean", statsArray.map(function (s) { return s.mean; }));
        generateChart("median", "Median", statsArray.map(function (s) { return s.median; }));
        generateChart("variance", "Variance", statsArray.map(function (s) { return s.variance; }));
        generateChart("skewness", "Skewness", statsArray.map(function (s) { return s.skewness; }));
        generateChart("kurtosis", "Kurtosis", statsArray.map(function (s) { return s.kurtosis; }));
        generateChart("ginicoeff", "Gini coeff.", statsArray.map(function (s) { return s.giniCoefficient; }));
    }
    function normalize(values) {
        var min = Number.MAX_VALUE;
        var max = Number.MIN_VALUE;
        for (var i = 0; i < values.length; i++) {
            if (min > values[i])
                min = values[i];
            if (max < values[i])
                max = values[i];
        }
        if (max - min > 0) {
            var range = max - min;
            for (var i = 0; i < values.length; i++) {
                values[i] = (values[i] - min) / range;
            }
        }
    }
    function getDistanceSeries(spectogram) {
        var values = spectogram.getValues();
        var distances = new Float32Array(values.length - 1);
        for (var i = 1; i < values.length; i++) {
            var distance = calculateDistance(values[i - 1], values[i]);
            distances[i - 1] = distance;
        }
        return distances;
    }
    function calculateDistance(values1, values2) {
        var stats1 = getStatistics(values1);
        var stats2 = getStatistics(values2);
        return Math.abs(stats1.giniCoefficient - stats2.giniCoefficient);
        var sum1 = values1.reduce(function (sum, val) { return sum + val; }, 0);
        var Px = values1.map(function (v) { return v / sum1; });
        var sum2 = values2.reduce(function (sum, val) { return sum + val; }, 0);
        var Qx = values2.map(function (v) { return v / sum2; });
        var total = 0;
        for (var i = 0; i < values1.length; i++) {
            total += Math.abs(Px[i] - Qx[i]);
        }
        return total;
    }
    function calculateKullbeckLeibler(values1, values2) {
        var sum1 = values1.reduce(function (sum, val) { return sum + val; }, 0);
        var Px = values1.map(function (v) { return v / sum1; });
        var sum2 = values2.reduce(function (sum, val) { return sum + val; }, 0);
        var Qx = values2.map(function (v) { return v / sum2; });
        var total = 0;
        for (var i = 0; i < values1.length; i++) {
            if (Qx[i] !== 0 && Px[i] !== 0)
                total += Px[i] * Math.log(Px[i] / Qx[i]);
        }
        return total;
    }
    function getStatistics(arr) {
        var sum = arr.reduce(function (s, val) { return s + val; }, 0);
        var mean = sum / arr.length;
        var stddevsum = arr.reduce(function (s, val) { return s + (val - mean) * (val - mean); }, 0);
        var variance = stddevsum / (arr.length - 1);
        var stddev = Math.sqrt(variance);
        var thirdMoment = arr.reduce(function (s, val) { return s + (val - mean) * (val - mean) * (val - mean); }, 0) / arr.length;
        var skewness = thirdMoment / (stddev * stddev * stddev);
        var fourthMoment = arr.reduce(function (s, val) { return s + (val - mean) * (val - mean) * (val - mean) * (val - mean); }, 0) / arr.length;
        var kurtosis = fourthMoment / (stddev * stddev * stddev * stddev);
        var sortedValues = arr.slice(0).sort(function (a, b) { return a - b; });
        var median = quartile(sortedValues, 0.5);
        var q95 = quartile(sortedValues, 0.95);
        var q75 = quartile(sortedValues, 0.75);
        var q25 = quartile(sortedValues, 0.25);
        var q5 = quartile(sortedValues, 0.05);
        var sumAbs = 0;
        for (var j = 0; j < arr.length; j++) {
            for (var i = 0; i < arr.length; i++) {
                sumAbs += Math.abs(arr[i] - arr[j]);
            }
        }
        var giniCoefficient = sumAbs / (2 * arr.length * sum);
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
    function quartile(sortedData, q) {
        var pos = ((sortedData.length) - 1) * q;
        var base = Math.floor(pos);
        var rest = pos - base;
        if ((sortedData[base + 1] !== undefined))
            return sortedData[base] + rest * (sortedData[base + 1] - sortedData[base]);
        else
            return sortedData[base];
    }
    main().then(function () {
    }).catch(function (err) {
        console.error(err.name + " " + err.message);
    });
});
