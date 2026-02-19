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

  constructor() {
    this.initializeMachines();
  }

  private initializeMachines() {
    this._machine.set([]);
  }

  private newMachine(): Machine {
    return {
      id: crypto.randomUUID(),
      type: MachineType.Tractor,
    };
  }
}

export enum MachineType {
  Tractor = "Tractor",
}
export type Machine = {
  id: string;
  type: MachineType;
};
