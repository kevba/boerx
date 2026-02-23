import Konva from "konva";
import { EntityType } from "../../models/entity";
import { Cow } from "../../services/entities/cow.service";
import { RenderUtils } from "../utils/renderUtils";
import { Sprite } from "./Sprite";

export class CowEntity {
  private image: CowImage;
  private layer: Konva.Layer;

  constructor(
    cow: Cow,
    initialCoords: { x: number; y: number },
    layer: Konva.Layer,
  ) {
    this.layer = layer;
    this.image = new CowImage({
      cow: cow,
      x: initialCoords.x,
      y: initialCoords.y,
    });

    this.update(cow);
    this.layer.add(this.image);
  }

  update(cow: Cow) {}

  setSelected(selected: boolean) {
    this.image.setAttr("draggable", selected);
    this.image.setAttr(
      "stroke",
      selected ? RenderUtils.selectedColor : undefined,
    );
  }

  onClick(callback: (e: Konva.KonvaEventObject<MouseEvent>) => void) {
    this.image.on("click", e => callback(e));
  }

  destroy() {
    this.image.destroy();
  }
}

class CowImage extends Sprite {
  constructor(args: { x: number; y: number; cow: Cow }) {
    super({
      id: `cow_${args.cow.id}`,
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
