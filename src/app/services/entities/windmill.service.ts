import { Injectable } from "@angular/core";
import {
  WindmillEntity,
  WindmillUpgrade,
} from "../../canvas/entities/WindmillEntity";
import { EntityType } from "../../models/entity";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: "root",
})
export class WindmillService extends BaseService<
  WindmillUpgrade,
  WindmillEntity
> {
  override baseCost = 10000;
  override entityType = EntityType.Windmill;

  upgrades = {};

  constructor() {
    super();
    this.init();
  }

  createNew(coords: { x: number; y: number }): WindmillEntity {
    return new WindmillEntity(coords, this.entityLayerService.bottomLayer);
  }
}
