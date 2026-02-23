import Konva from "konva";
import { EntityType } from "../../models/entity";
import { Cow } from "../../services/entities/cow.service";
import { RenderUtils } from "../utils/renderUtils";
import { Sprite } from "./Sprite";
import { Direction, MoveBehavior } from "./behaviors/move";

export class CowEntity {
  private image: CowImage;
  private layer: Konva.Layer;
  private moveBehavior: MoveBehavior;

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

    this.moveBehavior = new MoveBehavior(this.image, 12, (direction) =>
      this.setDirection(direction),
    );

    this.update(cow);
    this.layer.add(this.image);

    setInterval(() => {
      this.followCursor();
    }, 200);
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
    this.image.on("click", (e) => callback(e));
  }

  destroy() {
    this.image.destroy();
  }

  private followCursor() {
    const stage = this.image.getStage();
    if (!stage) return;

    const mousePos = stage.getRelativePointerPosition();
    if (!mousePos) return;

    this.moveBehavior.moveTo(mousePos, () => {}, 10);
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
