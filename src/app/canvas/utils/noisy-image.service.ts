export class NoisyImageService {
  static grayScaleColorMap: ColorMap = {
    "-0.5": "#0000000f",
    "-0.2": "#7F7F7F0f",
    "0": "#7F7F7F0f",
    "0.2": "#FFFFFF0f",
  };

  static getPerlinNoiseImage(
    size: number,
    scale = 10,
    resolution = 0.04,
    colorMap: ColorMap = NoisyImageService.grayScaleColorMap,
  ): string {
    const pixels = NoisyImageService.PerlinNoisyPattern(
      size,
      scale,
      resolution,
      colorMap,
    );
    return this.PixelsToImage(pixels, size);
  }

  static PerlinNoisyPattern(
    size: number,
    scale = 10,
    resolution = 0.04,
    colorMap: ColorMap = NoisyImageService.grayScaleColorMap,
  ): string[][] {
    if (size % scale !== 0) {
      throw new Error("Size must be a multiple of scale");
    }

    const noise = new Perlin().noiseMap(size / scale, size / scale, resolution);
    const mappingValues = Object.keys(colorMap)
      .map((k) => parseFloat(k))
      .sort((a, b) => a - b);
    const mappingColors = Object.values(colorMap);
    const maxI = mappingValues.length - 1;

    const pixels = noise.map((row) =>
      row.map((val) => {
        let i = mappingValues.findIndex((mapval) => val <= mapval);

        i = i !== -1 ? i : maxI;
        return mappingColors[i];
      }),
    );
    return pixels;
  }

  static getNoiseImage(
    size: number,
    scale = 10,
    colorMap: ColorMap = NoisyImageService.grayScaleColorMap,
  ): string {
    const pixels = this.NoisyPattern(size, scale, colorMap);
    return this.PixelsToImage(pixels, size);
  }

  static NoisyPattern(
    size: number,
    scale = 10,
    colorMap: ColorMap = NoisyImageService.grayScaleColorMap,
  ): string[][] {
    if (size % scale !== 0) {
      throw new Error("Size must be a multiple of scale");
    }

    const noise = new ValueNoise().randomizedNoiseMap(
      size / scale,
      size / scale,
    );
    const mappingValues = Object.keys(colorMap)
      .map((k) => parseFloat(k))
      .sort((a, b) => a - b);
    const mappingColors = Object.values(colorMap);
    const maxI = mappingValues.length - 1;

    const pixels = noise.map((row) =>
      row.map((val) => {
        let i = mappingValues.findIndex((mapval) => val <= mapval);

        i = i !== -1 ? i : maxI;
        return mappingColors[i];
      }),
    );
    return pixels;
  }

  static PixelsToImage(pixels: string[][], size: number) {
    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const noiseSize = pixels[0].length;

    const scale = size / noiseSize;

    var context = canvas.getContext("2d")!;
    for (var r = 0; r < noiseSize; r++) {
      for (var c = 0; c < noiseSize; c++) {
        context.fillStyle = pixels[c][r];
        context.fillRect(c * scale, r * scale, scale, scale);
      }
    }
    return canvas.toDataURL("image/png");
  }
}

export type ColorMap = Record<string, string>;

export class Perlin {
  private gradients: Record<string, any> = {};
  private memory: Record<string, any> = {};

  constructor() {
    this.gradients = {};
    this.memory = {};
  }

  rand_vect() {
    let theta = Math.random() * 2 * Math.PI;
    return { x: Math.cos(theta), y: Math.sin(theta) };
  }

  dot_prod_grid(x: number, y: number, vx: number, vy: number) {
    let g_vect;
    let d_vect = { x: x - vx, y: y - vy };
    if (this.gradients[`${vx}, ${vy}`]) {
      g_vect = this.gradients[`${vx}, ${vy}`];
    } else {
      g_vect = this.rand_vect();
      this.gradients[`${vx}, ${vy}`] = g_vect;
    }
    return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
  }

  smootherstep(x: number) {
    return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
  }

  interp(x: number, a: number, b: number) {
    return a + this.smootherstep(x) * (b - a);
  }

  get(x: number, y: number): number {
    if (this.memory.hasOwnProperty(`${x}, ${y}`))
      return this.memory[`${x}, ${y}`];

    let xf = Math.floor(x);
    let yf = Math.floor(y);
    //interpolate
    let tl = this.dot_prod_grid(x, y, xf, yf);
    let tr = this.dot_prod_grid(x, y, xf + 1, yf);
    let bl = this.dot_prod_grid(x, y, xf, yf + 1);
    let br = this.dot_prod_grid(x, y, xf + 1, yf + 1);
    let xt = this.interp(x - xf, tl, tr);
    let xb = this.interp(x - xf, bl, br);
    let v = this.interp(y - yf, xt, xb);
    this.memory[`${x}, ${y}`] = v;

    return v;
  }

  noiseMap(
    width: number,
    height: number,
    resolution = 0.04,
    octaves = 1,
  ): number[][] {
    let map: number[][] = [];

    for (let y = 0; y < height; y++) {
      let row = [];
      for (let x = 0; x < width; x++) {
        let val = this.get(x * resolution, y * resolution);
        row.push(val);
      }
      map.push(row);
    }

    return map;
  }
}

class ValueNoise {
  squirrel3(position: number, seed = 987654321): number {
    const BIT_NOISE1 = 0x68e31da4;
    const BIT_NOISE2 = 0xb5297a4d;
    const BIT_NOISE3 = 0x1b56c4e9;

    // Keep every step in 32-bit integer space to avoid JS floating-point bias.
    let mangled = position | 0;
    mangled = Math.imul(mangled, BIT_NOISE1);
    mangled = (mangled + seed) | 0;
    mangled ^= mangled >>> 8;
    mangled = (mangled + BIT_NOISE2) | 0;
    mangled ^= mangled << 8;
    mangled = Math.imul(mangled, BIT_NOISE3);
    mangled ^= mangled >>> 8;

    return mangled >>> 0;
  }

  random(x: number, y: number): number {
    const h = this.squirrel3(
      Math.floor(x) * 374761393 + Math.floor(y) * 668265263 + 987654321,
    );
    return (h / 4294967295) * 2 - 1; // [-1,1] guaranteed
  }

  fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  valueNoise(x: number, y: number): number {
    const xi = Math.floor(x);
    const yi = Math.floor(y);

    const xf = x - xi;
    const yf = y - yi;

    const v00 = this.random(xi, yi);
    const v10 = this.random(xi + 1, yi);
    const v01 = this.random(xi, yi + 1);
    const v11 = this.random(xi + 1, yi + 1);

    const u = this.fade(xf);
    const v = this.fade(yf);

    const x1 = this.lerp(v00, v10, u);
    const x2 = this.lerp(v01, v11, u);

    return this.lerp(x1, x2, v);
  }

  noiseMap(width: number, height: number): number[][] {
    let map: number[][] = [];

    for (let y = 0; y < height; y++) {
      let row = [];
      for (let x = 0; x < width; x++) {
        let val = this.valueNoise(x * 0.05, y * 0.05);
        row.push(val);
      }
      map.push(row);
    }

    return map;
  }

  randomizedNoiseMap(width: number, height: number): number[][] {
    let map: number[][] = [];

    const scale = 1;
    const offsetX = Math.random() * 1000;
    const offsetY = Math.random() * 1000;

    for (let y = 0; y < height; y++) {
      let row = [];
      for (let x = 0; x < width; x++) {
        let val = this.valueNoise(x * scale + offsetX, y * scale + offsetY);
        row.push(val);
      }
      map.push(row);
    }

    return map;
  }
}
