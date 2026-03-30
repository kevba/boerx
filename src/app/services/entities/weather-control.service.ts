import { Injectable } from "@angular/core";
import {
    WeatherControlEntity,
    WeatherControlUpgrade,
} from "../../canvas/entities/WeatherControlEntity";
import { EntityType } from "../../models/entity";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: "root",
})
export class WeatherControlService extends BaseService<
  WeatherControlUpgrade,
  WeatherControlEntity
> {
  override entityType = EntityType.Altar;
  protected baseCost = 999999;

  upgrades = {};

  constructor() {
    super();
    this.init();
  }

  createNew(coords: { x: number; y: number }): WeatherControlEntity {
    return new WeatherControlEntity(
      coords,
      this.entityLayerService.bottomLayer,
    );
  }
}
