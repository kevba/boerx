import { Component, computed, inject } from "@angular/core";
import { BarnService, BarnSize } from "../../services/entities/barn.service";
import { SelectionService } from "../../services/selection.service";
import { BuyTileComponent } from "../buy-tile.component";

@Component({
  selector: "app-barn-panel",
  template: `
    <div class="flex flex-col gap-2 p-4 w-full h-full items-center">
      <div class="w-full">
        <h2 class="text-lg font-bold ">Upgrade Barn</h2>
      </div>
      <div>
        <div class="flex flex-row flex-wrap gap-4">
          @for (option of options(); track option.size) {
            <app-buy-tile
              image=""
              [text]="option.size"
              [cost]="option.upgradeCost"
              [disabled]="option.disabled"
              (buyClick)="upgradeBarn(option.size)"></app-buy-tile>
          }
        </div>
      </div>
    </div>
  `,
  imports: [BuyTileComponent],
})
export class BarnPanelComponent {
  barnService = inject(BarnService);
  selectionService = inject(SelectionService);

  barns = computed(() => {
    const selectedBarnIds = this.selectionService.selectedBarns();
    return this.barnService
      .barns()
      .filter((b) => selectedBarnIds.includes(b.id));
  });

  options = computed(() => {
    const barns = this.barns();
    const upgrades = Object.keys(this.barnService.upgrades) as BarnSize[];

    return upgrades.map((size) => {
      let upgradeCost = 0;
      for (const barn of barns) {
        const cost = this.barnService.upgradeCost(barn.id, size);
        upgradeCost += cost;
      }

      return {
        size: size,
        disabled: upgradeCost === 0,
        upgradeCost: upgradeCost,
      };
    });
  });

  upgradeBarn(size: BarnSize) {
    const barns = this.barns();

    for (const barn of barns) {
      this.barnService.upgradeBarn(barn.id, size);
    }
  }
}
