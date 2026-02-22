import { Component, computed, inject } from "@angular/core";
import { EntityType } from "../models/entity";
import { BuyService } from "../services/buy.service";
import { BarnService } from "../services/entities/barn.service";
import { PlotsService } from "../services/entities/plots.service";
import { TractorService } from "../services/entities/tractor.service";
import { StashService } from "../services/stash.service";
import { BuyTileComponent } from "./buy-tile.component";

@Component({
  selector: "app-shop-panel",
  imports: [BuyTileComponent],
  template: `
    <div class="flex flex-row flex-wrap gap-4">
      <app-buy-tile
        image=""
        text="Plot"
        [active]="activeBuyingEntity() === EntityType.Plot"
        [cost]="plotService.plotCost()"
        (buyClick)="onBuy(EntityType.Plot)"></app-buy-tile>
      <app-buy-tile
        image="/imgs/barn.png"
        text="Barn"
        [active]="activeBuyingEntity() === EntityType.Barn"
        [cost]="barnService.barnCost()"
        (buyClick)="onBuy(EntityType.Barn)"></app-buy-tile>
      <app-buy-tile
        image="/imgs/tractor.png"
        text="Tractor"
        [active]="activeBuyingEntity() === EntityType.Tractor"
        [cost]="tractorService.tractorCost()"
        (buyClick)="onBuy(EntityType.Tractor)"></app-buy-tile>
    </div>
  `,
})
export class ShopPanelComponent {
  plotService = inject(PlotsService);
  tractorService = inject(TractorService);
  barnService = inject(BarnService);
  stashService = inject(StashService);
  buyService = inject(BuyService);
  EntityType = EntityType;

  activeBuyingEntity = computed(() => this.buyService.buyingEntity());

  canBuyPlot = computed(() => {
    const cost = this.plotService.plotCost();
    const stash = this.stashService.stash();
    return stash >= cost;
  });

  canBuyTractor = computed(() => {
    const cost = this.tractorService.tractorCost();
    const stash = this.stashService.stash();
    return stash >= cost;
  });

  canBuyBarn = computed(() => {
    const cost = this.barnService.barnCost();
    const stash = this.stashService.stash();
    return stash >= cost;
  });

  onBuy(entity: EntityType) {
    this.buyService.setBuying(entity, () => {
      if (entity === EntityType.Plot) {
        this.plotService.addPlot();
      } else if (entity === EntityType.Tractor) {
        this.tractorService.addTractor();
      } else if (entity === EntityType.Barn) {
        this.barnService.addBarn();
      }
    });
  }
}
