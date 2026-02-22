import { computed, inject, Injectable, signal } from "@angular/core";
import { NutrientsService } from "../nutrients.service";
import { StashService } from "../stash.service";
import { Crop, CropService } from "./crop.service";
import { Upgrader } from "./upgradeUtils";

@Injectable({
  providedIn: "root",
})
export class PlotsService {
  private stashService = inject(StashService);
  private cropService = inject(CropService);
  private nutrientsService = inject(NutrientsService);

  private _plots = signal<Plot[]>([]);
  plots = this._plots.asReadonly();

  private baseCost = 4000;
  plotCost = computed(() => this.baseCost + (this.plots().length * 10) ** 2);

  hasMoistureUpgrade = computed(() =>
    this.plots().some((plot) => ![PlotUpgrade.Basic].includes(plot.upgrade)),
  );

  hasSoilUpgrade = computed(() =>
    this.plots().some(
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
  private upgrader = new Upgrader<PlotUpgrade>(this.upgrades);

  addPlot() {
    const cost = this.plotCost();
    const stash = this.stashService.stash();
    if (stash < cost) {
      return;
    }
    this.stashService.addStash(-cost);
    const plot: Plot = this.newPlot();

    this._plots.update((plots) => [...plots, plot]);
  }

  upgradePlot(plotId: string, toUpgrade: PlotUpgrade) {
    const plot = this._plots().find((plot) => plot.id === plotId);
    if (!plot) return;

    const upgradeCost = this.upgradeCost(plotId, toUpgrade);

    const stash = this.stashService.stash();
    if (stash < upgradeCost) {
      return;
    }
    this.stashService.addStash(-upgradeCost);

    this._plots.update((plots) => {
      const index = plots.findIndex((plot) => plot.id === plotId);
      if (index === -1) return plots;

      //   Create a new object, otherwise the signal won't detect the change since the reference is the same
      plots[index] = {
        ...plots[index],
        upgrade: toUpgrade,
      };

      return [...plots];
    });
  }

  upgradeCost(plotId: string, toUpgrade: PlotUpgrade): number {
    const plot = this._plots().find((plot) => plot.id === plotId);
    if (!plot) return 0;

    return this.upgrader.fromToCost(plot.upgrade, toUpgrade);
  }

  plantOnPlot(plotId: string, crop: Crop) {
    const cost = this.cropService.plantCost()[crop];

    const stash = this.stashService.stash();
    if (stash < cost) {
      return;
    }
    this.stashService.addStash(-cost);

    this._plots.update((plots) => {
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

  constructor() {}

  private newPlot(): Plot {
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
