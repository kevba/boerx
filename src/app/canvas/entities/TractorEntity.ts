import Konva from "konva";
import { EntityType } from "../../models/entity";
import { Direction, MoveBehavior } from "./behaviors/move";
import { BehaviorUtils } from "./behaviors/utils";
import { Entity } from "./Entity";
import { Sprite } from "./Sprite";

export class TractorEntity extends Entity<TractorImage> {
  override selectable = true;
  override type = EntityType.Tractor;
  private moveBehavior: MoveBehavior;
  private homePlotId: string | null = null;
  override initialDirection: Direction = Direction.right;
  upgrade: TractorUpgrade;

  private moveEntityTarget: EntityType.Barn | EntityType.Plot = EntityType.Plot;

  private brandSpeed: Record<TractorUpgrade, number> = {
    [TractorUpgrade.DearJuan]: 24,
    [TractorUpgrade.OldHillland]: 48,
    [TractorUpgrade.Kerel]: 120,
    [TractorUpgrade.Klaas]: 240,
  };

  private brandColors: Record<
    TractorUpgrade,
    { r: number; g: number; b: number }
  > = {
    [TractorUpgrade.DearJuan]: { r: 54, g: 185, b: 0 },
    [TractorUpgrade.OldHillland]: { r: 0, g: 102, b: 204 },
    [TractorUpgrade.Kerel]: { r: 200, g: 16, b: 46 },
    [TractorUpgrade.Klaas]: { r: 255, g: 128, b: 0 },
  };

  constructor(
    initialCoords: { x: number; y: number },
    layer: Konva.Layer,
    upgrade: TractorUpgrade = TractorUpgrade.DearJuan,
  ) {
    const id = crypto.randomUUID();
    const node = new TractorImage({
      id: id,
      x: initialCoords.x,
      y: initialCoords.y,
    });
    layer.add(node);

    super({
      id: id,
      node: node,
    });

    this.upgrade = upgrade;
    this.moveBehavior = new MoveBehavior(
      this.node,
      this.brandSpeed[this.upgrade],
      (direction) => this.setDirection(direction),
    );

    this.init();
  }

  // update(tractor: Tractor) {
  //   this.image.setColor(RenderUtils.BrandColors[tractor.upgrade]);
  //   this.moveBehavior.setSpeed(this.brandSpeed[tractor.upgrade]);
  // }

  protected override update(): void {
    if (this.node.isDragging() || this.node.draggable()) return;
    this.moveToTarget();
  }

  private moveToTarget() {
    const coords = this.node.position();
    let targetNode: Konva.Node | undefined;
    const layer = this.node.getLayer()!.getParent()!;

    if (this.moveEntityTarget === EntityType.Plot && this.homePlotId) {
      targetNode = layer.findOne(`#${this.homePlotId}`);
      if (!targetNode) {
        this.homePlotId = null;
      }
    }

    // If we don't have a home plot or we're moving towards the barn, find the closest target
    if (!targetNode) {
      const targets = layer.find(`.${this.moveEntityTarget}`) || [];
      targetNode = BehaviorUtils.findClosest(coords, targets);
    }

    const nextTarget =
      this.moveEntityTarget === EntityType.Plot
        ? EntityType.Barn
        : EntityType.Plot;

    if (!targetNode) {
      this.moveBehavior.stop();
      this.moveEntityTarget = nextTarget;

      return;
    }

    this.moveBehavior.moveToTarget(targetNode, () => {
      if (
        this.moveEntityTarget === EntityType.Plot &&
        this.homePlotId === null
      ) {
        this.homePlotId = targetNode.id();
      }

      this.moveEntityTarget = nextTarget;
    });
  }
}

class TractorImage extends Sprite {
  constructor(args: { x: number; y: number; id: string }) {
    super({
      id: `tractor_${args.id}`,
      name: EntityType.Tractor,
      x: args.x,
      y: args.y,
      imageSrc: "/sprites/tractor.png",
      EntityType: EntityType.Tractor,
      totalFrames: 3,
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

export enum TractorUpgrade {
  DearJuan = "Dear Juan",
  OldHillland = "Old Hillland",
  Kerel = "Kerel",
  Klaas = "Klaas",
}
