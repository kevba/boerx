import { Injectable } from "@angular/core";
import {
  FarmerEntity,
  FarmerRoles,
  FarmerUpgrade,
} from "../../canvas/entities/FarmerEntity";
import { EntityType } from "../../models/entity";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: "root",
})
export class FarmerService extends BaseService<FarmerUpgrade, FarmerEntity> {
  override baseCost = 500;
  override entityType = EntityType.Farmer;

  upgrades = {};

  constructor() {
    super();
    this.init();
  }

  createNew(coords: { x: number; y: number }): FarmerEntity {
    return new FarmerEntity(coords, this.entityLayerService.topLayer);
  }

  updateRole(id: string, role: FarmerRoles, checked: boolean) {
    const entity = this.entities().find((e) => e.id === id);
    if (!entity) return;

    const roles = entity.roles();
    if (checked) {
      if (!roles.includes(role)) {
        entity.roles.set([...roles, role as FarmerRoles]);
      }
    } else {
      entity.roles.set(roles.filter((r) => r !== role));
    }
  }
}
