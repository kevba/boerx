import { Component, computed, inject, input } from "@angular/core";
import { IStorage, Storage } from "../../canvas/entities/abilities/store";
import { EntityType } from "../../models/entity";
import { SelectionService } from "../../services/selection.service";

@Component({
  selector: "app-entity-storage",
  template: `
    <div class="grid grid-cols-2 gap-2 w-full">
      <span class="text-lg">{{ "TOTAL" }}</span>
      <span [class.text-red-500]="usedStorage() === maxStorage()"
        >{{ usedStorage() }} of {{ maxStorage() }}</span
      >
      <div class="col-span-2"></div>

      @for (item of storedItems(); track item.type) {
        <div class="col-span-1">
          <div class="text">{{ item.type }}</div>
        </div>
        <div class="col-span-1">
          <div class="text">{{ item.amount }}</div>
        </div>
      } @empty {
        <span class="text-gray-300/80"> EMPTY </span>
      }
    </div>
  `,
  imports: [],
})
export class EntityStorageComponent {
  private selectionService = inject(SelectionService);
  service = input.required<{
    entityType: EntityType;
    entities: () => IStorage[];
  }>();

  selectedEntities = computed<IStorage[]>(() => {
    const selectedIds =
      this.selectionService.selectedPerType()[this.service().entityType];

    return this.service()
      .entities()
      .filter((p) => selectedIds.includes(p.id))
      .filter((e): e is IStorage => {
        return "storage" in e && e.storage instanceof Storage;
      });
  });

  storedItems = computed(() => {
    const items = new Map<string, number>();
    for (const entity of this.selectedEntities()) {
      const stored = entity.storage.storedItems();
      for (const item of stored) {
        const current = items.get(item.type) || 0;

        items.set(item.type, current + item.amount);
      }
    }
    return Array.from(items, ([type, amount]) => ({ type, amount }));
  });

  maxStorage = computed(() => {
    let max = 0;
    for (const entity of this.selectedEntities()) {
      max += entity.storage.totalSpace();
    }
    return max;
  });

  usedStorage = computed(() => {
    let used = 0;
    for (const entity of this.selectedEntities()) {
      used += entity.storage.spaceUsed();
    }
    return used;
  });
}
