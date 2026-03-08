import { Injectable } from "@angular/core";
import { BarnEntity, BarnUpgrade } from "../../canvas/entities/BarnEntity";
import { EntityType } from "../../models/entity";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: "root",
})
export class BarnService extends BaseService<BarnUpgrade, BarnEntity> {
  override entityType = EntityType.Barn;
  protected baseCost = 10000;

  upgrades = {
    [BarnUpgrade.Shed]: {
      next: BarnUpgrade.Storage,
      upgradeCost: this.baseCost * 2,
      earningsIncreasePerPlot: 1000,
    },
    [BarnUpgrade.Storage]: {
      next: BarnUpgrade.Warehouse,
      upgradeCost: this.baseCost * 3,
      earningsIncreasePerPlot: 2000,
    },
    [BarnUpgrade.Warehouse]: {
      next: null,
      upgradeCost: this.baseCost * 4,
      earningsIncreasePerPlot: 4000,
    },
  };

  constructor() {
    super();
    this.init();
  }

  createNew(coords: { x: number; y: number }): BarnEntity {
    return new BarnEntity(coords, this.entityLayerService.bottomLayer);
  }
}
