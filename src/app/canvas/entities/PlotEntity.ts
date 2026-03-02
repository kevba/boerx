import { computed, effect, signal, untracked } from "@angular/core";
import Konva from "konva";
import { EntityType } from "../../models/entity";
import { Crop } from "../../services/entities/crop.service";
import { ColorMap, NoisyImageService } from "../utils/noisy-image.service";
import { RenderUtils } from "../utils/renderUtils";
import { Direction } from "./behaviors/move";
import { Entity } from "./Entity";

export class PlotEntity extends Entity<PlotRender, PlotUpgrade> {
  override selectable = true;
  override type = EntityType.Plot;

  override initialDirection: Direction = Direction.right;
  upgrade = signal<PlotUpgrade>(PlotUpgrade.Basic);
  crop = signal<Crop>(Crop.Grass);
  canHarvest = computed(() => {
    const crop = this.crop();
    const growthStage = this.cropGrowthStage();
    const maxGrowthStage = this.cropStageCount[crop];
    return growthStage >= maxGrowthStage;
  });

  private cropColor: Record<Crop, string> = {
    [Crop.Wheat]: "#ebc23e",
    [Crop.Corn]: "#d6c800",
    [Crop.Potato]: "#a76829",
    [Crop.Grass]: "#2d771a",
  };

  private cropStageCount: Record<Crop, number> = {
    [Crop.Wheat]: 30 * 1,
    [Crop.Corn]: 40 * 1,
    [Crop.Potato]: 50 * 1,
    [Crop.Grass]: 10 * 1,
  };

  private cropGrowthStage = signal(0);

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

    this.upgrade.set(upgrade);
    this.crop.set(crop);
    this.init();
  }

  protected override update(): void {
    if (this.node.isDragging() || this.node.draggable()) return;
    // Untracked to prevent infinite loop of growth -> update -> growth
    untracked(() => this.grow());
  }

  plantCrop(crop: Crop) {
    this.cropGrowthStage.set(0);
    this.crop.set(crop);
  }

  _cropChangeEffect = effect(() => {
    const crop = this.crop();
    this.node.setAttr("fill", this.cropColor[crop]);
  });

  upgradeTo(upgrade: PlotUpgrade) {
    this.upgrade.set(upgrade);
  }

  _upgradeChangeEffect = effect(() => {});

  private grow() {
    const crop = this.crop();
    const growthStage = this.cropGrowthStage();
    const maxGrowthStage = this.cropStageCount[crop];
    if (growthStage < maxGrowthStage) {
      this.cropGrowthStage.set(growthStage + 1);
    }
  }

  harvest() {
    this.crop.set(Crop.Grass);
    this.cropGrowthStage.set(0);
  }

  private _growthEffect = effect(() => {
    const crop = this.crop();
    const growthStage = this.cropGrowthStage();
    const maxGrowthStage = this.cropStageCount[crop];
    const growthFraction = maxGrowthStage ? growthStage / maxGrowthStage : 0;
    // console.log(`Growth fraction for ${crop}: ${growthFraction}`);
    const overlayIntensity = 0.5 - growthFraction * 0.3;
    this.node.renderOverlay(overlayIntensity);
  });
}

export enum PlotUpgrade {
  Basic = "basic",
  Moisture = "moisture",
  Soil = "soil",
}

class PlotRender extends Konva.Image {
  private canvas: HTMLCanvasElement;
  private noiseData: string[][];

  constructor(args: { x: number; y: number; id: string }) {
    const size = RenderUtils.entitySize[EntityType.Plot][0];
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    super({
      id: `plot_${args.id}`,
      name: EntityType.Plot,
      image: canvas,
      x: args.x,
      y: args.y,
    });

    this.noiseData = NoisyImageService.NoisyPattern(
      size / 8,
      1,
      0.9,
      this.overlayColorMap,
    );

    this.canvas = canvas;
    this.renderOverlay();
  }

  private overlayColorMap: ColorMap = {
    "-0.9": "#3d3016",
    "-0.6": "#794e00",
    "-0.2": "#6e481c",
    "0": "#5a3301",
    "0.3": "#643500",
    "0.7": "#754c00",
  };

  renderOverlay(overlayIntensity = 0) {
    const size = this.width();

    const ctx = this.canvas.getContext("2d")!;
    const img: ImageData = ctx.createImageData(size, size);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // handle scaling of noise to fit the plot size
        const noiseY = Math.floor(y / (size / (size / 8)));
        const noiseX = Math.floor(x / (size / (size / 8)));

        const color = this.noiseData[noiseY][noiseX];
        const [r, g, b, a] = RenderUtils.hexToRgba(color);
        const index = (y * size + x) * 4;
        img.data[index] = r;
        img.data[index + 1] = g;
        img.data[index + 2] = b;
        img.data[index + 3] = overlayIntensity * 255;
      }
    }

    ctx.putImageData(img, 0, 0);
    this.image(this.canvas);
  }

  // override setColor(color: { r: number; g: number; b: number }) {
  //   this.color = color;
  //   if (this.sourceImage?.complete) {
  //     const processedImage = RenderUtils.preprocessImage(
  //       this.sourceImage,
  //       color,
  //     );
  //     this.image(processedImage);
  //   }
  // }
}

class OldPlotRender extends Konva.Group {
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
      draggable: true,
    });

    const plotBase = new Konva.Rect({
      id: this.id() + "-base",
      stroke: "#b86a37ab",
      strokeWidth: 4,
      // Coords within the plot group, the group itself is positioned at the plot's coordinates
      x: 0,
      y: 0,
      width: width,
      height: height,
      fill: "#ff8000",
    });

    const plotOverlay = new Konva.Rect({
      id: this.id() + "-overlay",
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

  override setAttrs(config: Konva.ContainerConfig) {
    super.setAttrs(config);
    const overlay = this.findOne(`#${this.id()}-base`);
    if (!overlay) return this;

    const overlayConfig: Konva.ContainerConfig = {};
    if ("fill" in config) {
      overlayConfig["fill"] = config["fill"];
    }
    if ("stroke" in config) {
      overlayConfig["stroke"] = config["stroke"];
    }
    if ("strokeWidth" in config) {
      overlayConfig["strokeWidth"] = config["strokeWidth"];
    }

    if (Object.keys(overlayConfig).length > 0) {
      overlay.setAttrs(overlayConfig);
    }

    return this;
  }

  override setAttr(attr: string | number, value: any) {
    super.setAttr(attr, value);
    const overlay = this.findOne(`#${this.id()}-base`);
    if (!overlay) return this;

    this.setAttrs({ [attr]: value });
    return this;
  }
}
