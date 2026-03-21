import { effect, signal } from "@angular/core";
import Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import { EntityType } from "../../models/entity";
import { Entity } from "./Entity";
import { Sprite } from "./Sprite";
import { Cultivate, ICultivate } from "./abilities/cultivate";
import { IStorage, Storage } from "./abilities/store";

export class GreenhouseEntity
  extends Entity<GreenhouseImage, GreenhouseUpgrade>
  implements IStorage, ICultivate
{
  type = EntityType.Greenhouse;

  upgrade = signal<GreenhouseUpgrade>(GreenhouseUpgrade.Shed);

  storage = new Storage(5);
  cultivate = new Cultivate(this);

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

  protected override update(): void {
    if (this.node.isDragging() || this.node.draggable()) return;
  }

  upgradeTo(upgrade: GreenhouseUpgrade) {
    this.upgrade.set(upgrade);
  }

  private _upgradeEffect = effect(() => {
    const upgrade = this.upgrade();
  });
}

export enum GreenhouseUpgrade {
  Shed = "Shed",
  Storage = "Storage",
  Warehouse = "Warehouse",
}

export class GreenhouseImage extends Sprite<GreenhouseEntity> {
  override color = { r: 220, g: 20, b: 20 };

  constructor(args: { x: number; y: number; id: string }) {
    super({
      id: `greenhouse_${args.id}`,
      name: EntityType.Greenhouse,
      x: args.x,
      y: args.y,
      imageSrc: "/sprites/greenhouse.png",
      EntityType: EntityType.Greenhouse,
      totalFrames: 1,
      frameWidth: 24,
      frameHeight: 24,
    });
  }
}
