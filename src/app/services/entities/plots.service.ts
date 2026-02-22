import { computed, inject, Injectable, signal } from "@angular/core";
import { StashService } from "../stash.service";
import { Crop, CropService } from "./crop.service";

@Injectable({
  providedIn: "root",
})
export class PlotsService {
  private stashService = inject(StashService);
  private cropService = inject(CropService);

  private _plots = signal<Plot[]>([]);

  plots = computed(() => this._plots());
  plotCost = computed(() => 4000 + (this.plots().length * 10) ** 2);

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

  constructor() {}

  private newPlot(): Plot {
    return {
      id: crypto.randomUUID(),
      crop: Crop.Grass,
    };
  }
}

export type Plot = {
  id: string;
  crop: Crop;
};
