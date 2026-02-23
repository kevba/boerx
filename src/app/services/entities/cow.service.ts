import { Injectable } from "@angular/core";
import { EntityType } from "../../models/entity";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: "root",
})
export class CowService extends BaseService<CowUpgrade, Cow> {
  override baseCost = 50000;
  override entityType = EntityType.Cow;

  upgrades = {};

  constructor() {
    super();
    this.init();
  }

  createNew(): Cow {
    return {
      id: crypto.randomUUID(),
      upgrade: CowUpgrade.Cow,
    };
  }
}

export type Cow = {
  id: string;
  upgrade: CowUpgrade;
};

export enum CowUpgrade {
  Cow = "Cow",
}
