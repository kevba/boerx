import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import Konva from "konva";
import { SelectionService } from "../services/selection.service";
import { MachineRenderService } from "./machine-render.service";
import { PlotRenderService } from "./plot-render.service";
import { SurfaceService } from "./surface.service";

@Component({
  selector: "app-canvas",
  template: ` <div id="canvas-container" #canvas class="w-full h-full"></div>`,
})
export class CanvasComponent {
  private size = signal(20000);

  private plotRenderService = inject(PlotRenderService);
  private machineRenderService = inject(MachineRenderService);
  private selectionService = inject(SelectionService);
  private surfaceService = inject(SurfaceService);

  private backgroundLayer = new Konva.Layer();
  private backgroudRect = new Konva.Rect({
    id: "background",
    width: this.size(),
    height: this.size(),
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
      this.machineRenderService.setStage(stage);

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
    const minScale = 0.25;

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
    const width = this.canvasRef().nativeElement.clientWidth;
    const height = this.canvasRef().nativeElement.clientHeight;
    const size = this.size();

    const scale = stage.scaleX() as number;

    const minX = width * scale - size;
    const minY = height * scale - size;

    return {
      x: Math.max(minX, Math.min(0, pos.x)),
      y: Math.max(minY, Math.min(0, pos.y)),
    };
  };
}
