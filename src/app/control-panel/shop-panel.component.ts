import { Component, computed, inject } from "@angular/core";
import { EntityType } from "../models/entity";
import { BuyService } from "../services/buy.service";
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
        [active]="activeBuyingEntity() === EntityType.Plot"
        [cost]="plotService.plotCost()"
        (buyClick)="onBuy(EntityType.Plot)"></app-buy-tile>
      <app-buy-tile
        image=""
        text="Machine"
        [active]="activeBuyingEntity() === EntityType.Tractor"
        [cost]="machineService.machineCost()"
        (buyClick)="onBuy(EntityType.Tractor)"></app-buy-tile>
    </div>
  `,
})
export class ShopPanelComponent {
  plotService = inject(PlotsService);
  machineService = inject(MachineService);
  stashService = inject(StashService);
  buyService = inject(BuyService);
  EntityType = EntityType;

  activeBuyingEntity = computed(() => this.buyService.buyingEntity());

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

  onBuy(entity: EntityType) {
    this.buyService.setBuying(entity, () => {
      if (entity === EntityType.Plot) {
        this.plotService.addPlot();
      } else if (entity === EntityType.Tractor) {
        this.machineService.addMachine();
      }
    });
  }
}
