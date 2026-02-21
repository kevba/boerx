import { Component, computed, inject } from "@angular/core";
import { MachineService } from "../services/machine.service";
import { PlotsService } from "../services/plots.service";
import { StashService } from "../services/stash.service";
import { BuyTileComponent } from "./buy-tile.component";

@Component({
  selector: "app-shop-panel",
  imports: [BuyTileComponent],
  template: `
    <div class="flex flex-row flex-wrap gap-4 justify-center">
      <app-buy-tile
        image=""
        text="Plot"
        [cost]="plotService.plotCost()"
        (buyClick)="plotService.addPlot()"></app-buy-tile>
      <app-buy-tile
        image=""
        text="Machine"
        [cost]="machineService.machineCost()"
        (buyClick)="machineService.addMachine()"></app-buy-tile>
    </div>
  `,
})
export class ShopPanelComponent {
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
