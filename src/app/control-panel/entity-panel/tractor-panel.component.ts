import { Component, computed, inject } from "@angular/core";
import {
  TractorBrand,
  TractorService,
} from "../../services/entities/tractor.service";
import { SelectionService } from "../../services/selection.service";
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

  tractors = computed(() => {
    const selectedTractorIds = this.selectionService.selectedTractors();
    return this.tractorService
      .tractors()
      .filter((p) => selectedTractorIds.includes(p.id));
  });

  options = computed(() => {
    const tractors = this.tractors();
    const upgrades = Object.keys(
      this.tractorService.upgrades,
    ) as TractorBrand[];

    return upgrades.map((brand) => {
      const upgradable = tractors.filter((p) => p?.brand !== brand).length;
      let upgradeCost = 0;
      for (const tractor of tractors) {
        const cost = this.tractorService.upgradeCostForSize(tractor.id, brand);
        upgradeCost += cost;
      }

      return {
        brand: brand,
        disabled: upgradable === 0,
        upgradeCost: upgradeCost,
      };
    });
  });

  upgradeTractor(brand: TractorBrand) {
    const tractors = this.tractors();

    for (const tractor of tractors) {
      this.tractorService.upgradeTractor(tractor.id, brand);
    }
  }
}
