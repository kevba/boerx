import { Injectable } from "@angular/core";
import { EntityType } from "../../models/entity";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: "root",
})
export class BarnService extends BaseService<BarnSize, Barn> {
  override entityType = EntityType.Barn;
  protected baseCost = 20000;

  upgrades = {
    [BarnSize.Shed]: {
      next: BarnSize.Storage,
      upgradeCost: this.baseCost * 2,
      earningsIncreasePerPlot: 1000,
    },
    [BarnSize.Storage]: {
      next: BarnSize.Warehouse,
      upgradeCost: this.baseCost * 3,
      earningsIncreasePerPlot: 2000,
    },
    [BarnSize.Warehouse]: {
      next: null,
      upgradeCost: this.baseCost * 4,
      earningsIncreasePerPlot: 4000,
    },
  };

  constructor() {
    super();
    this.init();
  }

  createNew(): Barn {
    return {
      id: crypto.randomUUID(),
      upgrade: BarnSize.Shed,
    };
  }
}

export type Barn = {
  id: string;
  upgrade: BarnSize;
};

export enum BarnSize {
  Shed = "Shed",
  Storage = "Storage",
  Warehouse = "Warehouse",
}
