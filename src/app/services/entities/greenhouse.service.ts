import { Injectable } from "@angular/core";
import {
  GreenhouseEntity,
  GreenhouseUpgrade,
} from "../../canvas/entities/GreenHouseEntity";
import { EntityType } from "../../models/entity";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: "root",
})
export class GreenhouseService extends BaseService<
  GreenhouseUpgrade,
  GreenhouseEntity
> {
  override entityType = EntityType.Greenhouse;
  protected baseCost = 6000;

  upgrades = {};

  constructor() {
    super();
    this.init();
  }

  createNew(coords: { x: number; y: number }): GreenhouseEntity {
    return new GreenhouseEntity(coords, this.entityLayerService.bottomLayer);
  }
}
