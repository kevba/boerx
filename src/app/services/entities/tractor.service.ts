import { Injectable } from "@angular/core";
import {
  TractorEntity,
  TractorUpgrade,
} from "../../canvas/entities/TractorEntity";
import { EntityType } from "../../models/entity";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: "root",
})
export class TractorService extends BaseService<TractorUpgrade, TractorEntity> {
  override baseCost = 60000;
  override entityType = EntityType.Tractor;

  upgrades = {
    [TractorUpgrade.DearJuan]: {
      next: TractorUpgrade.OldHillland,
      upgradeCost: this.baseCost * 2,
      earningsIncreasePerPlot: 1000,
    },
    [TractorUpgrade.OldHillland]: {
      next: TractorUpgrade.Kerel,
      upgradeCost: this.baseCost * 3,
      earningsIncreasePerPlot: 2000,
    },
    [TractorUpgrade.Kerel]: {
      next: TractorUpgrade.Klaas,
      upgradeCost: this.baseCost * 4,
      earningsIncreasePerPlot: 3000,
    },
    [TractorUpgrade.Klaas]: {
      next: null,
      upgradeCost: this.baseCost * 5,
      earningsIncreasePerPlot: 4000,
    },
  };

  constructor() {
    super();
    this.init();
  }

  createNew(coords: { x: number; y: number }): TractorEntity {
    return new TractorEntity(coords, this.entityLayerService.topLayer);
  }
}
