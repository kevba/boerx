import { Component, computed, inject } from "@angular/core";
import { Crop, CropService } from "../services/crop.service";
import { PlotsService } from "../services/plots.service";
import { StashService } from "../services/stash.service";

@Component({
  selector: "app-plot-control",
  template: `
    <div class="flex flex-col gap-2">
      <h2 class="text-lg font-bold ">Plant Crop</h2>
      <div class="flex gap-2">
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
export class PlotControlComponent {
  plotService = inject(PlotsService);
  cropService = inject(CropService);
  stashService = inject(StashService);

  crops = Object.values(Crop);
  cropOnPlot = computed(() => {
    return this.plotService.selectedPlot()?.crop;
  });

  options = computed(() => {
    const plantConst = this.cropService.plantCost();

    return this.crops.map((crop) => ({
      crop: crop,
      plantConst: plantConst[crop],
    }));
  });

  plantCrop(crop: Crop) {
    const plotId = this.plotService.selectedPlotId();
    if (plotId) {
      this.plotService.plantOnPlot(plotId, crop);
    }
  }
}
