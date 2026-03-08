import { inject, Injectable } from "@angular/core";
import {
  FarmerEntity,
  FarmerUpgrade,
} from "../../canvas/entities/FarmerEntity";
import { EntityType } from "../../models/entity";
import { BuyService } from "../buy.service";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: "root",
})
export class FarmerService extends BaseService<FarmerUpgrade, FarmerEntity> {
  override baseCost = 5000;
  override entityType = EntityType.Farmer;

  private buyService = inject(BuyService);

  upgrades = {};

  constructor() {
    super();
    this.init();
  }

  createNew(): FarmerEntity {
    const coords = this.buyService.getBuyLocation();
    return new FarmerEntity(coords, this.entityLayerService.topLayer);
  }
}
