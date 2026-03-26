import { Injectable } from "@angular/core";
import {
  WeatherStationEntity,
  WeatherStationUpgrade,
} from "../../canvas/entities/WeatherStationEntity";
import { EntityType } from "../../models/entity";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: "root",
})
export class WeatherStationService extends BaseService<
  WeatherStationUpgrade,
  WeatherStationEntity
> {
  override baseCost = 10000;
  override entityType = EntityType.WeatherStation;

  upgrades = {};

  constructor() {
    super();
    this.init();
  }

  createNew(coords: { x: number; y: number }): WeatherStationEntity {
    return new WeatherStationEntity(
      coords,
      this.entityLayerService.bottomLayer,
    );
  }
}
