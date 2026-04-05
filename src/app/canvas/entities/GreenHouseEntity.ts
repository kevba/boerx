import { effect, signal } from "@angular/core";
import Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import { EntityType } from "../../models/entity";
import { Crop } from "../../services/items/crop.service";
import { Entity } from "./Entity";
import { Sprite } from "./Sprite";
import { ConsumePower } from "./abilities/consumePower";
import { CropStock, ICropStock } from "./abilities/cropStock";
import { Cultivate, ICultivate } from "./abilities/cultivate";

export class GreenhouseEntity
  extends Entity<GreenhouseImage, GreenhouseUpgrade>
  implements ICropStock, ICultivate
{
  type = EntityType.Greenhouse;

  upgrade = signal<GreenhouseUpgrade>(GreenhouseUpgrade.Shed);

  cropStock = new CropStock(5);
  cultivate: GreenhouseCultivate = new GreenhouseCultivate(this);
  consumePower = new ConsumePower(5);

  constructor(
    initialCoords: { x: number; y: number },
    layer: Konva.Layer,
    upgrade: GreenhouseUpgrade = GreenhouseUpgrade.Shed,
  ) {
    const id = uuidv4();

    const node = new GreenhouseImage({
      ...initialCoords,
      id,
    });
    layer.add(node);

    super({
      id,
      node,
    });
    this.upgrade.set(upgrade);

    this.init();
  }

  private _consumePowerEffect = effect(() => {
    const hasPower = this.consumePower.hasPower();
    this.node.setPowerState(hasPower);
  });
}

class GreenhouseCultivate extends Cultivate {
  override defaultCrop = Crop.Tomato;

  constructor(override entity: GreenhouseEntity) {
    super(entity);
  }

  override growth(): number {
    if (!this.entity.consumePower.canConsume()) {
      return 0;
    }

    return 2;
  }
}

export enum GreenhouseUpgrade {
  Shed = "Shed",
  Storage = "Storage",
  Warehouse = "Warehouse",
}

export class GreenhouseImage extends Sprite<GreenhouseEntity> {
  override color = { r: 220, g: 20, b: 20 };
  private hasPower = true;

  constructor(args: { x: number; y: number; id: string }) {
    super({
      id: `greenhouse_${args.id}`,
      name: EntityType.Greenhouse,
      x: args.x,
      y: args.y,
      imageSrc: "/sprites/greenhouse.png",
      EntityType: EntityType.Greenhouse,
      totalFrames: 2,
      frameWidth: 24,
      frameHeight: 24,
    });
  }

  override updateFrame() {
    if (!this.hasPower) {
      this.frame = 1;
    } else {
      this.frame = 0;
    }
  }

  setPowerState(hasPower: boolean) {
    this.hasPower = hasPower;
  }
}
