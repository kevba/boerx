import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  viewChild,
} from "@angular/core";
import { Canvas } from "fabric";
import { MachineRenderService } from "./machine-render.service";
import { PlotRenderService } from "./plot-render.service";

@Component({
  selector: "app-canvas",
  template: ` <canvas
    #canvas
    class="w-full h-full border-1 border-zinc-200"
  ></canvas>`,
})
export class CanvasComponent {
  private plotRenderService = inject(PlotRenderService);
  private machineRenderService = inject(MachineRenderService);
  private dragData = {
    isDragging: false,
    lastPosX: 0,
    lastPosY: 0,
  };

  private canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>(
    "canvas",
    {}
  );

  private canvas = computed(() => {
    return new Canvas(this.canvasRef().nativeElement, {
      width: this.canvasRef().nativeElement.clientWidth,
      height: this.canvasRef().nativeElement.clientHeight,
      selection: false,
    });
  });

  constructor() {
    effect(() => {
      const canvas = this.canvas();
      if (!canvas) return;
      this.plotRenderService.canvas.set(canvas);
      this.machineRenderService.canvas.set(canvas);
    });

    effect(() => {
      const canvas = this.canvas();

      canvas.on("mouse:wheel", function (opt) {
        var delta = opt.e.deltaY;
        var zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;

        if (zoom > 1) zoom = 1;
        if (zoom < 0.2) zoom = 0.2;

        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY } as any, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });
    });

    effect(() => {
      const canvas = this.canvas();

      canvas.on("mouse:down", (opt) => {
        var evt = opt.e as any;
        if (canvas.getActiveObject()) {
          return;
        }

        this.dragData.isDragging = true;
        this.dragData.lastPosX = evt.clientX;
        this.dragData.lastPosY = evt.clientY;
      });

      canvas.on("mouse:move", (opt) => {
        if (this.dragData.isDragging) {
          var e = opt.e as any;
          var vpt = canvas.viewportTransform;
          vpt[4] += e.clientX - this.dragData.lastPosX;
          vpt[5] += e.clientY - this.dragData.lastPosY;
          canvas.requestRenderAll();
          this.dragData.lastPosX = e.clientX;
          this.dragData.lastPosY = e.clientY;
        }
      });
      canvas.on("mouse:up", (opt) => {
        // on mouse up we want to recalculate new interaction
        // for all objects, so we call setViewportTransform
        canvas.setViewportTransform(canvas.viewportTransform);

        this.dragData.isDragging = false;
      });
    });
  }
}
