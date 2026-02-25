import Konva from "konva";
import { EntityType } from "../../models/entity";
import { Crop } from "../../services/entities/crop.service";
import { ColorMap, NoisyImageService } from "../utils/noisy-image.service";
import { RenderUtils } from "../utils/renderUtils";
import { Direction } from "./behaviors/move";
import { Entity } from "./Entity";

export class PlotEntity extends Entity<PlotRender> {
  override selectable = true;
  override type = EntityType.Plot;

  override initialDirection: Direction = Direction.right;
  upgrade: PlotUpgrade;
  crop: Crop;

  private cropColor: Record<Crop, string> = {
    [Crop.Wheat]: "#ebc23e",
    [Crop.Corn]: "#f0e009",
    [Crop.Potato]: "#7e4f21",
    [Crop.Grass]: "#2d771a",
  };

  constructor(
    initialCoords: { x: number; y: number },
    layer: Konva.Layer,
    upgrade: PlotUpgrade = PlotUpgrade.Basic,
    crop: Crop = Crop.Grass,
  ) {
    const id = crypto.randomUUID();
    const node = new PlotRender({
      id: id,
      x: initialCoords.x,
      y: initialCoords.y,
    });
    layer.add(node);

    super({
      id: id,
      node: node,
    });

    this.upgrade = upgrade;
    this.crop = crop;
    this.init();
  }

  protected override update(): void {
    if (this.node.isDragging() || this.node.draggable()) return;
  }
}
export enum PlotUpgrade {
  Basic = "basic",
  Moisture = "moisture",
  Soil = "soil",
}

class PlotRender extends Konva.Group {
  constructor(args: { x: number; y: number; id: string }) {
    const width = RenderUtils.entitySize[EntityType.Plot][0];
    const height = RenderUtils.entitySize[EntityType.Plot][1];

    super({
      name: EntityType.Plot,
      id: "plot-" + args.id,
      width: width,
      height: height,
      x: args.x,
      y: args.y,
      draggable: false,
    });

    const plotBase = new Konva.Rect({
      id: "plot-" + args.id + "-base",
      stroke: "#b86a37ab",
      strokeWidth: 4,
      // Coords within the plot group, the group itself is positioned at the plot's coordinates
      x: 0,
      y: 0,
      width: width,
      height: height,
    });

    const plotOverlay = new Konva.Rect({
      id: "plot-" + args.id + "-overlay",
      // Coords within the plot group, the group itself is positioned at the plot's coordinates
      x: 0,
      y: 0,
      width: width,
      height: height,
      listening: false,
      draggable: false,
    });

    const fillPatternImage = new Image();
    fillPatternImage.onload = () => {
      plotOverlay.setAttr("fillPatternImage", fillPatternImage);
    };
    fillPatternImage.src = NoisyImageService.getNoiseImage(
      120,
      10,
      0.9,
      this.transparentColorMap,
    );

    this.add(plotBase);
    this.add(plotOverlay);
  }

  private transparentColorMap: ColorMap = {
    "-0.5": "#1010101f",
    "-0.2": "#7F7F7F1f",
    "0": "#7F7F7F1f",
    "0.3": "#FFFFFF1f",
  };
}
