import { computed, inject, Injectable, signal } from "@angular/core";
import { StashService } from "../stash.service";

@Injectable({
  providedIn: "root",
})
export class TractorService {
  private stashService = inject(StashService);

  private _tractors = signal<Tractor[]>([]);

  tractors = computed(() => this._tractors());
  tractorCost = computed(() => 10000);
  tractorUpgradeCost = computed(() => 10000);

  tractorEarningsIncreasePerPlot = computed(() => 100);

  addTractor() {
    const cost = this.tractorCost();
    const stash = this.stashService.stash();
    if (stash < cost) {
      return;
    }
    this.stashService.addStash(-cost);
    const tractor: Tractor = this.newTractor();
    this._tractors.update((tractors) => [...tractors, tractor]);
  }

  upgradeTractor(tractorId: string, brand: TractorBrand) {
    const cost = this.tractorUpgradeCost();

    const stash = this.stashService.stash();
    if (stash < cost) {
      return;
    }
    this.stashService.addStash(-cost);

    this._tractors.update((tractors) => {
      const index = tractors.findIndex((tractor) => tractor.id === tractorId);
      if (index === -1) return tractors;

      //   Create a new object, otherwise the signal won't detect the change since the reference is the same
      tractors[index] = {
        ...tractors[index],
        brand: brand,
      };

      return [...tractors];
    });
  }

  constructor() {}

  private newTractor(): Tractor {
    return {
      id: crypto.randomUUID(),
      brand: TractorBrand.DearJuan,
    };
  }
}

export type Tractor = {
  id: string;
  brand: TractorBrand;
};

export enum TractorBrand {
  DearJuan = "Dear Juan",
  OldHillland = "Old Hillland",
  Kerel = "Kerel",
  Klaas = "Klaas",
}
