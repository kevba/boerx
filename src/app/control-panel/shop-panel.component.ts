import { Component, computed, inject, Injector } from "@angular/core";
import { EntityType } from "../models/entity";
import { EntityService } from "../models/serviceMap";
import { BuyService } from "../services/buy.service";
import { CheatsService } from "../services/cheats.service";
import { BarnService } from "../services/entities/barn.service";
import { CowService } from "../services/entities/cow.service";
import { FarmerService } from "../services/entities/farmer.service";
import { GreenhouseService } from "../services/entities/greenhouse.service";
import { PlotService } from "../services/entities/plots.service";
import { TractorService } from "../services/entities/tractor.service";
import { VanService } from "../services/entities/van.service";
import { WeatherControlService } from "../services/entities/weather-control.service";
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
        image="/imgs/van.png"
        text="Van"
        [active]="activeBuyingEntity() === EntityType.Van"
        [cost]="vanService.cost()"
        (buyClick)="onBuy(EntityType.Van)"></app-buy-tile>
      <app-buy-tile
        image="/imgs/shed.png"
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
      <app-buy-tile
        image="/imgs/greenhouse.png"
        text="Greenhouse"
        [active]="activeBuyingEntity() === EntityType.Greenhouse"
        [cost]="greenHouseService.cost()"
        (buyClick)="onBuy(EntityType.Greenhouse)"></app-buy-tile>
      @if (cheatsService.unlocked()) {
        <app-buy-tile
          image="/imgs/weather-control.png"
          text="Weather Control"
          [active]="activeBuyingEntity() === EntityType.WeatherControl"
          [cost]="weatherControlService.cost()"
          (buyClick)="onBuy(EntityType.WeatherControl)"></app-buy-tile>
      }
    </div>
  `,
})
export class ShopPanelComponent {
  private injector = inject(Injector);

  cheatsService = inject(CheatsService);

  plotService = inject(PlotService);
  farmerService = inject(FarmerService);
  tractorService = inject(TractorService);
  barnService = inject(BarnService);
  cowService = inject(CowService);
  vanService = inject(VanService);
  weatherControlService = inject(WeatherControlService);
  greenHouseService = inject(GreenhouseService);

  stashService = inject(StashService);
  buyService = inject(BuyService);
  EntityType = EntityType;

  activeBuyingEntity = computed(() => this.buyService.buyingEntityType());

  onBuy(entity: EntityType) {
    this.buyService.setBuying(entity, () => {
      this.injector.get(EntityService[entity as EntityType]).buy();
    });
  }
}
