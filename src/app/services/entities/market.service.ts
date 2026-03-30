import { computed, Injectable } from "@angular/core";
import {
  MarketEntity,
  MarketUpgrade,
} from "../../canvas/entities/MarketEntity";
import { EntityType } from "../../models/entity";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: "root",
})
export class MarketService extends BaseService<MarketUpgrade, MarketEntity> {
  override baseCost = 1000000;
  override entityType = EntityType.Market;

  override canBeSold = computed(() => this.entities().length > 1);
  upgrades = {};

  constructor() {
    super();
    this.init();
  }

  createNew(coords: { x: number; y: number }): MarketEntity {
    return new MarketEntity(coords, this.entityLayerService.bottomLayer);
  }
}
