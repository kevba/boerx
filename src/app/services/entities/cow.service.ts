import { Injectable } from "@angular/core";
import { CowEntity, CowUpgrade } from "../../canvas/entities/CowEntity";
import { EntityType } from "../../models/entity";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: "root",
})
export class CowService extends BaseService<CowUpgrade, CowEntity> {
  override baseCost = 50000;
  override entityType = EntityType.Cow;

  upgrades = {};

  constructor() {
    super();

    this.init();
  }

  createNew(coords: { x: number; y: number }): CowEntity {
    const entity = new CowEntity(coords, this.entityLayerService.topLayer);
    return entity;
  }
}
