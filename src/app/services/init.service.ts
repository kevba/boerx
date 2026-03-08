import { inject, Injectable } from "@angular/core";
import { MarketService } from "./entities/market.service";
import { EntityLayerService } from "./entity-layer.service";

@Injectable({
  providedIn: "root",
})
export class InitService {
  private marketService = inject(MarketService);
  private layerService = inject(EntityLayerService);

  init() {
    // Delay to ensure the injection context hack is setup
    setTimeout(() => {
      this.setupDefaultMarket();
    }, 10);
  }

  private setupDefaultMarket() {
    const center = {
      x:
        Math.abs(this.layerService.bottomLayer.getParent()?.attrs.x) +
          this.layerService.bottomLayer.getParent()?.attrs.width / 2 || 0,
      y:
        Math.abs(this.layerService.bottomLayer.getParent()?.attrs.y) +
          this.layerService.bottomLayer.getParent()?.attrs.height / 2 || 0,
    };

    this.marketService.add(center);
  }
}
