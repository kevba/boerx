import { Component, inject } from "@angular/core";
import { PlotService } from "../services/entities/plots.service";
import { TractorService } from "../services/entities/tractor.service";
import { InitService } from "../services/init.service";
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
        [cost]="-100000"
        (buyClick)="addMoney()"></app-buy-tile>
      <app-buy-tile
        image=""
        text="reset save"
        [cost]="0"
        (buyClick)="resetSave()"></app-buy-tile>
    </div>
  `,
})
export class CheatsPanelComponent {
  plotService = inject(PlotService);
  tractorService = inject(TractorService);
  stashService = inject(StashService);
  initService = inject(InitService);

  addMoney() {
    this.stashService.addStash(100000);
  }

  resetSave() {
    localStorage.removeItem("gameState");
    window.location.reload();
  }
}
