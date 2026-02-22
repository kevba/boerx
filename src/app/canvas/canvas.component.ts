import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  viewChild,
} from "@angular/core";
import Konva from "konva";
import { SelectionService } from "../services/selection.service";
import { BuyRenderService } from "./buy-render.service";
import { BarnRenderService } from "./renderServices/barn-render.service";
import { PlotRenderService } from "./renderServices/plot-render.service";
import { TractorRenderService } from "./renderServices/tractor-render.service";
import { SurfaceService } from "./surface.service";

@Component({
  selector: "app-canvas",
  template: ` <div
    id="canvas-container"
    #canvas
    class="w-full h-full min-w-[0px] min-h-[0px]"></div>`,
})
export class CanvasComponent {
  private size = 2500;

  private plotRenderService = inject(PlotRenderService);
  private tractorRenderService = inject(TractorRenderService);
  private barnRenderService = inject(BarnRenderService);

  private buyRenderService = inject(BuyRenderService);
  private selectionService = inject(SelectionService);
  private surfaceService = inject(SurfaceService);

  private backgroundLayer = new Konva.Layer();
  private backgroudRect = new Konva.Rect({
    id: "background",
    width: this.size,
    height: this.size,
    listening: false,
  });

  private canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>(
    "canvas",
    {},
  );

  private stage = computed(() => {
    if (!this.canvasRef().nativeElement) return;
    const width = this.canvasRef().nativeElement.clientWidth;
    const height = this.canvasRef().nativeElement.clientHeight;

    const newStage = new Konva.Stage({
      container: "canvas-container",
      width: width,
      height: height,
      draggable: true,
      x: -(this.size / 2 - width / 2),
      y: -(this.size / 2 - height / 2),
      dragBoundFunc: (pos): Konva.Vector2d => this.boundsHelper(pos, newStage),
    });

    return newStage;
  });

  constructor() {
    this.backgroundLayer.add(this.backgroudRect);

    effect(() => {
      const stage = this.stage();
      if (!stage) return;

      stage.add(this.backgroundLayer);
      this.plotRenderService.setStage(stage);
      this.barnRenderService.setStage(stage);
      this.tractorRenderService.setStage(stage);

      this.buyRenderService.setStage(stage);

      stage.on("click", (e) => {
        if (e.target === stage) {
          this.selectionService.clear();
        }
      });

      this.handleZoom(stage);
    });

    effect(() => {
      const url = this.surfaceService.tileImageUrl();
      if (!url) return;
      this.setBackgroundImage(url);
    });
  }

  private setBackgroundImage(imageUrl: string) {
    const imageObj = new Image();

    const bg = this.backgroundLayer.findOne("#background");
    if (!bg) return;

    // Image must be loaded before setting as fill pattern, otherwise it won't render
    imageObj.onload = () => {
      bg.setAttrs({ fillPatternImage: imageObj });
    };

    imageObj.src = imageUrl;
  }

  private handleZoom(stage: Konva.Stage) {
    const scaleBy = 1.05;
    const maxScale = 2;

    stage.scale({ x: 1, y: 1 });

    stage.on("wheel", (e) => {
      e.evt.preventDefault();

      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition()!;

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      let direction = e.evt.deltaY < 0 ? 1 : -1;

      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

      // Calculate dynamic minimum scale to prevent whitespace
      const viewportWidth = this.canvasRef().nativeElement.clientWidth;
      const viewportHeight = this.canvasRef().nativeElement.clientHeight;
      const minScale = Math.max(
        viewportWidth / this.size,
        viewportHeight / this.size,
      );

      if (newScale < minScale || newScale > maxScale) return;

      stage.scale({ x: newScale, y: newScale });

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };

      const boundedPos = this.boundsHelper(newPos, stage);
      stage.position(boundedPos);
    });
  }

  private boundsHelper = (
    pos: Konva.Vector2d,
    stage: Konva.Stage,
  ): Konva.Vector2d => {
    // Size of the div containing the canvas
    const viewportWidth = this.canvasRef().nativeElement.clientWidth;
    const viewportHeight = this.canvasRef().nativeElement.clientHeight;

    // Size of the canvas content, should be limited to this value, translated
    // to screen coordinates using the scale
    const size = this.size;

    const scale = stage.scaleX() as number;

    // Calculate bounds in screen coordinates
    const contentScreenWidth = size * scale;
    const contentScreenHeight = size * scale;

    // Prevent white space on all edges
    const minX = Math.min(0, -(contentScreenWidth - viewportWidth));
    const minY = Math.min(0, -(contentScreenHeight - viewportHeight));

    return {
      x: Math.max(minX, Math.min(0, pos.x)),
      y: Math.max(minY, Math.min(0, pos.y)),
    };
  };
}
