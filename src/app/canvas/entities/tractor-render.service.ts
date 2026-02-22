import { effect, inject, Injectable } from "@angular/core";
import Konva from "konva";
import { EntityType } from "../../models/entity";
import { BuyService } from "../../services/buy.service";
import {
  Tractor,
  TractorBrand,
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

    const drawnTractor = layer.findOne(`#${tractor.id}`);
    if (drawnTractor && drawnTractor instanceof TractorImage) {
      drawnTractor.setColor(BrandColors[tractor.brand]);
      drawnTractor.setAttr("draggable", selected);
      drawnTractor.setAttr(
        "stroke",
        selected ? RenderUtils.selectedColor : undefined,
      );

      return;
    }
    const coords = this.buyService.getBuyLocation();

    const tractorBase = new TractorImage({
      tractor: tractor,
      x: coords.x,
      y: coords.y,
    });

    tractorBase.on("click", (e) => {
      this.selectionService.setMulti(e.evt.shiftKey);
      this.selectionService.select(EntityType.Tractor, tractor.id);
    });

    layer.add(tractorBase);
  }
}

class TractorImage extends Konva.Image {
  frame = 0;
  totalFrames = 3;
  frameWidth = 16;
  frameHeight = 16;
  frameSpeed = 1000;

  private isAnimating = true;
  private sourceImage: HTMLImageElement | null = null;

  constructor(args: { x: number; y: number; tractor: Tractor }) {
    const imageObj = new Image();
    imageObj.src = "/sprites/tractor.png";
    imageObj.onload = () => {
      this.setColor(BrandColors[args.tractor.brand]);
      this.animateSprite();
    };
    const width = RenderUtils.entitySize[EntityType.Tractor][0];
    const height = RenderUtils.entitySize[EntityType.Tractor][1];

    super({
      ...args,
      id: args.tractor.id,
      width: width,
      height: height,
      // This image is a dummy
      image: imageObj,
      draggable: false,
    });

    this.setAttr("crop", {
      x: 0,
      y: 0,
      width: this.frameWidth,
      height: this.frameHeight,
    });
    this.sourceImage = imageObj;
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
    const image = this.sourceImage;
    if (image) {
      const processedImage = preprocessImage(image, color);
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

const BrandColors: Record<string, { r: number; g: number; b: number }> = {
  [TractorBrand.DearJuan]: { r: 54, g: 185, b: 0 },
  [TractorBrand.OldHillland]: { r: 0, g: 102, b: 204 },
  [TractorBrand.Kerel]: { r: 200, g: 16, b: 46 },
  [TractorBrand.Klaas]: { r: 255, g: 128, b: 0 },
};
