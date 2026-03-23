import { DecimalPipe } from "@angular/common";
import { Component, computed, inject } from "@angular/core";
import { Crop, CropService } from "../services/items/crop.service";
import { StashService } from "../services/stash.service";

@Component({
  selector: "app-financial-bar",
  imports: [DecimalPipe],
  template: `
    <div class="flex flex row gap-4 w-full ">
      <div class="md:text-sm text-xs font-bold">
        <span>Stash: </span>
        <span class="text-amber-500">
          {{ stashService.stash() | number: "1.0-0"
          }}{{ stashService.stashUnit }}
        </span>
      </div>
    </div>
  `,
})
export class FinancialBarComponent {
  stashService = inject(StashService);
  cropService = inject(CropService);

  cropPrices = computed(() => {
    const cropValues = this.cropService.earnings();
    const crops = Object.values(Crop);

    return crops.map((crop) => ({
      crop: crop,
      income: cropValues[crop],
    }));
  });
}
