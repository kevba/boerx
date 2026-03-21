import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  viewChild,
} from "@angular/core";
import Konva from "konva";
import { EntityLayerService } from "../services/entity-layer.service";
import { SelectionService } from "../services/selection.service";
import { BuyRenderService } from "./buy-render.service";
import { SurfaceService } from "./surface.service";
import { WeatherRenderService } from "./weather-render.service";

@Component({
  selector: "app-canvas",
  template: ` <div
    id="canvas-container"
    #canvas
    class="w-full h-full min-w-0 min-h-0"></div>`,
})
export class CanvasComponent {
  private size = 2500;

  private buyRenderService = inject(BuyRenderService);
  private selectionService = inject(SelectionService);
  private surfaceService = inject(SurfaceService);
  private weatherRenderService = inject(WeatherRenderService);

  private entityLayerService = inject(EntityLayerService);

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
    effect(() => {
      const stage = this.stage();
      if (!stage) return;

      stage.add(this.surfaceService.backgroundLayer);
      stage.add(this.entityLayerService.bottomLayer);
      stage.add(this.entityLayerService.topLayer);
      this.buyRenderService.setStage(stage);

      stage.add(this.weatherRenderService.layer);

      stage.on("click tap", (e) => {
        if (e.target === stage) {
          this.selectionService.clear();
        }
      });

      stage.on("dragstart", (e) => {
        if (e.target === stage) {
          this.selectionService.clear();
        }
      });

      stage.scale({ x: 1, y: 1 });

      this.handleScrollZoom(stage);
      this.handlePinchZoom(stage);
    });
  }

  private handleScrollZoom(stage: Konva.Stage) {
    stage.on("wheel", (e) => {
      e.evt.preventDefault();
      const pointer = stage.getPointerPosition()!;

      let direction = e.evt.deltaY < 0 ? 1 : -1;
      this.zoom(direction, pointer);
    });
  }

  private handlePinchZoom(stage: Konva.Stage) {
    // stage.on("touchmove", (e) => {
    //   e.evt.preventDefault();
    //   const touch1 = e.evt.touches[0];
    //   const touch2 = e.evt.touches[1];
    //   // this.zoom(direction, pointer);
    // });
  }

  private zoom(direction: number, centerPoint: { x: number; y: number }) {
    const scaleBy = 1.05;
    const maxScale = 2;

    const stage = this.stage();
    if (!stage) return;
    const oldScale = stage.scaleX();

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

    const mousePointTo = {
      x: (centerPoint.x - stage.x()) / oldScale,
      y: (centerPoint.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: centerPoint.x - mousePointTo.x * newScale,
      y: centerPoint.y - mousePointTo.y * newScale,
    };

    const boundedPos = this.boundsHelper(newPos, stage);
    stage.position(boundedPos);
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
