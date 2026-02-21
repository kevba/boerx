import { Component, computed, inject } from "@angular/core";
import { Crop, CropService } from "../services/crop.service";
import { Plot, PlotsService } from "../services/plots.service";
import { SelectionService } from "../services/selection.service";
import { StashService } from "../services/stash.service";

@Component({
  selector: "app-plot-panel",
  template: `
    <div class="flex flex-col gap-2">
      <h2 class="text-lg font-bold ">Plant Crop</h2>
      <div class="flex flex-wrap gap-2">
        @for (option of options(); track option.crop) {
        <button
          (click)="plantCrop(option.crop)"
          [disabled]="cropOnPlot() === option.crop"
        >
          {{ option.crop }}
          (-{{ option.plantConst }}{{ stashService.stashUnit }})
        </button>
        }
      </div>
    </div>
  `,
})
export class PlotPanelComponent {
  plotService = inject(PlotsService);
  selectionService = inject(SelectionService);
  cropService = inject(CropService);
  stashService = inject(StashService);

  crops = Object.values(Crop);

  cropOnPlot = computed(() => {
    const selectedPlotIds = this.selectionService.selectedPlots();
    if (selectedPlotIds.length !== 1) return null;

    const plot = this.plotService
      .plots()
      .find((p) => p.id === selectedPlotIds[0]);
    return plot?.crop;
  });

  options = computed(() => {
    const plantConst = this.cropService.plantCost();

    return this.crops.map((crop) => ({
      crop: crop,
      plantConst: plantConst[crop],
    }));
  });

  plantCrop(crop: Crop) {
    const plotIds = this.selectionService.selectedPlots();
    const plotMap = this.plotService.plots().reduce((acc, plot) => {
      acc[plot.id] = plot;
      return acc;
    }, {} as Record<string, Plot>);

    for (const plotId of plotIds) {
      const plot = plotMap[plotId];

      if (plot?.crop === crop) {
        return;
      } else {
        this.plotService.plantOnPlot(plotId, crop);
      }
    }
  }
}
