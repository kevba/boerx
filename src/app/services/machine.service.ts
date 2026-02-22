import { computed, inject, Injectable, signal } from "@angular/core";
import { StashService } from "./stash.service";

@Injectable({
  providedIn: "root",
})
export class MachineService {
  private stashService = inject(StashService);

  private _machine = signal<Machine[]>([]);

  machines = computed(() => this._machine());
  machineCost = computed(() => 10000);
  machineUpgradeCost = computed(() => 10000);

  machineEarningsIncreasePerPlot = computed(() => 100);

  addMachine() {
    const cost = this.machineCost();
    const stash = this.stashService.stash();
    if (stash < cost) {
      return;
    }
    this.stashService.addStash(-cost);
    const plot: Machine = this.newMachine();

    this._machine.update((plots) => [...plots, plot]);
  }

  upgradeMachine(machineId: string, brand: TractorBrand) {
    const cost = this.machineUpgradeCost();

    const stash = this.stashService.stash();
    if (stash < cost) {
      return;
    }
    this.stashService.addStash(-cost);

    this._machine.update((machines) => {
      const machineIndex = machines.findIndex(
        (machine) => machine.id === machineId,
      );
      if (machineIndex === -1) return machines;

      //   Create a new object, otherwise the signal won't detect the change since the reference is the same
      machines[machineIndex] = {
        ...machines[machineIndex],
        brand: brand,
      };

      return [...machines];
    });
  }

  constructor() {
    this.initializeMachines();
  }

  private initializeMachines() {
    this._machine.set([this.newMachine()]);
  }

  private newMachine(): Machine {
    return {
      id: crypto.randomUUID(),
      type: MachineType.Tractor,
      brand: TractorBrand.DearJuan,
    };
  }
}

export enum MachineType {
  Tractor = "Tractor",
}
export type Machine = {
  id: string;
  type: MachineType;
  brand: TractorBrand;
};

export enum TractorBrand {
  DearJuan = "Dear Juan",
  OldHillland = "Old Hillland",
  Kerel = "Kerel",
  Klaas = "Klaas",
}
