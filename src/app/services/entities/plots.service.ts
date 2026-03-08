import { computed, inject, Injectable } from "@angular/core";
import { PlotEntity, PlotUpgrade } from "../../canvas/entities/PlotEntity";
import { EntityType } from "../../models/entity";
import { Crop, CropService } from "../items/crop.service";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: "root",
})
export class PlotService extends BaseService<PlotUpgrade, PlotEntity> {
  override entityType = EntityType.Plot;
  private cropService = inject(CropService);

  protected baseCost = 2000;

  hasMoistureUpgrade = computed(() =>
    this.entities().some(
      (plot) => ![PlotUpgrade.Basic].includes(plot.upgrade()),
    ),
  );

  hasSoilUpgrade = computed(() =>
    this.entities().some(
      (plot) =>
        ![PlotUpgrade.Basic, PlotUpgrade.Moisture].includes(plot.upgrade()),
    ),
  );

  upgrades = {
    [PlotUpgrade.Basic]: {
      next: PlotUpgrade.Moisture,
      upgradeCost: this.baseCost * 10,
      earningsIncreasePerPlot: 1000,
    },
    [PlotUpgrade.Moisture]: {
      next: PlotUpgrade.Soil,
      upgradeCost: this.baseCost * 20,
      earningsIncreasePerPlot: 1000,
    },
    [PlotUpgrade.Soil]: {
      next: null,
      upgradeCost: this.baseCost * 30,
      earningsIncreasePerPlot: 1000,
    },
  };

  constructor() {
    super();
    this.init();
  }

  plantOnPlot(plotId: string, crop: Crop) {
    const cost = this.cropService.plantCost()[crop];

    const stash = this.stashService.stash();
    if (stash < cost) {
      return;
    }
    this.stashService.addStash(-cost);

    this._entity.update((plots) => {
      const plotIndex = plots.findIndex((plot) => plot.id === plotId);
      if (plotIndex === -1) return plots;

      plots[plotIndex].crop.set(crop);

      return plots;
    });
  }

  createNew(coords: { x: number; y: number }): PlotEntity {
    return new PlotEntity(coords, this.entityLayerService.bottomLayer);
  }
}
