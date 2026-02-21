import { effect, inject, Injectable } from "@angular/core";
import Konva from "konva";
import { Crop } from "../services/crop.service";
import { Plot, PlotsService } from "../services/plots.service";
import { EntityType, SelectionService } from "../services/selection.service";
import { ColorMap, NoisyImageService } from "./noisy-image.service";

@Injectable({
  providedIn: "root",
})
export class PlotRenderService {
  private plotsService = inject(PlotsService);
  private selectionService = inject(SelectionService);
  private noisyImageService = inject(NoisyImageService);

  private SIZE = 120;

  layer = new Konva.Layer();

  private transparentColorMap: ColorMap = {
    "-0.5": "#1010101f",
    "-0.2": "#7F7F7F1f",
    "0": "#7F7F7F1f",
    "0.3": "#FFFFFF1f",
  };

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
  }

  setStage(stage: Konva.Stage) {
    stage.add(this.layer);
  }

  private renderPlot(plot: Plot, selected: boolean, i: number) {
    const layer = this.layer;
    if (!layer) return;

    const coords = { x: i * 50, y: 20 };

    const drawnPlot = layer.findOne(`#${plot.id}-base`);

    if (drawnPlot) {
      drawnPlot.setAttrs({
        ...this.getPlotAttributes(plot, selected),
      });

      return;
    }

    const plotBase = new Konva.Rect({
      id: plot.id + "-base",
      x: coords.x,
      y: coords.y,
      height: this.SIZE,
      width: this.SIZE,
      ...this.getPlotAttributes(plot, selected),
    });

    const plotOverlay = new Konva.Rect({
      id: plot.id + "-overlay",
      x: coords.x,
      y: coords.y,
      height: this.SIZE,
      width: this.SIZE,
      listening: false,
      draggable: false,
    });

    const fillPatternImage = new Image();
    fillPatternImage.onload = () => {
      plotOverlay.setAttr("fillPatternImage", fillPatternImage);
    };
    fillPatternImage.src = this.noisyImageService.getNoiseImage(
      120,
      10,
      0.9,
      this.transparentColorMap,
    );

    const group = new Konva.Group({
      id: plot.id,
      x: coords.x,
      y: coords.y,
      draggable: true,
    });

    group.on("click", (e) => {
      this.selectionService.setMulti(e.evt.shiftKey);
      this.handlePlotClick(plot.id);
    });

    group.add(plotBase);
    group.add(plotOverlay);
    layer.add(group);
  }

  private handlePlotClick(plotId: string) {
    this.selectionService.select(EntityType.Plot, plotId);
  }

  private getPlotAttributes(plot: Plot, selected: boolean) {
    const color = this.colorMap[plot.crop];
    return {
      ...(selected ? this.selectedStyle : this.baseStyle),
      fill: color,
    };
  }
}
