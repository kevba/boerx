import { signal } from "@angular/core";
import Konva from "konva";
import { EntityType } from "../../models/entity";
import { Entity } from "./Entity";
import { Sprite } from "./Sprite";

export class BarnEntity extends Entity<BarnImage, BarnUpgrade> {
  type = EntityType.Barn;
  selectable = true;

  upgrade = signal<BarnUpgrade>(BarnUpgrade.Shed);

  constructor(
    initialCoords: { x: number; y: number },
    layer: Konva.Layer,
    upgrade: BarnUpgrade = BarnUpgrade.Shed,
  ) {
    const id = crypto.randomUUID();

    const node = new BarnImage({
      ...initialCoords,
      id,
    });
    layer.add(node);

    super({
      id,
      node,
    });
    this.upgrade.set(upgrade);
  }

  upgradeTo(upgrade: BarnUpgrade) {
    this.upgrade.set(upgrade);
  }
}

export enum BarnUpgrade {
  Shed = "Shed",
  Storage = "Storage",
  Warehouse = "Warehouse",
}

class BarnImage extends Sprite {
  constructor(args: { x: number; y: number; id: string }) {
    super({
      id: `barn_${args.id}`,
      name: EntityType.Barn,
      x: args.x,
      y: args.y,
      imageSrc: "/imgs/barn.png",
      EntityType: EntityType.Barn,
      totalFrames: 1,
      frameWidth: 32,
      frameHeight: 32,
    });
  }
}
