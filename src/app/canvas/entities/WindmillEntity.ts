import { signal } from "@angular/core";
import Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import { EntityType } from "../../models/entity";
import { IncomeService } from "../../services/income.service";
import { Crop } from "../../services/items/crop.service";
import { CropItem, Item } from "../../services/wares.service";
import { Entity } from "./Entity";
import { Sprite } from "./Sprite";
import { GeneratePower } from "./abilities/generatePower";

export class WindmillEntity extends Entity<WindmillImage, WindmillUpgrade> {
  type = EntityType.Windmill;

  upgrade = signal<WindmillUpgrade>(WindmillUpgrade.Basic);

  private incomeService = new IncomeService();
  generatePower = new GeneratePower(100);

  constructor(
    initialCoords: { x: number; y: number },
    layer: Konva.Layer,
    upgrade: WindmillUpgrade = WindmillUpgrade.Basic,
  ) {
    const id = uuidv4();

    const node = new WindmillImage({
      ...initialCoords,
      id,
    });
    layer.add(node);

    super({
      id,
      node,
    });
    this.node.entity = this;
    this.upgrade.set(upgrade);

    this.init();
  }

  sellItems(items: Item[]) {
    const crops = Object.values(Crop);
    items.forEach((i) => {
      if (crops.includes(i.type as Crop)) {
        this.incomeService.sellCrops([i as CropItem]);
      }
    });
  }
}

export enum WindmillUpgrade {
  Basic = "Basic",
}

export class WindmillImage extends Sprite<WindmillEntity> {
  protected override color = { r: 200, g: 200, b: 200 };
  override frameSpeed = 100;

  constructor(args: { x: number; y: number; id: string }) {
    super({
      id: `windmill_${args.id}`,
      name: EntityType.Windmill,
      x: args.x,
      y: args.y,
      imageSrc: "/sprites/windmill.png",
      EntityType: EntityType.Windmill,
      totalFrames: 4,
      frameWidth: 32,
      frameHeight: 36,
    });
  }
}
