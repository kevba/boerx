import { inject, Injectable } from "@angular/core";
import { CropService } from "./items/crop.service";
import { StashService } from "./stash.service";
import { CropItem } from "./wares.service";

@Injectable({
  providedIn: "root",
})
export class IncomeService {
  private stashService = inject(StashService);
  private cropService = inject(CropService);

  sellCrop(item: CropItem) {
    const sellPrice = this.cropService.earnings()[item.type];
    const totalEarnings = sellPrice * item.amount;
    this.stashService.addStash(totalEarnings);
  }

  sellCrops(items: CropItem[]) {
    items.forEach((item) => {
      this.sellCrop(item);
    });
  }
}
