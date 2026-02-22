import { effect, inject, Injectable } from "@angular/core";
import { BarnService } from "./entities/barn.service";
import { CropService } from "./entities/crop.service";
import { PlotsService } from "./entities/plots.service";
import { TractorService } from "./entities/tractor.service";
import { StashService } from "./stash.service";
import { TickService } from "./tick.service";

@Injectable({
  providedIn: "root",
})
export class IncomeService {
  private stashService = inject(StashService);
  private cropService = inject(CropService);
  private tickService = inject(TickService);
  private plotService = inject(PlotsService);
  private tractorService = inject(TractorService);
  private barnService = inject(BarnService);

  constructor() {
    effect(() => {
      const _ = this.tickService.tick();
      this.updateOnTick();
    });
    effect(() => {
      const _ = this.tickService.calculate();
      this.updateEarnings();
    });
  }

  private updateOnTick() {
    const _ = this.tickService.tick();
    const plots = this.plotService.plots();

    // harvest count update must happen first, and also in a separate effect to prevent haniging reactive updates
    plots.forEach((plot) => {
      this.cropService.updateHarvestCounter(plot.crop);
    });
  }

  private updateEarnings() {
    const plots = this.plotService.plots();
    const tractors = this.tractorService.tractors();
    const barns = this.barnService.barns();

    let income = 10;
    plots.forEach((plot) => {
      income += this.cropService.harvestEarnings(plot.crop);
    });

    tractors.forEach((tractor) => {
      income +=
        this.tractorService.upgrades[tractor.upgrade].earningsIncreasePerPlot *
        plots.length;
    });

    barns.forEach((barn) => {
      income +=
        this.barnService.upgrades[barn.upgrade].earningsIncreasePerPlot *
        plots.length;
    });

    this.stashService.addStash(income);
  }
}
