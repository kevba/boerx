import Konva from "konva";
import { EntityType } from "../../models/entity";
import { Tractor, TractorBrand } from "../../services/entities/tractor.service";
import { RenderUtils } from "../utils/renderUtils";
import { Sprite } from "./Sprite";
import { Direction, MoveBehavior } from "./behaviors/move";
import { BehaviorUtils } from "./behaviors/utils";

export class TractorEntity {
  private image: TractorImage;
  private layer: Konva.Layer;
  private moveBehavior: MoveBehavior;
  private homePlotId: string | null = null;

  private moveEntityTarget: EntityType.Barn | EntityType.Plot = EntityType.Plot;

  private brandSpeed: Record<TractorBrand, number> = {
    [TractorBrand.DearJuan]: 24,
    [TractorBrand.OldHillland]: 48,
    [TractorBrand.Kerel]: 120,
    [TractorBrand.Klaas]: 240,
  };

  constructor(
    tractor: Tractor,
    initialCoords: { x: number; y: number },
    layer: Konva.Layer,
  ) {
    this.layer = layer;
    this.image = new TractorImage({
      tractor: tractor,
      x: initialCoords.x,
      y: initialCoords.y,
    });

    this.layer.add(this.image);

    this.moveBehavior = new MoveBehavior(
      this.image,
      this.brandSpeed[tractor.brand],
      (direction) => this.setDirection(direction),
    );

    this.update(tractor);
    setInterval(() => {
      this.moveToTarget();
    }, 200);
  }

  update(tractor: Tractor) {
    this.image.setColor(RenderUtils.BrandColors[tractor.brand]);
    this.moveBehavior.setSpeed(this.brandSpeed[tractor.brand]);
  }

  setSelected(selected: boolean) {
    this.image.setAttr("draggable", selected);
    this.image.setAttr(
      "stroke",
      selected ? RenderUtils.selectedColor : undefined,
    );
  }

  onClick(callback: () => void) {
    this.image.on("click", callback);
  }

  destroy() {
    this.image.destroy();
  }

  private moveToTarget() {
    if (this.image.draggable()) {
      this.moveBehavior.stop();
      return;
    }

    const coords = this.image.position();
    let targetNode: Konva.Node | undefined;

    if (this.moveEntityTarget === EntityType.Plot && this.homePlotId) {
      targetNode = this.layer.getParent()?.findOne(`#${this.homePlotId}`);
      if (!targetNode) {
        this.homePlotId = null;
      }
    }

    // If we don't have a home plot or we're moving towards the barn, find the closest target
    if (!targetNode) {
      const targets =
        this.layer.getParent()?.find(`.${this.moveEntityTarget}`) || [];
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

  private setDirection(direction: Direction) {
    if (direction === Direction.right) {
      this.image.scaleX(1);
      this.image.offsetX(0);
    } else {
      this.image.scaleX(-1);
      this.image.offsetX(this.image.width());
    }
  }
}

class TractorImage extends Sprite {
  constructor(args: { x: number; y: number; tractor: Tractor }) {
    super({
      id: `tractor_${args.tractor.id}`,
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
