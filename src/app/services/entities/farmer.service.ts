import { Injectable } from "@angular/core";
import {
  FarmerEntity,
  FarmerUpgrade,
} from "../../canvas/entities/FarmerEntity";
import { EntityType } from "../../models/entity";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: "root",
})
export class FarmerService extends BaseService<FarmerUpgrade, FarmerEntity> {
  override baseCost = 2500;
  override entityType = EntityType.Farmer;

  upgrades = {};

  constructor() {
    super();
    this.init();
  }

  createNew(coords: { x: number; y: number }): FarmerEntity {
    return new FarmerEntity(coords, this.entityLayerService.topLayer);
  }
}
