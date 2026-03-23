import { inject, Injectable } from "@angular/core";
import Konva from "konva";
import { EntityType } from "../models/entity";
import { BuyService } from "../services/buy.service";
import { ImageUtils } from "./utils/imageUtils";
import { RenderUtils } from "./utils/renderUtils";

@Injectable({
  providedIn: "root",
})
export class BuyRenderService {
  private buyService = inject(BuyService);
  private ghost: Konva.Rect | null = null;
  private validLocation = false;

  private layer = new Konva.Layer({
    imageSmoothingEnabled: false,
  });

  constructor() {}

  setStage(stage: Konva.Stage) {
    stage.add(this.layer);
    stage.on("mousemove ", () => {
      const entityType = this.buyService.buyingEntityType();
      if (entityType) {
        const pos = stage.getRelativePointerPosition()!;
        this.drawGhost(entityType, pos.x, pos.y);
      } else {
        this.removeGhost();
      }
    });

    stage.on("contextmenu", (e) => {
      e.evt.preventDefault();
      const entity = this.buyService.buyingEntityType();
      if (entity) {
        this.buyService.clear();
        this.removeGhost();
      }
    });

    stage.on("click ", (e) => {
      e.evt.preventDefault();
      const entity = this.buyService.buyingEntityType();
      if (entity === null) return;

      const pos = stage.getRelativePointerPosition()!;
      this.drawGhost(entity!, pos.x, pos.y);

      if (!this.validLocation) return;

      if (entity) {
        const pos = stage.getRelativePointerPosition()!;
        const width = ImageUtils.entitySize[entity][0];
        const height = ImageUtils.entitySize[entity][1];

        const centerX = pos.x - width / 2;
        const centerY = pos.y - height / 2;
        this.buyService.confirm(centerX, centerY);
        this.removeGhost();
      }
    });

    stage.on("tap", (e) => {
      e.evt.preventDefault();
      const entity = this.buyService.buyingEntityType();
      if (entity === null) return;

      const pos = stage.getRelativePointerPosition()!;
      this.drawGhost(entity!, pos.x, pos.y);
      if (!this.validLocation) return;

      this.ghost?.off("tap");
      this.ghost?.on("tap", () => {
        if (!this.validLocation) return;

        const pos = stage.getRelativePointerPosition()!;
        const width = ImageUtils.entitySize[entity][0];
        const height = ImageUtils.entitySize[entity][1];

        const centerX = pos.x - width / 2;
        const centerY = pos.y - height / 2;
        this.buyService.confirm(centerX, centerY);
        this.removeGhost();
      });
    });
  }

  drawGhost(entity: EntityType, x: number, y: number) {
    const width = ImageUtils.entitySize[entity][0];
    const height = ImageUtils.entitySize[entity][1];

    const centerX = x - width / 2;
    const centerY = y - height / 2;

    if (!this.ghost) {
      const ghostRec = new Konva.Rect({
        x: centerX,
        y: centerY,
        width: width,
        height: height,
        fill: "#a5743ba2",
        stroke: ImageUtils.selectedColor,
        strokeWidth: 4,
        id: "buy-ghost",
        dash: [4, 4], // [dot size, gap size]
      });
      this.layer.add(ghostRec);
      this.ghost = ghostRec;
    }

    this.ghost.setSize({ width, height });
    this.ghost.position({ x: centerX, y: centerY });
    if (this.detectCollision()) {
      this.ghost.stroke("red");
      this.validLocation = false;
    } else {
      this.ghost.stroke(ImageUtils.selectedColor);
      this.validLocation = true;
    }
    return;
  }

  removeGhost() {
    this.ghost?.destroy();
    this.ghost = null;
  }

  private detectCollision() {
    if (!this.ghost) return false;

    const entities =
      (this.layer.parent! as Konva.Stage)
        .getLayers()
        .find((layer) => layer.id() === "entityBottomLayer")?.children || [];

    for (const child of entities) {
      const intersect = RenderUtils.intersect(
        this.ghost.getClientRect(),
        child.getClientRect(),
      );
      if (intersect) {
        return true;
      }
    }
    return false;
  }
}
