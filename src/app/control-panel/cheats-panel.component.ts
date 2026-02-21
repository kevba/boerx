import { Component, inject } from "@angular/core";
import { MachineService } from "../services/machine.service";
import { PlotsService } from "../services/plots.service";
import { StashService } from "../services/stash.service";
import { BuyTileComponent } from "./buy-tile.component";

@Component({
  selector: "app-cheats-panel",
  imports: [BuyTileComponent],
  template: `
    <div class="flex flex-row flex-wrap gap-4 justify-center">
      <app-buy-tile
        image=""
        text="money!"
        [cost]="100000"
        (buyClick)="addMoney()"></app-buy-tile>
    </div>
  `,
})
export class CheatsPanelComponent {
  plotService = inject(PlotsService);
  machineService = inject(MachineService);
  stashService = inject(StashService);

  addMoney() {
    this.stashService.addStash(100000);
  }
}
