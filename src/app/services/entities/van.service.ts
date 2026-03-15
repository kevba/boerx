import { Injectable } from "@angular/core";
import { VanEntity, VanUpgrade } from "../../canvas/entities/VanEntity";
import { EntityType } from "../../models/entity";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: "root",
})
export class VanService extends BaseService<VanUpgrade, VanEntity> {
  override baseCost = 5000;
  override entityType = EntityType.Van;

  upgrades = {};

  constructor() {
    super();
    this.init();
  }

  createNew(coords: { x: number; y: number }): VanEntity {
    return new VanEntity(coords, this.entityLayerService.topLayer);
  }
}
