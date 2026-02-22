import { EntityType } from "../../models/entity";
import { TractorBrand } from "../../services/entities/tractor.service";

export class RenderUtils {
  static selectedColor = "#c49949";

  static entitySize: Record<EntityType, [number, number]> = {
    [EntityType.Plot]: [120, 120],
    [EntityType.Tractor]: [32, 32],
  };

  static BrandColors: Record<string, { r: number; g: number; b: number }> = {
    [TractorBrand.DearJuan]: { r: 54, g: 185, b: 0 },
    [TractorBrand.OldHillland]: { r: 0, g: 102, b: 204 },
    [TractorBrand.Kerel]: { r: 200, g: 16, b: 46 },
    [TractorBrand.Klaas]: { r: 255, g: 128, b: 0 },
  };
}
