import { computed, inject, Injectable, signal } from "@angular/core";
import { StashService } from "../stash.service";
import { Upgrader } from "./upgradeUtils";

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

  upgrades = {
    [TractorBrand.DearJuan]: {
      next: TractorBrand.OldHillland,
      upgradeCost: 5000,
      earningsIncreasePerPlot: 1000,
    },
    [TractorBrand.OldHillland]: {
      next: TractorBrand.Kerel,
      upgradeCost: 5000,
      earningsIncreasePerPlot: 2000,
    },
    [TractorBrand.Kerel]: {
      next: TractorBrand.Klaas,
      upgradeCost: 5000,
      earningsIncreasePerPlot: 3000,
    },
    [TractorBrand.Klaas]: {
      next: null,
      upgradeCost: 5000,
      earningsIncreasePerPlot: 4000,
    },
  };

  private upgrader = new Upgrader<TractorBrand>(this.upgrades);

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
    const upgradeCost = this.upgradeCostForSize(tractorId, brand);

    const stash = this.stashService.stash();
    if (stash < upgradeCost) {
      return;
    }
    this.stashService.addStash(-upgradeCost);

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
  upgradeCostForSize(tractorId: string, upgradeTo: TractorBrand): number {
    const tractor = this._tractors().find(
      (tractor) => tractor.id === tractorId,
    );
    if (!tractor) return 0;

    return this.upgrader.fromToCost(tractor.brand, upgradeTo);
  }

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
