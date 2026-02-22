import { Component, computed, inject } from "@angular/core";
import { CropService } from "../../services/entities/crop.service";
import {
  TractorBrand,
  TractorService,
} from "../../services/entities/tractor.service";
import { SelectionService } from "../../services/selection.service";
import { StashService } from "../../services/stash.service";
import { BuyTileComponent } from "../buy-tile.component";

@Component({
  selector: "app-tractor-panel",
  template: `
    <div class="flex flex-col gap-2 p-4 w-full h-full items-center">
      <div class="w-full">
        <h2 class="text-lg font-bold ">Upgrade Tractor</h2>
      </div>
      <div>
        <div class="flex flex-row flex-wrap gap-4 justify-center">
          @for (option of options(); track option.brand) {
            <app-buy-tile
              image=""
              [text]="option.brand"
              [cost]="option.upgradeCost"
              [disabled]="option.disabled"
              (buyClick)="upgradeTractor(option.brand)"></app-buy-tile>
          }
        </div>
      </div>
    </div>
  `,
  imports: [BuyTileComponent],
})
export class TractorPanelComponent {
  tractorService = inject(TractorService);
  selectionService = inject(SelectionService);
  cropService = inject(CropService);
  stashService = inject(StashService);

  brands = Object.values(TractorBrand);

  tractors = computed(() => {
    const selectedTractorIds = this.selectionService.selectedTractors();
    return this.tractorService
      .tractors()
      .filter((p) => selectedTractorIds.includes(p.id));
  });

  options = computed(() => {
    const tractors = this.tractors();

    return this.brands.map((brand) => {
      const upgradable = tractors.filter((p) => p?.brand !== brand).length;

      return {
        brand: brand,
        disabled: upgradable === 0,
        upgradeCost:
          this.tractorService.tractorUpgradeCost() * (upgradable || 1),
      };
    });
  });

  upgradeTractor(brand: TractorBrand) {
    const tractors = this.tractors();

    for (const tractor of tractors) {
      if (tractor?.brand === brand) {
        return;
      } else {
        this.tractorService.upgradeTractor(tractor.id, brand);
      }
    }
  }
}
