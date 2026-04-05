import { Component, computed, inject, input } from "@angular/core";
import {
  CropStock,
  ICropStock,
} from "../../canvas/entities/abilities/cropStock";
import { EntityType } from "../../models/entity";
import { SelectionService } from "../../services/selection.service";

@Component({
  selector: "app-entity-crop-stock",
  template: `
    <div class="grid grid-cols-2 gap-2 w-full">
      <span class="text-lg">{{ "TOTAL" }}</span>
      <span [class.text-red-500]="usedCropStock() === maxCropStock()"
        >{{ usedCropStock() }} of {{ maxCropStock() }}</span
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
export class EntityCropStockComponent {
  private selectionService = inject(SelectionService);
  service = input.required<{
    entityType: EntityType;
    entities: () => ICropStock[];
  }>();

  selectedEntities = computed<ICropStock[]>(() => {
    const selectedIds =
      this.selectionService.selectedPerType()[this.service().entityType];

    return this.service()
      .entities()
      .filter((p) => selectedIds.includes(p.id))
      .filter((e): e is ICropStock => {
        return "cropStock" in e && e.cropStock instanceof CropStock;
      });
  });

  storedItems = computed(() => {
    const items = new Map<string, number>();
    for (const entity of this.selectedEntities()) {
      const stored = entity.cropStock.storedItems();
      for (const item of stored) {
        const current = items.get(item.type) || 0;

        items.set(item.type, current + item.amount);
      }
    }
    return Array.from(items, ([type, amount]) => ({ type, amount }));
  });

  maxCropStock = computed(() => {
    let max = 0;
    for (const entity of this.selectedEntities()) {
      max += entity.cropStock.totalSpace();
    }
    return max;
  });

  usedCropStock = computed(() => {
    let used = 0;
    for (const entity of this.selectedEntities()) {
      used += entity.cropStock.spaceUsed();
    }
    return used;
  });
}
