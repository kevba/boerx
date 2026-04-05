import { computed, effect, inject, signal } from "@angular/core";
import Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import { EntityType } from "../../models/entity";
import { Crop } from "../../services/items/crop.service";
import { SeasonTypes, TimeService } from "../../services/time.service";
import { WeatherService, WeatherTypes } from "../../services/weather.service";
import { ImageUtils } from "../utils/imageUtils";
import { ColorMap, NoisyImageService } from "../utils/noisy-image.service";
import { Cultivate, ICultivate } from "./abilities/cultivate";
import { IStorage, Storage } from "./abilities/store";
import { Entity, EntityRender } from "./Entity";

export class PlotEntity
  extends Entity<PlotRender, PlotUpgrade>
  implements IStorage, ICultivate
{
  private timeService = inject(TimeService);

  override type = EntityType.Plot;

  upgrade = signal<PlotUpgrade>(PlotUpgrade.Basic);
  storage = new Storage(1);
  cultivate: PlotCultivate = new PlotCultivate(this);

  constructor(
    initialCoords: { x: number; y: number },
    layer: Konva.Layer,
    upgrade: PlotUpgrade = PlotUpgrade.Basic,
  ) {
    const id = uuidv4();
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

    this.storage = new Storage(5);

    this.upgrade.set(upgrade);

    this.init();
  }

  private _cropChangeEffect = effect(() => {
    const crop = this.cultivate.crop();
    this.node.setCrop(crop);
  });
}

class PlotCultivate extends Cultivate {
  private weatherService = inject(WeatherService);
  private timeService = inject(TimeService);

  override lastPlantedCrop = signal(Crop.Wheat);

  override canPlant = computed(() => {
    return (
      this._crop() === Crop.Grass &&
      !this.canHarvest() &&
      this.timeService.season() !== SeasonTypes.Winter
    );
  });

  override growth(): number {
    const weather = this.weatherService.weather();
    let growthModifier = 1;
    if (weather === WeatherTypes.Rainy) {
      growthModifier += 0.5;
    }

    growthModifier *= this.timeService.lightLevel();

    return growthModifier;
  }

  private _seasonChangeEffect = effect(() => {
    const season = this.timeService.season();
    if (season === SeasonTypes.Winter) {
      this._crop.set(Crop.Grass);
    }
  });
}

export enum PlotUpgrade {
  Basic = "basic",
  Moisture = "moisture",
  Soil = "soil",
}

export class PlotRender extends EntityRender<PlotEntity> {
  private image: PlotRenderImage;

  private cropColor: Record<Crop, string> = {
    [Crop.Wheat]: "#ebc23e",
    [Crop.Corn]: "#d6c800",
    [Crop.Potato]: "#a76829",
    [Crop.Strawberry]: "#ff4d6d",
    [Crop.Tomato]: "#ff6347",
    [Crop.Grass]: "#2d771a",
  };

  constructor(args: { x: number; y: number; id: string }) {
    super({
      ...args,
      type: EntityType.Plot,
    });
    this.image = new PlotRenderImage({
      x: 0,
      y: 0,
      id: `${this.id}-image`,
    });
    this.add(this.image);
  }

  renderOverlay(overlayIntensity: number) {
    this.image.renderOverlay(overlayIntensity);
  }

  setCrop(crop: Crop) {
    this.image.setAttr("fill", this.cropColor[crop]);
  }

  private _growthEffect = effect(() => {
    const growthFraction = this.entity.cultivate.cropGrowthStageFraction();

    const overlayIntensity = 0.5 - growthFraction * 0.3;
    this.renderOverlay(overlayIntensity);
  });
}

export class PlotRenderImage extends Konva.Image {
  private canvas: HTMLCanvasElement;
  private noiseData: string[][];

  constructor(args: { x: number; y: number; id: string }) {
    const size = ImageUtils.entitySize[EntityType.Plot][0];
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

    this.noiseData = NoisyImageService.PerlinNoisyPattern(
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
        const [r, g, b, a] = ImageUtils.hexToRgba(color);
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
