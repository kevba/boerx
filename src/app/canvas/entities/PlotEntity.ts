import { computed, effect, signal, untracked } from "@angular/core";
import Konva from "konva";
import { EntityType } from "../../models/entity";
import { Crop } from "../../services/items/crop.service";
import { ColorMap, NoisyImageService } from "../utils/noisy-image.service";
import { RenderUtils } from "../utils/renderUtils";
import { Direction } from "./behaviors/move";
import { IStorer, Storer } from "./behaviors/storer";
import { Entity } from "./Entity";

export class PlotEntity
  extends Entity<PlotRender, PlotUpgrade>
  implements IStorer
{
  override selectable = true;
  override type = EntityType.Plot;

  override initialDirection: Direction = Direction.right;

  upgrade = signal<PlotUpgrade>(PlotUpgrade.Basic);
  crop = signal<Crop>(Crop.Grass);
  storage: Storer;

  canHarvest = computed(() => {
    const crop = this.crop();
    const growthStage = this.cropGrowthStage();
    const maxGrowthStage = this.cropStageCount[crop];
    return growthStage >= maxGrowthStage;
  });

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
    node.entity = this;

    this.storage = new Storer(5);

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
    this.node.setCrop(crop);
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
    const harvestedCrop = this.crop();
    this.crop.set(Crop.Grass);
    this.cropGrowthStage.set(0);

    this.storage.clear();
    this.storage.store({ type: harvestedCrop, amount: 1 });
  }

  private _growthEffect = effect(() => {
    const crop = this.crop();
    const growthStage = this.cropGrowthStage();
    const maxGrowthStage = this.cropStageCount[crop];
    const growthFraction = maxGrowthStage ? growthStage / maxGrowthStage : 0;

    this.node.setHarvestVisible(this.canHarvest());

    const overlayIntensity = 0.5 - growthFraction * 0.3;
    this.node.renderOverlay(overlayIntensity);
  });
}

export enum PlotUpgrade {
  Basic = "basic",
  Moisture = "moisture",
  Soil = "soil",
}

export class PlotRender extends Konva.Group {
  private image: PlotRenderImage;
  private harvestButton: Konva.Text;
  entity!: PlotEntity;

  private cropColor: Record<Crop, string> = {
    [Crop.Wheat]: "#ebc23e",
    [Crop.Corn]: "#d6c800",
    [Crop.Potato]: "#a76829",
    [Crop.Grass]: "#2d771a",
  };

  constructor(args: { x: number; y: number; id: string }) {
    const size = RenderUtils.entitySize[EntityType.Plot][0];

    super({
      id: `${args.id}`,
      name: EntityType.Plot,
      x: args.x,
      y: args.y,
      width: size,
      height: size,
    });
    this.image = new PlotRenderImage({
      x: 0,
      y: 0,
      id: `${args.id}-image`,
    });
    this.harvestButton = this.setupHarvestButton();
    this.add(this.image);
    this.add(this.harvestButton);
  }

  renderOverlay(overlayIntensity: number) {
    this.image.renderOverlay(overlayIntensity);
  }

  setCrop(crop: Crop) {
    this.image.setAttr("fill", this.cropColor[crop]);
  }

  // Hacky, create a base entityRender group that implements selection functions
  override setAttr(...args: Parameters<Konva.Group["setAttr"]>) {
    super.setAttr(...args);
    if (args[0] === "draggable") {
      this.image.setAttr(
        "stroke",
        args[1] ? RenderUtils.selectedColor : undefined,
      );
    }
    return this;
  }

  setHarvestVisible(visible: boolean) {
    this.harvestButton.setAttr("visible", visible);
  }

  private setupHarvestButton() {
    const textColor = "oklch(76.9% 0.188 70.08)";
    const testHoverColor = "oklch(76.9% 0.188 50.08)";

    const clickable = new Konva.Text({
      text: "Harvest",
      fontSize: 20,
      fontFamily: "pixel",
      fill: textColor,
      visible: false,

      height: this.height(),
      width: this.width(),
      align: "center",
      verticalAlign: "middle",
    });
    clickable.on("click", (e) => {
      e.cancelBubble = true;
      // Ugly two way bindings
      this.entity.harvest();
    });
    clickable.on("mouseenter", (e) => {
      clickable.setAttr("fill", testHoverColor);
    });
    clickable.on("mouseleave", (e) => {
      clickable.setAttr("fill", textColor);
    });
    console.log(clickable);
    return clickable;
  }
}

export class PlotRenderImage extends Konva.Image {
  private canvas: HTMLCanvasElement;
  private noiseData: string[][];

  constructor(args: { x: number; y: number; id: string }) {
    const size = RenderUtils.entitySize[EntityType.Plot][0];
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    super({
      id: `${args.id}`,
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
}
