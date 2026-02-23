import { Component, computed, inject } from "@angular/core";
import { EntityType } from "../../models/entity";
import { BaseService } from "../../services/entities/base.service";
import { Crop, CropService } from "../../services/entities/crop.service";
import { PlotsService } from "../../services/entities/plots.service";
import { SelectionService } from "../../services/selection.service";
import { BuyTileComponent } from "../buy-tile.component";
import { EntityUpgradesComponent } from "./entity-upgrades.component";

@Component({
  selector: "app-plot-panel",
  template: `
    <div
      class="flex flex-col gap-2 w-full h-full items-center overflow-scroll ">
      <div class="p-4 ">
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
      </div>
      <app-entity-upgrades />
    </div>
  `,
  providers: [{ provide: BaseService, useExisting: PlotsService }],
  imports: [BuyTileComponent, EntityUpgradesComponent],
})
export class PlotPanelComponent {
  plotService = inject(PlotsService);
  selectionService = inject(SelectionService);
  cropService = inject(CropService);

  crops = Object.values(Crop);

  plots = computed(() => {
    const selectedPlotIds =
      this.selectionService.selectedPerType()[EntityType.Plot];
    return this.plotService
      .entities()
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
