import { Component, computed, inject, input } from "@angular/core";
import { Entity } from "../../canvas/entities/Entity";
import { BuyTileComponent } from "../../components/buy-tile.component";
import { EntityType } from "../../models/entity";
import { UpgradeTable } from "../../services/entities/upgradeUtils";
import { SelectionService } from "../../services/selection.service";

@Component({
  selector: "app-entity-upgrades",
  template: `
    <div class="buy-tile-group ">
      @for (option of options(); track option.upgrade) {
        <app-buy-tile
          image=""
          [text]="option.upgrade"
          [cost]="option.upgradeCost"
          [disabled]="option.disabled"
          (buyClick)="upgrade(option.upgrade)"></app-buy-tile>
      }
    </div>
  `,
  imports: [BuyTileComponent],
})
export class EntityUpgradesComponent {
  selectionService = inject(SelectionService);
  service = input.required<{
    entityType: EntityType;
    entities: () => Entity<any, any>[];
    upgrades: UpgradeTable<any>;
    upgradeCost: (id: string, upgrade: string) => number;
    upgrade: (id: string, upgrade: string) => void;
  }>();

  selectedEntities = computed<Entity<any, any>[]>(() => {
    const selectedIds =
      this.selectionService.selectedPerType()[this.service().entityType];

    return this.service()
      .entities()
      .filter((p) => selectedIds.includes(p.id));
  });

  options = computed(() => {
    let service = this.service();
    if (!service) return [];

    const entities = this.selectedEntities();
    const upgrades = Object.keys(service.upgrades);

    return upgrades.map((upgrade) => {
      const upgradable = entities.filter((p) => p.upgrade() !== upgrade).length;
      let upgradeCost = 0;
      for (const entity of entities) {
        const cost = service.upgradeCost(entity.id, upgrade);
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
    let service = this.service();

    if (!service) return;

    for (const entity of entities) {
      service.upgrade(entity.id, upgrade);
    }
  }
}
