import { Component, computed, inject } from "@angular/core";
import { IStorer } from "../canvas/entities/behaviors/storer";
import { BarnService } from "../services/entities/barn.service";
import { PlotsService } from "../services/entities/plots.service";
import { IncomeService } from "../services/income.service";
import { Crop } from "../services/items/crop.service";
import { StashService } from "../services/stash.service";
import { CropItem } from "../services/wares.service";

@Component({
  selector: "app-storage-panel",
  imports: [],
  host: {
    class: "w-full",
  },
  template: `
    <div class="flex flex-col flex-wrap gap-4 w-full">
      <div>
        <h3 class="text-xl text-green-500">Barn</h3>
        <div class="grid grid-cols-[max-content_1fr] flex-col gap-x-6 gap-y-1">
          @for (crop of storedCropsInBarn(); track crop.crop) {
            <div>{{ crop.crop }}</div>
            <div>{{ crop.amount }}</div>
          } @empty {
            <div class="text-rose-400">No crops in barn</div>
          }
        </div>
      </div>
      <div>
        <h3 class="text-xl text-green-500">Plot</h3>
        <div class="grid grid-cols-[max-content_1fr] flex-col gap-x-6 gap-y-1">
          @for (crop of storedCropsInPlots(); track crop.crop) {
            <div>{{ crop.crop }}</div>
            <div>{{ crop.amount }}</div>
          } @empty {
            <div class="text-rose-400">No crops in plots</div>
          }
        </div>
      </div>
      <button (click)="sellAllCrops()">Sell</button>
    </div>
  `,
})
export class StoragePanelComponent {
  plotService = inject(PlotsService);
  barnService = inject(BarnService);
  stashService = inject(StashService);

  incomeService = inject(IncomeService);

  storedCropsInBarn = computed(() => {
    let crops = this.getStoredCropsInEntity(this.barnService.entities());
    crops = crops.filter((crop) => crop.amount > 0);
    return crops;
  });

  storedCropsInPlots = computed(() => {
    let crops = this.getStoredCropsInEntity(this.plotService.entities());
    crops = crops.filter((crop) => crop.amount > 0);
    return crops;
  });

  sellAllCrops() {
    const cropxToSell: CropItem[] = [];

    const entities = [
      ...this.plotService.entities(),
      ...this.barnService.entities(),
    ];

    entities.forEach((e) => {
      const cropTypes = Object.values(Crop);
      for (const cropType of cropTypes) {
        const crop = e.storage.retrieveMax(cropType);
        if (crop) {
          cropxToSell.push(crop as CropItem);
        }
      }
    });

    this.incomeService.sellCrops(cropxToSell);
  }

  private getStoredCropsInEntity(entity: IStorer[]) {
    const cropTypes = Object.values(Crop);
    const cropRecord: Record<Crop, number> = cropTypes.reduce(
      (acc, crop) => {
        acc[crop] = 0;
        return acc;
      },
      {} as Record<Crop, number>,
    );

    entity.forEach((entity) => {
      const items = entity.storage.storedItems();
      items.forEach((item) => {
        // Only count crops, ignore other items that might be stored
        if (!cropTypes.includes(item.type as any)) {
          return;
        }
        const type = item.type as Crop;

        cropRecord[type] += item.amount;
      });
    });

    const cropArray = Object.keys(cropRecord).map((crop) => {
      return {
        crop: crop,
        amount: cropRecord[crop as Crop],
      };
    });

    return cropArray;
  }
}
