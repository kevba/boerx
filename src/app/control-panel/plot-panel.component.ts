import { Component, computed, inject } from "@angular/core";
import { Crop, CropService } from "../services/crop.service";
import { PlotsService } from "../services/plots.service";
import { SelectionService } from "../services/selection.service";
import { StashService } from "../services/stash.service";
import { BuyTileComponent } from "./buy-tile.component";

@Component({
  selector: "app-plot-panel",
  template: `
    <div class="flex flex-col gap-2 p-4 w-full h-full items-center">
      <div class="w-full"><h2 class="text-lg font-bold ">Plant Crop</h2></div>
      <div>
        <div class="flex flex-row flex-wrap gap-4 justify-center">
          @for (option of options(); track option.crop) {
            <app-buy-tile
              image=""
              [text]="option.crop"
              [cost]="option.plantConst"
              [disabled]="option.disabled"
              (buyClick)="plantCrop(option.crop)"></app-buy-tile>
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

  options = computed(() => {
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
}
