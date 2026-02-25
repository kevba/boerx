import { inject, Injectable } from "@angular/core";
import {
  TractorEntity,
  TractorUpgrade,
} from "../../canvas/entities/TractorEntity";
import { EntityType } from "../../models/entity";
import { BuyService } from "../buy.service";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: "root",
})
export class TractorService extends BaseService<TractorUpgrade, TractorEntity> {
  override baseCost = 100000;
  override entityType = EntityType.Tractor;

  private buyService = inject(BuyService);

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

  createNew(): TractorEntity {
    const coords = this.buyService.getBuyLocation();
    return new TractorEntity(coords, this.layer);
  }
}
