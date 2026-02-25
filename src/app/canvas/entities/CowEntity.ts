import Konva from "konva";
import { EntityType } from "../../models/entity";
import { Direction, MoveBehavior } from "./behaviors/move";
import { Entity } from "./Entity";
import { Sprite } from "./Sprite";

export class CowEntity extends Entity<CowImage> {
  private moveBehavior: MoveBehavior;
  override initialDirection = Direction.left;

  type = EntityType.Cow;
  selectable = true;

  upgrade: CowUpgrade;

  constructor(
    initialCoords: { x: number; y: number },
    layer: Konva.Layer,
    upgrade: CowUpgrade = CowUpgrade.Cow,
  ) {
    const id = crypto.randomUUID();

    const node = new CowImage({
      id,
      ...initialCoords,
    });
    layer.add(node);

    super({
      id: id,
      node: node,
    });

    this.upgrade = upgrade;
    this.moveBehavior = new MoveBehavior(node, 12, (direction) =>
      this.setDirection(direction),
    );

    this.init();
  }

  override update() {
    if (this.node.isDragging() || this.node.draggable()) return;
    this.followCursor();
  }

  private followCursor() {
    const stage = this.node.getStage();
    if (!stage) return;

    const mousePos = stage.getRelativePointerPosition();
    if (!mousePos) return;

    this.moveBehavior.moveTo(mousePos, () => {}, 10);
  }
}

class CowImage extends Sprite {
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
