import { EntityType } from "../../models/entity";

export class ImageUtils {
  static hexToRgba(color: string): [number, number, number, number] {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const a = color.length === 9 ? parseInt(color.slice(7, 9), 16) : 255;
    return [r, g, b, a];
  }
  static selectedColor = "#c49949";

  static entitySize: Record<EntityType, [number, number]> = {
    [EntityType.Plot]: [160, 160],
    [EntityType.Farmer]: [32, 32],
    [EntityType.Barn]: [144, 144],
    [EntityType.Tractor]: [48, 48],
    [EntityType.Van]: [48, 48],
    [EntityType.Market]: [240, 240],
    [EntityType.Cow]: [32, 32],
    [EntityType.Greenhouse]: [144, 144],
    [EntityType.Altar]: [320, 320],
    [EntityType.Windmill]: [32 * 5, 36 * 5],
    [EntityType.WeatherStation]: [10 * 5, 16 * 5],
  };

  static preprocessImage(
    image: HTMLImageElement,
    rgb = { r: 255, g: 0, b: 0 },
  ): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) {
        data[i] = rgb.r;
        data[i + 1] = rgb.g;
        data[i + 2] = rgb.b;
      }
    }

    // Put the processed image data back
    ctx.putImageData(imageData, 0, 0);

    return canvas;
  }
}
