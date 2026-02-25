import { computed, Injectable, signal } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { EntityType } from "../models/entity";

export type SelectedEntity = {
  type: EntityType;
  id: string;
};

@Injectable({
  providedIn: "root",
})
export class SelectionService {
  private selectedEntities = signal<SelectedEntity[]>([]);
  private multiSelect = signal(false);

  selected = this.selectedEntities.asReadonly();

  selectedPlots = computed(() => {
    const selected = this.selectedEntities();
    return selected.filter((e) => e.type === EntityType.Plot).map((e) => e.id);
  });

  selectedTractors = computed(() => {
    const selected = this.selectedEntities();
    return selected
      .filter((e) => e.type === EntityType.Tractor)
      .map((e) => e.id);
  });

  selectedBarns = computed(() => {
    const selected = this.selectedEntities();
    return selected.filter((e) => e.type === EntityType.Barn).map((e) => e.id);
  });

  selectedPerType = computed(() => {
    const selected = this.selectedEntities();
    const types = Object.values(EntityType).reduce(
      (acc, type) => {
        acc[type] = selected.filter((e) => e.type === type).map((e) => e.id);
        return acc;
      },
      {} as Record<EntityType, string[]>,
    );

    return types;
  });

  selectedPerType$ = toObservable(this.selectedPerType);

  select(entityType: EntityType, id: string): void {
    this.selectedEntities.update((entities) => {
      const ofType = entities.filter((e) => e.type === entityType);
      return [...(this.multiSelect() ? ofType : []), { type: entityType, id }];
    });
  }

  deselect(id: string): void {
    this.selectedEntities.update((entities) => [
      ...entities.filter((e) => e.id !== id),
    ]);
  }

  clear(): void {
    this.selectedEntities.set([]);
  }

  setMulti(multi: boolean): void {
    this.multiSelect.set(multi);
  }
}
