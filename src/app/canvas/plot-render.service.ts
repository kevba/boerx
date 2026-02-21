import { effect, inject, Injectable } from "@angular/core";
import Konva from "konva";
import { Crop } from "../services/crop.service";
import { Plot, PlotsService } from "../services/plots.service";
import { EntityType, SelectionService } from "../services/selection.service";

@Injectable({
  providedIn: "root",
})
export class PlotRenderService {
  private plotsService = inject(PlotsService);
  private selectionService = inject(SelectionService);
  layer = new Konva.Layer();

  private colorMap: Record<Crop, string> = {
    [Crop.Wheat]: "oklch(85.2% 0.199 91.936)",
    [Crop.Corn]: "oklch(68.1% 0.162 75.834)",
    [Crop.Potato]: "oklch(75% 0.183 55.934)",
    [Crop.Grass]: "oklch(62.7% 0.194 149.214)",
  };

  private selectedStyle = {
    stroke: "#c49949",
    strokeWidth: 4,
  };

  private baseStyle = {
    stroke: "#866933",
    strokeWidth: 4,
  };

  constructor() {
    effect(() => {
      const plots = this.plotsService.plots();
      const selectedPlots = this.selectionService.selectedPlots();

      plots.forEach((element, i) => {
        const isSelected = selectedPlots.includes(element.id);
        this.renderPlot(element, isSelected, i + 1);
      });
    });

    effect(() => {
      // canvas.on("mouse:down", (e) => {
      //   if (e.target instanceof PlotRender) {
      //     const id = e.target.id;
      //     this.handlePlotClick(id);
      //   } else {
      //     this.plotsService.selectPlot(null);
      //   }
      // });
    });
  }

  setStage(stage: Konva.Stage) {
    stage.add(this.layer);
  }

  private renderPlot(plot: Plot, selected: boolean, i: number) {
    const color = this.colorMap[plot.crop];
    const layer = this.layer;
    if (!layer) return;

    const drawnPlot = layer.findOne(`#${plot.id}`);

    if (drawnPlot) {
      drawnPlot.setAttrs({
        ...(selected ? this.selectedStyle : this.baseStyle),
        fill: color,
        draggable: selected,
      });

      return;
    }

    const plotRender = new PlotRender({
      id: plot.id,
      x: i * 50,
      y: 20,
      ...(selected ? this.selectedStyle : this.baseStyle),
      fill: color,
      draggable: selected,
    });
    plotRender.on("click", (e) => {
      this.selectionService.setMulti(e.evt.shiftKey);
      this.handlePlotClick(plot.id);
    });

    layer.add(plotRender);
  }

  private handlePlotClick(plotId: string) {
    this.selectionService.select(EntityType.Plot, plotId);
  }
}

class PlotRender extends Konva.Rect {
  constructor(...[options]: ConstructorParameters<typeof Konva.Rect>) {
    super({
      ...options,
      width: 120,
      height: 120,
      // hasControls: false,
      // selectable: true,
      // lockScalingX: true,
      // lockScalingY: true,
      // lockRotation: true,
    });
  }
}
