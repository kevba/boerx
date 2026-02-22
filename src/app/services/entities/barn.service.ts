import { computed, inject, Injectable, signal } from "@angular/core";
import { StashService } from "../stash.service";
import { UpgradeUtils } from "./upgradeUtils";

@Injectable({
  providedIn: "root",
})
export class BarnService {
  private stashService = inject(StashService);

  private _barns = signal<Barn[]>([]);

  barnCost = computed(() => 20000);
  upgrades = {
    [BarnSize.Shed]: {
      next: BarnSize.Storage,
      upgradeCost: 50000,
      earningsIncreasePerPlot: 1000,
    },
    [BarnSize.Storage]: {
      next: BarnSize.Warehouse,
      upgradeCost: 100000,
      earningsIncreasePerPlot: 2000,
    },
    [BarnSize.Warehouse]: {
      next: null,
      upgradeCost: 200000,
      earningsIncreasePerPlot: 4000,
    },
  };

  barns = computed(() => this._barns());

  addBarn() {
    const stash = this.stashService.stash();
    const cost = this.barnCost();
    if (stash < cost) {
      return;
    }
    this.stashService.addStash(-cost);
    const barn: Barn = this.newBarn();
    this._barns.update((barns) => [...barns, barn]);
  }

  upgradeBarn(barnId: string, toSize: BarnSize) {
    const barn = this._barns().find((barn) => barn.id === barnId);
    if (!barn) return;

    const upgradeCost = this.upgradeCostForSize(barnId, toSize);

    const stash = this.stashService.stash();
    if (stash < upgradeCost) {
      return;
    }
    this.stashService.addStash(-upgradeCost);

    this._barns.update((barns) => {
      const index = barns.findIndex((barn) => barn.id === barnId);
      if (index === -1) return barns;

      //   Create a new object, otherwise the signal won't detect the change since the reference is the same
      barns[index] = {
        ...barns[index],
        size: toSize,
      };

      return [...barns];
    });
  }

  constructor() {}

  upgradeCostForSize(barnId: string, toSize: BarnSize): number {
    const barn = this._barns().find((barn) => barn.id === barnId);
    if (!barn) return 0;

    return UpgradeUtils.FromToCost(this.upgrades, barn.size, toSize);
  }

  private newBarn(): Barn {
    return {
      id: crypto.randomUUID(),
      size: BarnSize.Shed,
    };
  }
}

export type Barn = {
  id: string;
  size: BarnSize;
};

export enum BarnSize {
  Shed = "Shed",
  Storage = "Barn",
  Warehouse = "Warehouse",
}
