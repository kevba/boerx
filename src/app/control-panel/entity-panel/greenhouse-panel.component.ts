import { Component, computed, inject } from "@angular/core";
import { EntityType } from "../../models/entity";
import { BaseService } from "../../services/entities/base.service";
import { GreenhouseService } from "../../services/entities/greenhouse.service";
import { Crop, CropService } from "../../services/items/crop.service";
import { SelectionService } from "../../services/selection.service";
import { BuyTileComponent } from "../buy-tile.component";

@Component({
  selector: "app-greenhouse-panel",
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
  `,
  providers: [{ provide: BaseService, useExisting: GreenhouseService }],
  imports: [BuyTileComponent],
})
export class GreenhousePanelComponent {
  greenhouseService = inject(GreenhouseService);
  selectionService = inject(SelectionService);
  cropService = inject(CropService);

  crops = this.greenhouseService.supportedCrops;

  greenhouses = computed(() => {
    const selectedGreenhouseIds =
      this.selectionService.selectedPerType()[EntityType.Greenhouse];
    return this.greenhouseService
      .entities()
      .filter((p) => selectedGreenhouseIds.includes(p.id));
  });

  cropOptions = computed(() => {
    const plantConst = this.cropService.plantCost();
    const greenhouses = this.greenhouses();

    return this.crops.map((crop) => {
      const greenhousesWithoutCrop = greenhouses.filter(
        (p) => p?.cultivate?.crop() !== crop,
      ).length;
      return {
        crop: crop,
        disabled: greenhousesWithoutCrop === 0,
        plantConst: plantConst[crop] * (greenhousesWithoutCrop || 1),
      };
    });
  });

  plantCrop(crop: Crop) {
    const greenhouses = this.greenhouses();
    this.greenhouseService.plantOn(
      greenhouses.map((g) => g.id),
      crop,
    );
  }
}
