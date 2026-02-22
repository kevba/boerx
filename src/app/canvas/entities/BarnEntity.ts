import Konva from "konva";
import { EntityType } from "../../models/entity";
import { Barn } from "../../services/entities/barn.service";
import { RenderUtils } from "../utils/renderUtils";
import { Sprite } from "./Sprite";

export class BarnEntity {
  private image: BarnImage;
  private layer: Konva.Layer;

  constructor(
    barn: Barn,
    initialCoords: { x: number; y: number },
    layer: Konva.Layer,
  ) {
    this.layer = layer;
    this.image = new BarnImage({
      barn: barn,
      x: initialCoords.x,
      y: initialCoords.y,
    });

    this.update(barn);
    this.layer.add(this.image);
  }

  update(barn: Barn) {}

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
}

class BarnImage extends Sprite {
  constructor(args: { x: number; y: number; barn: Barn }) {
    super({
      id: `barn_${args.barn.id}`,
      x: args.x,
      y: args.y,
      imageSrc: "/imgs/barn.png",
      EntityType: EntityType.Barn,
      totalFrames: 1,
      frameWidth: 32,
      frameHeight: 32,
    });
  }
}
