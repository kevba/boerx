import { Injectable } from "@angular/core";
import { EntityType } from "../../models/entity";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: "root",
})
export class TractorService extends BaseService<TractorBrand, Tractor> {
  override baseCost = 50000;
  override entityType = EntityType.Tractor;

  upgrades = {
    [TractorBrand.DearJuan]: {
      next: TractorBrand.OldHillland,
      upgradeCost: this.baseCost * 2,
      earningsIncreasePerPlot: 1000,
    },
    [TractorBrand.OldHillland]: {
      next: TractorBrand.Kerel,
      upgradeCost: this.baseCost * 3,
      earningsIncreasePerPlot: 2000,
    },
    [TractorBrand.Kerel]: {
      next: TractorBrand.Klaas,
      upgradeCost: this.baseCost * 4,
      earningsIncreasePerPlot: 3000,
    },
    [TractorBrand.Klaas]: {
      next: null,
      upgradeCost: this.baseCost * 5,
      earningsIncreasePerPlot: 4000,
    },
  };

  constructor() {
    super();
    this.init();
  }

  createNew(): Tractor {
    return {
      id: crypto.randomUUID(),
      upgrade: TractorBrand.DearJuan,
    };
  }
}

export type Tractor = {
  id: string;
  upgrade: TractorBrand;
};

export enum TractorBrand {
  DearJuan = "Dear Juan",
  OldHillland = "Old Hillland",
  Kerel = "Kerel",
  Klaas = "Klaas",
}
