import { effect, inject, Injectable, signal } from "@angular/core";
import { Canvas, Rect } from "fabric";
import { Crop } from "../services/crop.service";
import { Plot, PlotsService } from "../services/plots.service";

@Injectable({
  providedIn: "root",
})
export class PlotRenderService {
  private plotsService = inject(PlotsService);
  canvas = signal<Canvas | undefined>(undefined);

  private colorMap: Record<Crop, string> = {
    [Crop.Wheat]: "oklch(85.2% 0.199 91.936)",
    [Crop.Corn]: "oklch(68.1% 0.162 75.834)",
    [Crop.Potato]: "oklch(75% 0.183 55.934)",
    [Crop.Grass]: "oklch(62.7% 0.194 149.214)",
  };

  constructor() {
    effect(() => {
      const plots = this.plotsService.plots();
      plots.forEach((element, i) => {
        this.renderPlot(element, i + 1);
      });
    });

    effect(() => {
      const canvas = this.canvas();
      if (!canvas) return;

      canvas.on("mouse:down", (e) => {
        if (e.target instanceof PlotRender) {
          const id = e.target.id;
          this.handlePlotClick(id);
        } else {
          this.plotsService.selectPlot(null);
        }
      });
    });
  }

  private renderPlot(plot: Plot, i: number) {
    const color = this.colorMap[plot.crop];
    const canvas = this.canvas();
    if (!canvas) return;

    const drawnPlot = canvas
      .getObjects()
      .find((o) => o instanceof PlotRender && o.id === plot.id);

    if (drawnPlot) {
      drawnPlot.set({ fill: color });
      canvas.requestRenderAll();

      return;
    }

    const plotRender = new PlotRender(plot.id, {
      left: i * 160,
      top: 100,
      fill: color,
    });

    canvas.add(plotRender);
  }

  private handlePlotClick(plotId: string) {
    this.plotsService.selectPlot(plotId);
  }
}

class PlotRender extends Rect {
  id: string;

  constructor(id: string, ...[options]: ConstructorParameters<typeof Rect>) {
    super({
      ...options,
      width: 120,
      height: 120,
      hasControls: false,
      selectable: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
    });
    this.id = id;
  }
}
