import { Component, computed, inject } from "@angular/core";
import { BaseService } from "../../services/entities/base.service";
import { SelectionService } from "../../services/selection.service";
import { BuyTileComponent } from "../buy-tile.component";

@Component({
  selector: "app-entity-upgrades",
  template: `
    <div class="flex flex-col gap-2 p-4 w-full h-full">
      <div class="w-full">
        <h2 class="text-lg font-bold ">Upgrades</h2>
      </div>
      <div>
        <div class="flex flex-row flex-wrap gap-4 justify-center">
          @for (option of options(); track option.upgrade) {
            <app-buy-tile
              image=""
              [text]="option.upgrade"
              [cost]="option.upgradeCost"
              [disabled]="option.disabled"
              (buyClick)="upgrade(option.upgrade)"></app-buy-tile>
          }
        </div>
      </div>
    </div>
  `,
  imports: [BuyTileComponent],
})
export class EntityUpgradesComponent {
  selectionService = inject(SelectionService);
  // BE sure to provide the correct service when using this component
  entityService = inject(BaseService<any, any>);

  selectedEntities = computed(() => {
    const selectedIds = this.selectionService.selectedPerType()[this.entityService.entityType];
    return this.entityService
      .entities()
      .filter((p) => selectedIds.includes(p.id));
  });

  options = computed(() => {
    const entities = this.selectedEntities();
    const upgrades = Object.keys(
      this.entityService.getUpgrades(),
    )

    return upgrades.map((upgrade) => {
      const upgradable = entities.filter((p) => p.upgrade !== upgrade).length;
      let upgradeCost = 0;
      for (const entity of entities) {
        const cost = this.entityService.upgradeCost(entity.id, upgrade);
        upgradeCost += cost;
      }
      return {
        upgrade: upgrade,
        disabled: upgradable === 0,
        upgradeCost: upgradeCost,
      };
    });
  });

  upgrade(upgrade: string) {
    const entities = this.selectedEntities();

    for (const entity of entities) {
      this.entityService.upgrade(entity.id, upgrade);
    }
  }
}
