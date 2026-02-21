import { computed, Injectable, signal } from "@angular/core";

export enum EntityType {
  Plot = "plot",
  Machine = "machine",
}

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

  selectedMachines = computed(() => {
    const selected = this.selectedEntities();
    return selected
      .filter((e) => e.type === EntityType.Machine)
      .map((e) => e.id);
  });

  select(entityType: EntityType, id: string): void {
    this.selectedEntities.update((entities) => [
      ...(this.multiSelect() ? entities : []),
      { type: entityType, id },
    ]);
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
