import { inject, Injectable } from "@angular/core";
import { CropService } from "./items/crop.service";
import { StashService } from "./stash.service";
import { CropItem } from "./wares.service";

@Injectable({
  providedIn: "root",
})
export class IncomeService {
  private stashService = inject(StashService);
  private cropService = inject(CropService);

  sellCrop(item: CropItem) {
    const sellPrice = this.cropService.earnings()[item.type];
    const totalEarnings = sellPrice * item.amount;
    this.stashService.addStash(totalEarnings);
  }

  sellCrops(items: CropItem[]) {
    items.forEach((item) => {
      this.sellCrop(item);
    });
  }

  // constructor() {
  //   effect(() => {
  //     const _ = this.tickService.tick();
  //     this.updateOnTick();
  //   });
  //   effect(() => {
  //     const _ = this.tickService.calculate();
  //     this.updateEarnings();
  //   });
  // }

  // private updateOnTick() {
  //   const _ = this.tickService.tick();
  //   const plots = this.plotService.entities();

  //   // harvest count update must happen first, and also in a separate effect to prevent haniging reactive updates
  //   plots.forEach((plot) => {
  //     this.plotService.harvest(plot);
  //   });
  // }

  // private updateEarnings() {
  //   const plots = this.plotService.entities();
  //   const tractors = this.tractorService.entities();
  //   const barns = this.barnService.entities();

  //   let income = 0;

  //   tractors.forEach((tractor) => {
  //     if (!tractor.atHomePlot()) return;

  //     const plot = plots.find((p) => p.id === tractor.homePlotId!);

  //     if (!plot) {
  //       tractor.homePlotId = null;
  //       return;
  //     }

  //     if (!plot.canHarvest()) return;

  //     income += this.plotService.harvestEarnings(plot);
  //     plot.harvest();
  //     tractor.setTargetToBarn();
  //   });

  // barns.forEach((barn) => {
  //   income +=
  //     this.barnService.upgrades[barn.upgrade()].earningsIncreasePerPlot *
  //     plots.length;
  // });

  // this.stashService.addStash(income);
  // }
}
