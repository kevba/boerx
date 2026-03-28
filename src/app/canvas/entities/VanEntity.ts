import { signal } from "@angular/core";
import Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import { EntityType } from "../../models/entity";
import { IMovement, Movement } from "./abilities/move";
import { IStorage, Storage } from "./abilities/store";
import { ISeller, Seller } from "./behaviors/seller";
import { Entity } from "./Entity";
import { Sprite } from "./Sprite";

export class VanEntity
  extends Entity<VanRender, VanUpgrade>
  implements IStorage, IMovement, ISeller
{
  override type = EntityType.Van;

  seller: Seller;
  storage: Storage;
  move: Movement;

  upgrade = signal<VanUpgrade>(VanUpgrade.Van);

  constructor(
    initialCoords: { x: number; y: number },
    layer: Konva.Layer,
    upgrade: VanUpgrade = VanUpgrade.Van,
  ) {
    const id = uuidv4();
    const node = new VanRender({
      id: id,
      x: initialCoords.x,
      y: initialCoords.y,
    });
    layer.add(node);

    super({
      id: id,
      node: node,
    });
    node.entity = this;

    this.move = new Movement(this.node, 64, (direction) =>
      this.node.setDirection(direction),
    );

    this.upgrade.set(upgrade);
    this.storage = new Storage(10);

    this.seller = new Seller(this);

    this.init();
  }

  upgradeTo(upgrade: VanUpgrade) {
    this.upgrade.set(upgrade);
  }
}

export enum VanUpgrade {
  Van = "Van",
}

class VanRender extends Sprite<VanEntity> {
  override hasCollision = false;
  override color = { r: 200, g: 200, b: 200 };

  constructor(args: { x: number; y: number; id: string }) {
    super({
      id: `van_${args.id}`,
      name: EntityType.Van,
      x: args.x,
      y: args.y,
      imageSrc: "/sprites/van.png",
      EntityType: EntityType.Van,
      totalFrames: 1,
      frameWidth: 16,
      frameHeight: 16,
    });
    this.setAttr("crop", {
      x: 0,
      y: 0,
      width: this.frameWidth,
      height: this.frameHeight,
    });
  }
}
