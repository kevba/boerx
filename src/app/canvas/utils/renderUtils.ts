import { EntityType } from "../../models/entity";

export class RenderUtils {
  static selectedColor = "#c49949";

  static entitySize: Record<EntityType, [number, number]> = {
    [EntityType.Plot]: [120, 120],
    [EntityType.Tractor]: [32, 32],
  };
}
