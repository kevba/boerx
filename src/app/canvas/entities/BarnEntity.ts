import { signal } from "@angular/core";
import Konva from "konva";
import { EntityType } from "../../models/entity";
import { Entity } from "./Entity";
import { Sprite } from "./Sprite";
import { IStorer, Storer } from "./behaviors/storer";

export class BarnEntity
  extends Entity<BarnImage, BarnUpgrade>
  implements IStorer
{
  type = EntityType.Barn;
  selectable = true;

  upgrade = signal<BarnUpgrade>(BarnUpgrade.Shed);

  storage: Storer;

  maxStoragePerUpgrade: Record<BarnUpgrade, number> = {
    [BarnUpgrade.Shed]: 100,
    [BarnUpgrade.Storage]: 500,
    [BarnUpgrade.Warehouse]: 2000,
  };

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
    this.node.entity = this;
    this.storage = new Storer();
    this.upgrade.set(upgrade);
  }

  upgradeTo(upgrade: BarnUpgrade) {
    this.upgrade.set(upgrade);
  }

  _upgradeEffect() {
    const upgrade = this.upgrade();
    const storageSpace = this.maxStoragePerUpgrade[upgrade];
    this.storage.setMaxStorage(storageSpace);
  }
}

export enum BarnUpgrade {
  Shed = "Shed",
  Storage = "Storage",
  Warehouse = "Warehouse",
}

export class BarnImage extends Sprite<BarnEntity> {
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
