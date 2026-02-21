import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class NoisyImageService {
  grayScaleColorMap: ColorMap = {
    "-0.5": "#0000000f",
    "-0.2": "#7F7F7F0f",
    "0": "#7F7F7F0f",
    "0.2": "#FFFFFF0f",
  };

  getNoiseImage(
    size: number,
    scale = 10,
    resolution = 0.04,
    colorMap: ColorMap = this.grayScaleColorMap,
  ): string {
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

    console.log(pixels);
    return this.pixelsToImage(pixels, size);
  }

  pixelsToImage(pixels: string[][], size: number) {
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
