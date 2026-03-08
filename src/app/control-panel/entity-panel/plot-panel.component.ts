import { Component, computed, inject } from "@angular/core";
import { EntityType } from "../../models/entity";
import { BaseService } from "../../services/entities/base.service";
import { PlotService } from "../../services/entities/plots.service";
import { Crop, CropService } from "../../services/items/crop.service";
import { SelectionService } from "../../services/selection.service";
import { BuyTileComponent } from "../buy-tile.component";
import { EntityUpgradesComponent } from "./entity-upgrades.component";

@Component({
  selector: "app-plot-panel",
  template: `
    <div class="flex flex-col gap-0 md:pb-4">
      <div class="w-full pl-2 md:pl-0">
        <h2 class="text-md md:text-lg font-bold ">Plant</h2>
      </div>
      <div>
        <div class="buy-tile-group">
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
    <div class="w-full pl-2 md:pl-0">
      <h2 class="text-md md:text-lg font-bold ">Upgrades</h2>
    </div>
    <app-entity-upgrades />
  `,
  providers: [{ provide: BaseService, useExisting: PlotService }],
  imports: [BuyTileComponent, EntityUpgradesComponent],
})
export class PlotPanelComponent {
  plotService = inject(PlotService);
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
      const plotsWithoutCrop = plots.filter((p) => p?.crop() !== crop).length;
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
      if (plot?.crop() === crop) {
        return;
      } else {
        this.plotService.plantOnPlot(plot.id, crop);
      }
    }
  }
}
