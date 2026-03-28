import { signal } from "@angular/core";
import Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import { EntityType } from "../../models/entity";
import { Entity } from "./Entity";
import { Sprite } from "./Sprite";
import { Direction, Movement } from "./abilities/move";

export class CowEntity extends Entity<CowImage, CowUpgrade> {
  private moveBehavior: Movement;

  type = EntityType.Cow;

  upgrade = signal<CowUpgrade>(CowUpgrade.Cow);

  constructor(
    initialCoords: { x: number; y: number },
    layer: Konva.Layer,
    upgrade: CowUpgrade = CowUpgrade.Cow,
  ) {
    const id = uuidv4();

    const node = new CowImage({
      id,
      ...initialCoords,
    });
    layer.add(node);

    super({
      id: id,
      node: node,
    });

    this.upgrade.set(upgrade);
    this.moveBehavior = new Movement(node, 12, (direction) =>
      this.node.setDirection(direction),
    );

    this.init();
  }

  override update() {
    if (this.node.isDragging() || this.node.draggable()) return;
    this.followCursor();
  }

  override upgradeTo(upgrade: CowUpgrade): void {}

  private followCursor() {
    const stage = this.node.getStage();
    if (!stage) return;

    const mousePos = stage.getRelativePointerPosition();
    if (!mousePos) return;

    this.moveBehavior.moveTo(mousePos, () => {}, 10);
  }
}

class CowImage extends Sprite<CowEntity> {
  override hasCollision = false;
  override initialDirection = Direction.left;

  constructor(args: { x: number; y: number; id: string }) {
    super({
      id: `cow_${args.id}`,
      name: EntityType.Cow,
      x: args.x,
      y: args.y,
      imageSrc: "/sprites/cow.png",
      EntityType: EntityType.Cow,
      totalFrames: 1,
      frameWidth: 16,
      frameHeight: 16,
    });
  }
}

export enum CowUpgrade {
  Cow = "Cow",
}
