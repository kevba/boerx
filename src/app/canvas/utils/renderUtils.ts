import { EntityType } from "../../models/entity";
import { TractorBrand } from "../../services/entities/tractor.service";

export class RenderUtils {
  static selectedColor = "#c49949";

  static entitySize: Record<EntityType, [number, number]> = {
    [EntityType.Plot]: [120, 120],
    [EntityType.Barn]: [240, 240],
    [EntityType.Tractor]: [32, 32],
  };

  static BrandColors: Record<string, { r: number; g: number; b: number }> = {
    [TractorBrand.DearJuan]: { r: 54, g: 185, b: 0 },
    [TractorBrand.OldHillland]: { r: 0, g: 102, b: 204 },
    [TractorBrand.Kerel]: { r: 200, g: 16, b: 46 },
    [TractorBrand.Klaas]: { r: 255, g: 128, b: 0 },
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
