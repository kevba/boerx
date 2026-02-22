import { effect, inject, Injectable } from "@angular/core";
import Konva from "konva";
import { Crop } from "../services/crop.service";
import { Plot, PlotsService } from "../services/plots.service";
import { EntityType, SelectionService } from "../services/selection.service";
import { ColorMap, NoisyImageService } from "./noisy-image.service";
import { RenderUtils } from "./renderUtils";

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
    [Crop.Wheat]: "#ebc23e",
    [Crop.Corn]: "#f0e009",
    [Crop.Potato]: "#7e4f21",
    [Crop.Grass]: "#2d771a",
  };

  private selectedStyle = {
    stroke: RenderUtils.selectedColor,
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
        this.renderPlot(element, isSelected);
      });
    });
  }

  setStage(stage: Konva.Stage) {
    stage.add(this.layer);
  }

  private renderPlot(plot: Plot, selected: boolean) {
    const layer = this.layer;
    if (!layer) return;

    const coords = { x: 50, y: 20 };

    const drawnPlot = layer.findOne(`#${plot.id}-base`);
    const drawnGroup = layer.findOne(`#${plot.id}`);

    if (drawnPlot) {
      drawnPlot.setAttrs({
        ...this.getPlotAttributes(plot, selected),
      });
      drawnGroup!.setAttrs({
        draggable: selected,
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
      draggable: false,
    });

    group.on("click", (e) => {
      this.selectionService.setMulti(e.evt.shiftKey);
      this.selectionService.select(EntityType.Plot, plot.id);
    });

    group.add(plotBase);
    group.add(plotOverlay);
    layer.add(group);
  }

  private getPlotAttributes(plot: Plot, selected: boolean) {
    const color = this.colorMap[plot.crop];
    return {
      ...(selected ? this.selectedStyle : this.baseStyle),
      fill: color,
    };
  }
}
