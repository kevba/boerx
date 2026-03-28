import { signal } from "@angular/core";
import Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import { EntityType } from "../../models/entity";
import { IncomeService } from "../../services/income.service";
import { Crop } from "../../services/items/crop.service";
import { CropItem, Item } from "../../services/wares.service";
import { Entity } from "./Entity";
import { Sprite } from "./Sprite";
import { Forecast } from "./abilities/forecast";

export class WeatherStationEntity extends Entity<
  WeatherStationImage,
  WeatherStationUpgrade
> {
  type = EntityType.WeatherStation;

  upgrade = signal<WeatherStationUpgrade>(WeatherStationUpgrade.Basic);
  forecast = new Forecast();

  private incomeService = new IncomeService();

  constructor(
    initialCoords: { x: number; y: number },
    layer: Konva.Layer,
    upgrade: WeatherStationUpgrade = WeatherStationUpgrade.Basic,
  ) {
    const id = uuidv4();

    const node = new WeatherStationImage({
      ...initialCoords,
      id,
    });
    layer.add(node);

    super({
      id,
      node,
    });
    this.node.entity = this;
    this.upgrade.set(upgrade);
  }

  sellItems(items: Item[]) {
    const crops = Object.values(Crop);
    items.forEach((i) => {
      if (crops.includes(i.type as Crop)) {
        this.incomeService.sellCrops([i as CropItem]);
      }
    });
  }
}

export enum WeatherStationUpgrade {
  Basic = "Basic",
}

export class WeatherStationImage extends Sprite<WeatherStationEntity> {
  protected override color = { r: 200, g: 200, b: 200 };
  override frameSpeed = 100;

  constructor(args: { x: number; y: number; id: string }) {
    super({
      id: `weather_station_${args.id}`,
      name: EntityType.WeatherStation,
      x: args.x,
      y: args.y,
      imageSrc: "/imgs/weather-station.png",
      EntityType: EntityType.WeatherStation,
      totalFrames: 1,
      frameWidth: 10,
      frameHeight: 16,
    });
  }
}
