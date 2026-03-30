import { effect, inject, Injectable, Injector } from "@angular/core";
import { ImageUtils } from "../canvas/utils/imageUtils";
import { EntityType } from "../models/entity";
import { EntityService } from "../models/serviceMap";
import { BarnService } from "./entities/barn.service";
import { EntitiesService } from "./entities/entities.service";
import { FarmerService } from "./entities/farmer.service";
import { GreenhouseService } from "./entities/greenhouse.service";
import { MarketService } from "./entities/market.service";
import { PlotService } from "./entities/plots.service";
import { TractorService } from "./entities/tractor.service";
import { VanService } from "./entities/van.service";
import { WeatherControlService } from "./entities/weather-control.service";
import { WindmillService } from "./entities/windmill.service";
import { EntityLayerService } from "./entity-layer.service";
import { StashService } from "./stash.service";
import { TickService } from "./tick.service";

@Injectable({
  providedIn: "root",
})
export class InitService {
  private injector = inject(Injector);

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
  private greenhouseService = inject(GreenhouseService);
  private windmillService = inject(WindmillService);

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
      x: center.x + 160,
      y: center.y + 50,
    });

    this.barnService.add({
      x: center.x - 240,
      y: center.y + 0,
    });

    this.farmerService.add({
      x: center.x - 120,
      y: center.y + 100,
    });

    this.vanService.add({
      x: center.x - 80,
      y: center.y + 100,
    });

    for (let i = 0; i < 2; i++) {
      this.plotService.add({
        x:
          center.x -
          (ImageUtils.entitySize[EntityType.Plot][0] * i + 12 * i + 1) -
          200,
        y: center.y - (ImageUtils.entitySize[EntityType.Plot][1] + 48),
      });
    }

    this.stashService.setStash(500);
  }

  _tickEffect = effect(() => {
    const t = this.tickService.tick();
    if (!this.setupComplete) return;
    if (t % 10 === 0) {
      this.save();
    }
  });

  private save() {
    const savedEntities = this.entitiesService.entities();
    const state = {
      entities: savedEntities.map((e) => e.marshalSave()),
      stash: this.stashService.stash(),
      tick: this.tickService.tick(),
    };

    localStorage.setItem("gameState", JSON.stringify(state));
  }

  private load(): boolean {
    const stateStr = localStorage.getItem("gameState");
    if (!stateStr) return false;

    const state = JSON.parse(stateStr);
    if (!state.entities || !state.stash) return false;

    state.entities.forEach((e: any) => {
      const entityType = e.type as EntityType;
      const serviceType = EntityService[entityType];
      if (!serviceType) return;

      const service = this.injector.get(EntityService[entityType]);

      service.add({ x: e.x, y: e.y });

      const entity = service.entities()[service.entities().length - 1];
      entity.restoreFromSave(e);
    });

    this.stashService.setStash(state.stash);
    this.tickService["_tick"].set(state.tick);

    return true;
  }
}
