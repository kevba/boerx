import { Component, computed, inject } from "@angular/core";
import { EntityType } from "../models/entity";
import { BuyService } from "../services/buy.service";
import { BarnService } from "../services/entities/barn.service";
import { CowService } from "../services/entities/cow.service";
import { FarmerService } from "../services/entities/farmer.service";
import { PlotsService } from "../services/entities/plots.service";
import { TractorService } from "../services/entities/tractor.service";
import { StashService } from "../services/stash.service";
import { BuyTileComponent } from "./buy-tile.component";

@Component({
  selector: "app-shop-panel",
  imports: [BuyTileComponent],
  template: `
    <div class="buy-tile-group">
      <app-buy-tile
        image="/imgs/plot.png"
        text="Plot"
        [active]="activeBuyingEntity() === EntityType.Plot"
        [cost]="plotService.cost()"
        (buyClick)="onBuy(EntityType.Plot)"></app-buy-tile>
      <app-buy-tile
        image="/imgs/farmer.png"
        text="Farmer"
        [active]="activeBuyingEntity() === EntityType.Farmer"
        [cost]="farmerService.cost()"
        (buyClick)="onBuy(EntityType.Farmer)"></app-buy-tile>
      <app-buy-tile
        image="/imgs/barn.png"
        text="Barn"
        [active]="activeBuyingEntity() === EntityType.Barn"
        [cost]="barnService.cost()"
        (buyClick)="onBuy(EntityType.Barn)"></app-buy-tile>
      <app-buy-tile
        image="/imgs/cow.png"
        text="Cow"
        [active]="activeBuyingEntity() === EntityType.Cow"
        [cost]="cowService.cost()"
        (buyClick)="onBuy(EntityType.Cow)"></app-buy-tile>
      <app-buy-tile
        image="/imgs/tractor.png"
        text="Tractor"
        [active]="activeBuyingEntity() === EntityType.Tractor"
        [cost]="tractorService.cost()"
        (buyClick)="onBuy(EntityType.Tractor)"></app-buy-tile>
    </div>
  `,
})
export class ShopPanelComponent {
  plotService = inject(PlotsService);
  farmerService = inject(FarmerService);
  tractorService = inject(TractorService);
  barnService = inject(BarnService);
  cowService = inject(CowService);

  stashService = inject(StashService);
  buyService = inject(BuyService);
  EntityType = EntityType;

  activeBuyingEntity = computed(() => this.buyService.buyingEntityType());

  canBuyPlot = computed(() => {
    const cost = this.plotService.cost();
    const stash = this.stashService.stash();
    return stash >= cost;
  });

  canBuyFarmer = computed(() => {
    const cost = this.farmerService.cost();
    const stash = this.stashService.stash();
    return stash >= cost;
  });

  canBuyTractor = computed(() => {
    const cost = this.tractorService.cost();
    const stash = this.stashService.stash();
    return stash >= cost;
  });

  canBuyBarn = computed(() => {
    const cost = this.barnService.cost();
    const stash = this.stashService.stash();
    return stash >= cost;
  });

  canBuyCow = computed(() => {
    const cost = this.cowService.cost();
    const stash = this.stashService.stash();
    return stash >= cost;
  });

  onBuy(entity: EntityType) {
    this.buyService.setBuying(entity, () => {
      if (entity === EntityType.Plot) {
        this.plotService.buy();
      } else if (entity === EntityType.Farmer) {
        this.farmerService.buy();
      } else if (entity === EntityType.Tractor) {
        this.tractorService.buy();
      } else if (entity === EntityType.Barn) {
        this.barnService.buy();
      } else if (entity === EntityType.Cow) {
        this.cowService.buy();
      }
    });
  }
}
