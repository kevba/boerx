import { inject, Injectable } from "@angular/core";
import { RenderUtils } from "../canvas/utils/renderUtils";
import { EntityType } from "../models/entity";
import { MarketService } from "./entities/market.service";
import { PlotService } from "./entities/plots.service";
import { EntityLayerService } from "./entity-layer.service";

@Injectable({
  providedIn: "root",
})
export class InitService {
  private marketService = inject(MarketService);
  private plotService = inject(PlotService);
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

    this.marketService.add({
      x: center.x,
      y: center.y + 50,
    });

    for (let i = 0; i < 3; i++) {
      this.plotService.add({
        x: center.x - (RenderUtils.entitySize[EntityType.Plot][0] * i + 12 * i),
        y: center.y - (RenderUtils.entitySize[EntityType.Plot][1] + 48),
      });
    }
  }
}
