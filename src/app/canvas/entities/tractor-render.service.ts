import { effect, inject, Injectable } from "@angular/core";
import Konva from "konva";
import { EntityType } from "../../models/entity";
import { BuyService } from "../../services/buy.service";
import {
  Tractor,
  TractorService,
} from "../../services/entities/tractor.service";
import { SelectionService } from "../../services/selection.service";
import { RenderUtils } from "../utils/renderUtils";

@Injectable({
  providedIn: "root",
})
export class TractorRenderService {
  private tractorsService = inject(TractorService);
  private selectionService = inject(SelectionService);
  private buyService = inject(BuyService);

  private entities: Record<string, TractorEntity> = {};

  layer = new Konva.Layer({
    imageSmoothingEnabled: false,
  });

  constructor() {
    effect(() => {
      const tractors = this.tractorsService.tractors();
      const selectedTractors = this.selectionService.selectedTractors();

      tractors.forEach((element, i) => {
        const isSelected = selectedTractors.includes(element.id);

        this.renderTractor(element, isSelected);
      });
    });
  }

  setStage(stage: Konva.Stage) {
    stage.add(this.layer);
  }

  private renderTractor(tractor: Tractor, selected: boolean) {
    const layer = this.layer;
    if (!layer) return;

    let entity = this.entities[tractor.id];
    if (!entity) {
      const coords = this.buyService.getBuyLocation();
      entity = new TractorEntity(tractor, coords, layer);
      entity.onClick(() => {
        this.selectionService.setMulti(false);
        this.selectionService.select(EntityType.Tractor, tractor.id);
      });
      this.entities[tractor.id] = entity;
    }

    entity.update(tractor);
    entity.setSelected(selected);
  }
}

class TractorEntity {
  private image: TractorImage;
  private layer: Konva.Layer;

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

    // Center to center diff
    const xDiff =
      coords.x -
      closestPlot.x() -
      RenderUtils.entitySize[EntityType.Plot][0] / 2 +
      this.image.width() / 2;

    const yDiff =
      coords.y -
      closestPlot.y() -
      RenderUtils.entitySize[EntityType.Plot][1] / 2 +
      this.image.height() / 2;

    const xMovement = xDiff > 0 ? Math.max(-15, -xDiff) : Math.min(15, -xDiff);
    const yMovement = yDiff > 0 ? Math.max(-15, -yDiff) : Math.min(15, -yDiff);

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

class TractorImage extends Konva.Image {
  frame = 0;
  totalFrames = 3;
  frameWidth = 16;
  frameHeight = 16;
  frameSpeed = 1000;

  private color = { r: 255, g: 0, b: 0 };

  private isAnimating = true;
  private sourceImage: HTMLImageElement | null = null;

  constructor(args: { x: number; y: number; tractor: Tractor }) {
    const width = RenderUtils.entitySize[EntityType.Tractor][0];
    const height = RenderUtils.entitySize[EntityType.Tractor][1];

    super({
      ...args,
      id: args.tractor.id,
      width: width,
      height: height,
      // This image is a dummy
      image: new Image(),
      draggable: false,
    });

    this.setAttr("crop", {
      x: 0,
      y: 0,
      width: this.frameWidth,
      height: this.frameHeight,
    });

    this.sourceImage = new Image();
    this.sourceImage.src = "/sprites/tractor.png";
    this.sourceImage.onload = () => {
      const processedImage = preprocessImage(this.sourceImage!, this.color);
      this.image(processedImage);
      this.animateSprite();
    };
  }

  animateSprite() {
    this.frame = (this.frame + 1) % this.totalFrames;
    this.cropX(this.frame * this.frameWidth); // move crop to the next frame
    this.getLayer()?.batchDraw();
    if (this.isAnimating) {
      setTimeout(() => this.animateSprite(), this.frameSpeed); // frame delay
    }
  }

  setColor(color: { r: number; g: number; b: number }) {
    this.color = color;
    if (this.sourceImage?.complete) {
      const processedImage = preprocessImage(this.sourceImage, color);
      this.image(processedImage);
    }
  }

  override destroy(): this {
    this.isAnimating = false;
    return super.destroy();
  }
}

const preprocessImage = function (
  image: HTMLImageElement,
  rgb = { r: 255, g: 0, b: 0 },
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = image.width;
  canvas.height = image.height;

  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) {
      data[i] = rgb.r;
      data[i + 1] = rgb.g;
      data[i + 2] = rgb.b;
    }
  }

  // Put the processed image data back
  ctx.putImageData(imageData, 0, 0);

  return canvas;
};
