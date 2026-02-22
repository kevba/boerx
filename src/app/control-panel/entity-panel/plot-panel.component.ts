import { Component, computed, inject } from "@angular/core";
import { Crop, CropService } from "../../services/entities/crop.service";
import {
  PlotsService,
  PlotUpgrade,
} from "../../services/entities/plots.service";
import { SelectionService } from "../../services/selection.service";
import { StashService } from "../../services/stash.service";
import { BuyTileComponent } from "../buy-tile.component";

@Component({
  selector: "app-plot-panel",
  template: `
    <div
      class="flex flex-col gap-2 p-4 w-full h-full items-center overflow-scroll ">
      <div class="w-full"><h2 class="text-lg font-bold ">Plant Crop</h2></div>
      <div>
        <div class="flex flex-row flex-wrap gap-4">
          @for (option of cropOptions(); track option.crop) {
            <app-buy-tile
              image=""
              [text]="option.crop"
              [cost]="option.plantConst"
              [disabled]="option.disabled"
              (buyClick)="plantCrop(option.crop)"></app-buy-tile>
          }
        </div>
      </div>
      <div class="w-full"><h2 class="text-lg font-bold ">Upgrades</h2></div>
      <div>
        <div class="flex flex-row flex-wrap gap-4">
          @for (option of upgradeOptions(); track option.upgrade) {
            <app-buy-tile
              image=""
              [text]="option.upgrade"
              [cost]="option.upgradeCost"
              [disabled]="option.disabled"
              (buyClick)="upgradePlot(option.upgrade)"></app-buy-tile>
          }
        </div>
      </div>
    </div>
  `,
  imports: [BuyTileComponent],
})
export class PlotPanelComponent {
  plotService = inject(PlotsService);
  selectionService = inject(SelectionService);
  cropService = inject(CropService);
  stashService = inject(StashService);

  crops = Object.values(Crop);

  plots = computed(() => {
    const selectedPlotIds = this.selectionService.selectedPlots();
    return this.plotService
      .plots()
      .filter((p) => selectedPlotIds.includes(p.id));
  });

  cropOptions = computed(() => {
    const plantConst = this.cropService.plantCost();
    const plots = this.plots();

    return this.crops.map((crop) => {
      const plotsWithoutCrop = plots.filter((p) => p?.crop !== crop).length;
      return {
        crop: crop,
        disabled: plotsWithoutCrop === 0,
        plantConst: plantConst[crop] * (plotsWithoutCrop || 1),
      };
    });
  });

  upgradeOptions = computed(() => {
    const plots = this.plots();
    const upgrades = Object.keys(this.plotService.upgrades) as PlotUpgrade[];

    return upgrades.map((plotUpgrade) => {
      const upgradable = plots.filter((p) => p?.upgrade !== plotUpgrade).length;
      let upgradeCost = 0;
      for (const tractor of plots) {
        const cost = this.plotService.upgradeCost(tractor.id, plotUpgrade);
        upgradeCost += cost;
      }

      return {
        upgrade: plotUpgrade,
        disabled: upgradable === 0,
        upgradeCost: upgradeCost,
      };
    });
  });

  plantCrop(crop: Crop) {
    const plots = this.plots();

    for (const plot of plots) {
      if (plot?.crop === crop) {
        return;
      } else {
        this.plotService.plantOnPlot(plot.id, crop);
      }
    }
  }

  upgradePlot(upgrade: PlotUpgrade) {
    const plots = this.plots();

    for (const plot of plots) {
      this.plotService.upgradePlot(plot.id, upgrade);
    }
  }
}
