import { Injectable, signal } from "@angular/core";
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

  private autoSellPlot = signal(false);
  private autoSellBarn = signal(false);

  isPlotAutoSell = this.autoSellPlot.asReadonly();
  setPlotAutoSell(auto: boolean) {
    this.autoSellPlot.set(auto);
  }

  isBarnAutoSell = this.autoSellBarn.asReadonly();
  setBarnAutoSell(auto: boolean) {
    this.autoSellBarn.set(auto);
  }

  upgrades = {};

  constructor() {
    super();
    this.init();
  }

  createNew(coords: { x: number; y: number }): MarketEntity {
    return new MarketEntity(coords, this.entityLayerService.bottomLayer);
  }
}
