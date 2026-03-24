import { Component, computed, inject } from "@angular/core";
import { EntityType } from "../../models/entity";
import { PlotService } from "../../services/entities/plots.service";
import { Crop, CropService } from "../../services/items/crop.service";
import { SelectionService } from "../../services/selection.service";
import { BuyTileComponent } from "../buy-tile.component";
import { PanelMenuNavComponent } from "../menu-nav.component";

@Component({
  selector: "app-plot-panel",
  template: `
    <app-panel-menu-nav [menuOptions]="menuOptions()">
      <ng-template #panelContent let-menu>
        @switch (menu.type) {
          @case ("Plant") {
            <div class="buy-tile-group">
              @for (option of cropOptions(); track option.crop) {
                <app-buy-tile
                  [image]="cropService.images[option.crop]"
                  [text]="option.crop"
                  [cost]="option.plantConst"
                  [disabled]="option.disabled"
                  (buyClick)="plantCrop(option.crop)"></app-buy-tile>
              }
            </div>
          }
          @case ("Storage") {}
          @default {
            <div>Select an option</div>
          }
        }
      </ng-template>
    </app-panel-menu-nav>

    <div class="flex flex-col gap-0 md:pb-4"></div>
  `,
  imports: [BuyTileComponent, PanelMenuNavComponent],
})
export class PlotPanelComponent {
  plotService = inject(PlotService);
  selectionService = inject(SelectionService);
  cropService = inject(CropService);

  crops = this.plotService.supportedCrops;

  menuOptions = computed(() => {
    return ["Plant", "Status", "Storage"];
  });

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
      const plotsWithoutCrop = plots.filter(
        (p) => p?.cultivate?.crop() !== crop,
      ).length;
      return {
        crop: crop,
        disabled: plotsWithoutCrop === 0,
        plantConst: plantConst[crop] * (plotsWithoutCrop || 1),
      };
    });
  });

  plantCrop(crop: Crop) {
    const plots = this.plots();
    this.plotService.plantOn(
      plots.map((p) => p.id),
      crop,
    );
  }
}
