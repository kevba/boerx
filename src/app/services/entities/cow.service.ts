import { inject, Injectable } from "@angular/core";
import { CowEntity, CowUpgrade } from "../../canvas/entities/CowEntity";
import { EntityType } from "../../models/entity";
import { BuyService } from "../buy.service";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: "root",
})
export class CowService extends BaseService<CowUpgrade, CowEntity> {
  override baseCost = 50000;
  override entityType = EntityType.Cow;

  buyService = inject(BuyService);

  upgrades = {};

  constructor() {
    super();

    this.init();
  }

  createNew(): CowEntity {
    const coords = this.buyService.getBuyLocation();
    const entity = new CowEntity(coords, this.layer);
    return entity;
  }
}
