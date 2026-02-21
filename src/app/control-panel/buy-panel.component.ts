import { Component, computed, inject } from "@angular/core";
import { MachineService } from "../services/machine.service";
import { PlotsService } from "../services/plots.service";
import { StashService } from "../services/stash.service";

@Component({
  selector: "app-buy-panel",
  template: `
    <div class="flex flex-col h-full gap-2">
      <h2 class="text-lg font-bold ">Buy</h2>

      <div class="flex flex-wrap gap-2">
        <div class="flex flex-col gap-4 h-full">
          <button (click)="plotService.addPlot()" [disabled]="!canBuyPlot()">
            Plot (-{{ plotService.plotCost() }} {{ stashService.stashUnit }})
          </button>
        </div>
        <div class="flex flex-col gap-4 h-full">
          <button
            (click)="machineService.addMachine()"
            [disabled]="!canBuyMachine()"
          >
            Machine (-{{ machineService.machineCost() }}
            {{ stashService.stashUnit }})
          </button>
        </div>
      </div>
    </div>
  `,
})
export class BuyPanelComponent {
  plotService = inject(PlotsService);
  machineService = inject(MachineService);
  stashService = inject(StashService);

  canBuyPlot = computed(() => {
    const cost = this.plotService.plotCost();
    const stash = this.stashService.stash();
    return stash >= cost;
  });

  canBuyMachine = computed(() => {
    const cost = this.machineService.machineCost();
    const stash = this.stashService.stash();
    return stash >= cost;
  });
}
