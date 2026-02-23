import { Component, computed, inject } from "@angular/core";
import { BaseService } from "../../services/entities/base.service";
import {
  TractorBrand,
  TractorService,
} from "../../services/entities/tractor.service";
import { SelectionService } from "../../services/selection.service";
import { EntityUpgradesComponent } from "./entity-upgrades.component";

@Component({
  selector: "app-tractor-panel",
  template: `
      <app-entity-upgrades />
  `,
  imports: [EntityUpgradesComponent],
  providers: [{ provide: BaseService, useExisting: TractorService }]
})
export class TractorPanelComponent {
  tractorService = inject(TractorService);
  selectionService = inject(SelectionService);

  tractors = computed(() => {
    const selectedTractorIds = this.selectionService.selectedTractors();
    return this.tractorService
      .entities()
      .filter((p) => selectedTractorIds.includes(p.id));
  });

  options = computed(() => {
    const tractors = this.tractors();
    const upgrades = Object.keys(
      this.tractorService.getUpgrades(),
    ) as TractorBrand[];

    return upgrades.map((brand) => {
      const upgradable = tractors.filter((p) => p?.upgrade !== brand).length;
      let upgradeCost = 0;
      for (const tractor of tractors) {
        const cost = this.tractorService.upgradeCost(tractor.id, brand);
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
      this.tractorService.upgrade(tractor.id, brand);
    }
  }
}
