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

    return new Konva.Stage({
      container: "canvas-container",
      width: this.canvasRef().nativeElement.clientWidth,
      height: this.canvasRef().nativeElement.clientHeight,
    });
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
    });
  }

  private addBackground(stage: Konva.Stage) {
    const bg = new Konva.Rect({
      width: stage.width(),
      height: stage.height(),
      fill: "oklch(42.1% 0.095 57.708)",
      listening: false,
    });

    this.backgroundLayer.add(bg);
    stage.add(this.backgroundLayer);
  }
}
