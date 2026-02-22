import { computed, inject, Injectable, signal } from "@angular/core";
import { StashService } from "../stash.service";
import { Upgrader } from "./upgradeUtils";

@Injectable({
  providedIn: "root",
})
export class BarnService {
  private stashService = inject(StashService);

  private _barns = signal<Barn[]>([]);
  private baseCost = 20000;
  barnCost = computed(() => this.baseCost + (this.barns().length * 50) ** 2);

  upgrades = {
    [BarnSize.Shed]: {
      next: BarnSize.Storage,
      upgradeCost: this.baseCost * 2,
      earningsIncreasePerPlot: 1000,
    },
    [BarnSize.Storage]: {
      next: BarnSize.Warehouse,
      upgradeCost: this.baseCost * 3,
      earningsIncreasePerPlot: 2000,
    },
    [BarnSize.Warehouse]: {
      next: null,
      upgradeCost: this.baseCost * 4,
      earningsIncreasePerPlot: 4000,
    },
  };
  private upgrader = new Upgrader<BarnSize>(this.upgrades);

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

    const upgradeCost = this.upgradeCost(barnId, toSize);

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
        upgrade: toSize,
      };

      return [...barns];
    });
  }

  constructor() {}

  upgradeCost(barnId: string, toSize: BarnSize): number {
    const barn = this._barns().find((barn) => barn.id === barnId);
    if (!barn) return 0;

    return this.upgrader.fromToCost(barn.upgrade, toSize);
  }

  private newBarn(): Barn {
    return {
      id: crypto.randomUUID(),
      upgrade: BarnSize.Shed,
    };
  }
}

export type Barn = {
  id: string;
  upgrade: BarnSize;
};

export enum BarnSize {
  Shed = "Shed",
  Storage = "Storage",
  Warehouse = "Warehouse",
}
