import Konva from "konva";
import { EntityType } from "../../models/entity";
import { RenderUtils } from "../utils/renderUtils";
import { Entity, EntityRender } from "./Entity";

export class Sprite<T extends Entity<any, any>> extends EntityRender<T> {
  frame = 0;
  totalFrames: number;
  frameWidth: number;
  frameHeight: number;
  frameSpeed: number = 1000;

  protected color = { r: 255, g: 255, b: 255 };

  protected isAnimating = true;
  protected sourceImage: HTMLImageElement | null = null;
  protected imageNode: Konva.Image;

  constructor(options: {
    id: string;
    name: string;
    x: number;
    y: number;
    imageSrc: string;
    EntityType: EntityType;
    totalFrames: number;
    frameWidth: number;
    frameHeight: number;
    color?: { r: number; g: number; b: number };
  }) {
    super({
      id: options.id,
      x: options.x,
      y: options.y,
      type: options.EntityType,
      // This image is a dummy
    });

    this.imageNode = new Konva.Image({
      height: this.height(),
      width: this.width(),
      image: new Image(),
    });
    this.add(this.imageNode);

    this.totalFrames = options.totalFrames;
    this.frameWidth = options.frameWidth;
    this.frameHeight = options.frameHeight;

    this.imageNode.setAttr("crop", {
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
      this.imageNode.image(processedImage);
      this.animateSprite();
    };
  }

  animateSprite() {
    this.updateFrame();
    this.imageNode.cropX(this.frame * this.frameWidth); // move crop to the next frame
    this.getLayer()?.batchDraw();
    if (this.isAnimating) {
      setTimeout(() => this.animateSprite(), this.frameSpeed); // frame delay
    }
  }

  updateFrame() {
    this.frame = (this.frame + 1) % this.totalFrames;
  }

  setColor(color: { r: number; g: number; b: number }) {
    this.color = color;
    if (this.sourceImage?.complete) {
      const processedImage = RenderUtils.preprocessImage(
        this.sourceImage,
        color,
      );
      this.imageNode.image(processedImage);
    }
  }

  override destroy(): this {
    this.isAnimating = false;
    return super.destroy();
  }
}
