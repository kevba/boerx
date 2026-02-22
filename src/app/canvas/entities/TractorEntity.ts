import Konva from "konva";
import { EntityType } from "../../models/entity";
import { Tractor } from "../../services/entities/tractor.service";
import { RenderUtils } from "../utils/renderUtils";
import { Sprite } from "./Sprite";

export class TractorEntity {
  private image: TractorImage;
  private layer: Konva.Layer;
  private movementSpeed = 15;
  private moveInterval: any;

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

    this.update(tractor);
    this.layer.add(this.image);

    this.moveToPlot();
  }

  update(tractor: Tractor) {
    this.image.setColor(RenderUtils.BrandColors[tractor.brand]);
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

  private moveToPlot() {
    if (this.image.draggable()) {
      this.moveInterval = setTimeout(() => {
        this.moveToPlot();
      }, 1000);
      return;
    }

    const plots = this.layer.getParent()?.find(`.plot`) || [];
    const coords = this.image.position();
    const closestPlot = this.findClosestPlot(coords, plots);

    if (!closestPlot) {
      this.moveInterval = setTimeout(() => {
        this.moveToPlot();
      }, 2000);
      return;
    }

    const plotWidth = RenderUtils.entitySize[EntityType.Plot][0];
    const plotHeight = RenderUtils.entitySize[EntityType.Plot][1];

    // Center to center diff
    const xDiff =
      coords.x - closestPlot.x() - plotWidth / 2 + this.image.width() / 2;

    const yDiff =
      coords.y - closestPlot.y() - plotHeight / 2 + this.image.height() / 2;

    // If we're close enough to the center stop moving
    if (Math.abs(xDiff) < plotWidth / 3 && Math.abs(yDiff) < plotHeight / 3) {
      this.moveInterval = setTimeout(() => {
        this.moveToPlot();
      }, 2000);
      return;
    }

    const xMovement =
      xDiff > 0
        ? Math.max(-this.movementSpeed, -xDiff)
        : Math.min(this.movementSpeed, -xDiff);
    const yMovement =
      yDiff > 0
        ? Math.max(-this.movementSpeed, -yDiff)
        : Math.min(this.movementSpeed, -yDiff);

    if (xMovement <= 0) {
      this.setDirection("left");
    } else {
      this.setDirection("right");
    }

    this.image.to({
      x: coords.x + xMovement,
      y: coords.y + yMovement,
      duration: 0.5,
    });

    this.moveInterval = setTimeout(() => {
      this.moveToPlot();
    }, 500);
  }

  private findClosestPlot(
    coords: { x: number; y: number },
    nodes: Konva.Node[],
  ) {
    let closestNode: Konva.Node = nodes[0];
    let closestDistance = Infinity;

    nodes.forEach((node) => {
      const nodePos = node.position();
      const dx = nodePos.x - coords.x;
      const dy = nodePos.y - coords.y;
      const distance = Math.hypot(dx, dy);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestNode = node;
      }
    });

    return closestNode;
  }

  private setDirection(direction: "left" | "right") {
    if (direction === "right") {
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
