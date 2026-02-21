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
import { MachineRenderService } from "./machine-render.service";
import { PlotRenderService } from "./plot-render.service";

@Component({
  selector: "app-canvas",
  template: ` <div
    id="canvas-container"
    #canvas
    class="w-full h-full border-1 border-zinc-200"
  ></div>`,
})
export class CanvasComponent {
  private SIZE = 5000;

  private plotRenderService = inject(PlotRenderService);
  private machineRenderService = inject(MachineRenderService);
  private selectionService = inject(SelectionService);

  private backgroundLayer = new Konva.Layer({
    fill: "green",
  });

  private canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>(
    "canvas",
    {}
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
      dragBoundFunc: (pos) => {
        const scale = newStage.scaleX() as number;

        const minX = width * scale - this.SIZE;
        const minY = height * scale - this.SIZE;

        return {
          x: Math.max(minX, Math.min(0, pos.x)),
          y: Math.max(minY, Math.min(0, pos.y)),
        };
      },
    });
    return newStage;
  });

  constructor() {
    effect(() => {
      const stage = this.stage();
      if (!stage) return;

      this.addBackground(stage);
      this.plotRenderService.setStage(stage);
      this.machineRenderService.setStage(stage);

      stage.on("click", (e) => {
        if (e.target === stage) {
          this.selectionService.clear();
        }
      });

      this.handleZoom(stage);
    });
  }

  private addBackground(stage: Konva.Stage) {
    const bg = new Konva.Rect({
      width: this.SIZE,
      height: this.SIZE,
      fill: "oklch(42.1% 0.095 57.708)",
      listening: false,
    });

    this.backgroundLayer.add(bg);
    stage.add(this.backgroundLayer);
  }

  private handleZoom(stage: Konva.Stage) {
    const scaleBy = 1.05;
    const maxScale = 2;
    const minScale = 1;

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
      stage.position(newPos);
    });
  }
}
