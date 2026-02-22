import Konva from "konva";
import { EntityType } from "../../models/entity";
import { RenderUtils } from "../utils/renderUtils";

export class Sprite extends Konva.Image {
  frame = 0;
  totalFrames: number;
  frameWidth: number;
  frameHeight: number;
  frameSpeed: number = 1000;

  private color = { r: 255, g: 0, b: 0 };

  private isAnimating = true;
  private sourceImage: HTMLImageElement | null = null;

  constructor(options: {
    id: string;
    x: number;
    y: number;
    imageSrc: string;
    EntityType: EntityType;
    totalFrames: number;
    frameWidth: number;
    frameHeight: number;
    color?: { r: number; g: number; b: number };
  }) {
    const width = RenderUtils.entitySize[options.EntityType][0];
    const height = RenderUtils.entitySize[options.EntityType][1];

    super({
      id: options.id,
      x: options.x,
      y: options.y,
      width: width,
      height: height,
      // This image is a dummy
      image: new Image(),
      draggable: false,
    });
    this.totalFrames = options.totalFrames;
    this.frameWidth = options.frameWidth;
    this.frameHeight = options.frameHeight;

    this.setAttr("crop", {
      x: 0,
      y: 0,
      width: this.frameWidth,
      height: this.frameHeight,
    });

    this.sourceImage = new Image();
    this.sourceImage.src = options.imageSrc;
    this.sourceImage.onload = () => {
      const processedImage = RenderUtils.preprocessImage(
        this.sourceImage!,
        this.color,
      );
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
      const processedImage = RenderUtils.preprocessImage(
        this.sourceImage,
        color,
      );
      this.image(processedImage);
    }
  }

  override destroy(): this {
    this.isAnimating = false;
    return super.destroy();
  }
}
