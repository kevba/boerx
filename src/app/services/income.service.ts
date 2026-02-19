import { effect, inject, Injectable } from "@angular/core";
import { CropService } from "./crop.service";
import { MachineService } from "./machine.service";
import { PlotsService } from "./plots.service";
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
  private machineService = inject(MachineService);

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
    const machines = this.machineService.machines();

    let income = 0;
    plots.forEach((plot) => {
      income += this.cropService.harvestEarnings(plot.crop);
    });

    machines.forEach(() => {
      income +=
        this.machineService.machineEarningsIncreasePerPlot() * plots.length;
    });

    this.stashService.addStash(income);
  }
}
