import { effect, inject, Injectable } from "@angular/core";
import { RenderUtils } from "../canvas/utils/renderUtils";
import { EntityType } from "../models/entity";
import { BarnService } from "./entities/barn.service";
import { EntitiesService } from "./entities/entities.service";
import { FarmerService } from "./entities/farmer.service";
import { MarketService } from "./entities/market.service";
import { PlotService } from "./entities/plots.service";
import { TractorService } from "./entities/tractor.service";
import { VanService } from "./entities/van.service";
import { WeatherControlService } from "./entities/weather-control.service";
import { EntityLayerService } from "./entity-layer.service";
import { StashService } from "./stash.service";
import { TickService } from "./tick.service";

@Injectable({
  providedIn: "root",
})
export class InitService {
  private entitiesService = inject(EntitiesService);
  private marketService = inject(MarketService);
  private plotService = inject(PlotService);
  private barnService = inject(BarnService);
  private farmerService = inject(FarmerService);
  private vanService = inject(VanService);
  private tractorService = inject(TractorService);
  private layerService = inject(EntityLayerService);
  private tickService = inject(TickService);
  private stashService = inject(StashService);
  private weatherControlService = inject(WeatherControlService);

  private setupComplete = false;

  init() {
    // Delay to ensure the injection context hack is setup
    setTimeout(() => {
      const loaded = this.load();
      if (!loaded) {
        this.setupDefaults();
      }
      this.setupComplete = true;
    }, 10);
  }

  private setupDefaults() {
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

    this.barnService.add({
      x: center.x - 320,
      y: center.y + 50,
    });

    this.farmerService.add({
      x: center.x - 120,
      y: center.y + 100,
    });

    this.vanService.add({
      x: center.x - 80,
      y: center.y + 100,
    });

    for (let i = 0; i < 3; i++) {
      this.plotService.add({
        x: center.x - (RenderUtils.entitySize[EntityType.Plot][0] * i + 12 * i),
        y: center.y - (RenderUtils.entitySize[EntityType.Plot][1] + 48),
      });
    }
  }

  _tickEffect = effect(() => {
    const t = this.tickService.tick();
    if (!this.setupComplete) return;
    if (t % 1 === 0) {
      this.save();
    }
  });

  private save() {
    const savedEntities = this.entitiesService.entities().map((e) => ({
      id: e.id,
      type: e.type,
      x: e.node.position().x,
      y: e.node.position().y,
    }));
    const state = {
      entities: savedEntities,
      stash: this.stashService.stash(),
    };

    localStorage.setItem("gameState", JSON.stringify(state));
  }

  private load(): boolean {
    const stateStr = localStorage.getItem("gameState");
    if (!stateStr) return false;

    const state = JSON.parse(stateStr);
    if (!state.entities || !state.stash) return false;
    if (state.entities.length === 0) return false;

    state.entities.forEach(
      (e: { id: string; type: EntityType; x: number; y: number }) => {
        switch (e.type) {
          case EntityType.Market:
            this.marketService.add({ x: e.x, y: e.y });
            break;
          case EntityType.Plot:
            this.plotService.add({ x: e.x, y: e.y });
            break;
          case EntityType.Barn:
            this.barnService.add({ x: e.x, y: e.y });
            break;
          case EntityType.Farmer:
            this.farmerService.add({ x: e.x, y: e.y });
            break;
          case EntityType.Tractor:
            this.tractorService.add({ x: e.x, y: e.y });
            break;
          case EntityType.Van:
            this.vanService.add({ x: e.x, y: e.y });
            break;
          case EntityType.WeatherControl:
            this.weatherControlService.add({ x: e.x, y: e.y });
            break;
        }
      },
    );

    this.stashService.setStash(state.stash);
    return true;
  }
}
