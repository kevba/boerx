import { computed, inject, Injectable } from "@angular/core";
import { EntityType } from "../../models/entity";
import { NutrientsService } from "../nutrients.service";
import { BaseService } from "./base.service";
import { Crop, CropService } from "./crop.service";

@Injectable({
  providedIn: "root",
})
export class PlotsService extends BaseService<PlotUpgrade, Plot> {
  override entityType = EntityType.Plot;
  private cropService = inject(CropService);
  private nutrientsService = inject(NutrientsService);

  protected baseCost = 4000;

  hasMoistureUpgrade = computed(() =>
    this.entities().some((plot) => ![PlotUpgrade.Basic].includes(plot.upgrade)),
  );

  hasSoilUpgrade = computed(() =>
    this.entities().some(
      (plot) =>
        ![PlotUpgrade.Basic, PlotUpgrade.Moisture].includes(plot.upgrade),
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

      //   Create a new object, otherwise the signal won't detect the change since the reference is the same
      plots[plotIndex] = {
        ...plots[plotIndex],
        crop: crop,
      };

      return [...plots];
    });
  }

  harvest(plot: Plot) {
    const depletion = this.nutrientsService.cropBaseDepletion()[plot.crop];

    // TODO: support upgrades that reduce depletion
    this.nutrientsService.addWater(-depletion.water);
    this.nutrientsService.addFertilizer(-depletion.nutrients);

    this.cropService.updateHarvestCounter(plot.crop);
  }

  harvestEarnings(plot: Plot): number {
    const earnings = this.cropService.earnings()[plot.crop];
    const mult = this.nutrientsService.cropValueMult()[plot.crop];

    return earnings * mult.water * mult.nutrients;
  }

  createNew(): Plot {
    return {
      id: crypto.randomUUID(),
      crop: Crop.Grass,
      upgrade: PlotUpgrade.Basic,
    };
  }
}

export type Plot = {
  id: string;
  crop: Crop;
  upgrade: PlotUpgrade;
};

export enum PlotUpgrade {
  Basic = "basic",
  Moisture = "moisture",
  Soil = "soil",
}
