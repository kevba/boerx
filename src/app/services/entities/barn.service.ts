import { computed, Injectable } from "@angular/core";
import { BarnEntity, BarnUpgrade } from "../../canvas/entities/BarnEntity";
import { EntityType } from "../../models/entity";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: "root",
})
export class BarnService extends BaseService<BarnUpgrade, BarnEntity> {
  override entityType = EntityType.Barn;
  protected baseCost = 4000;

  override cost = computed(() => {
    const entityCountMod = Math.floor(this.entities().length ** 2);
    return this.baseCost + Math.floor(entityCountMod * this.baseCost * 0.2);
  });

  upgrades = {
    [BarnUpgrade.Shed]: {
      next: BarnUpgrade.Storage,
      upgradeCost: this.baseCost * 2,
    },
    [BarnUpgrade.Storage]: {
      next: BarnUpgrade.Warehouse,
      upgradeCost: this.baseCost * 3,
    },
    [BarnUpgrade.Warehouse]: {
      next: null,
      upgradeCost: this.baseCost * 4,
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
