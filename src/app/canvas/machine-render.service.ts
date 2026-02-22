import { effect, inject, Injectable } from "@angular/core";
import Konva from "konva";
import {
  Machine,
  MachineService,
  TractorBrand,
} from "../services/machine.service";
import { EntityType, SelectionService } from "../services/selection.service";
import { RenderUtils } from "./renderUtils";

@Injectable({
  providedIn: "root",
})
export class MachineRenderService {
  private machinesService = inject(MachineService);
  private selectionService = inject(SelectionService);

  layer = new Konva.Layer({
    imageSmoothingEnabled: false,
  });

  constructor() {
    effect(() => {
      const machines = this.machinesService.machines();
      const selectedMachines = this.selectionService.selectedMachines();

      machines.forEach((element, i) => {
        const isSelected = selectedMachines.includes(element.id);

        this.renderMachine(element, isSelected);
      });
    });
  }

  setStage(stage: Konva.Stage) {
    stage.add(this.layer);
  }

  private renderMachine(machine: Machine, selected: boolean) {
    const layer = this.layer;
    if (!layer) return;

    const drawnMachine = layer.findOne(`#${machine.id}`);
    if (drawnMachine && drawnMachine instanceof TractorImage) {
      drawnMachine.setColor(BrandColors[machine.brand]);
      drawnMachine.setAttr("draggable", selected);
      drawnMachine.setAttr(
        "stroke",
        selected ? RenderUtils.selectedColor : undefined,
      );

      return;
    }

    const machineBase = new TractorImage({
      machine: machine,
      x: 10,
      y: 10,
    });

    machineBase.on("click", (e) => {
      this.selectionService.setMulti(e.evt.shiftKey);
      this.selectionService.select(EntityType.Machine, machine.id);
    });

    layer.add(machineBase);
  }
}

class TractorImage extends Konva.Image {
  frame = 0;
  totalFrames = 3;
  frameWidth = 16;
  frameSpeed = 1000;

  private isAnimating = true;
  private sourceImage: HTMLImageElement | null = null;

  constructor(args: { x: number; y: number; machine: Machine }) {
    const imageObj = new Image();
    imageObj.src = "/sprites/tractor.png";
    imageObj.onload = () => {
      this.setColor(BrandColors[args.machine.brand]);
      this.animateSprite();
    };

    super({
      ...args,
      id: args.machine.id,
      width: 32,
      height: 32,
      // This image is a dummy
      image: imageObj,
      draggable: false,
      crop: { x: 0, y: 0, width: 16, height: 16 },
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
