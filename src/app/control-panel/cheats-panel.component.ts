import { Component, inject } from "@angular/core";
import { PlotService } from "../services/entities/plots.service";
import { TractorService } from "../services/entities/tractor.service";
import { InitService } from "../services/init.service";
import { StashService } from "../services/stash.service";
import { WeatherService, WeatherTypes } from "../services/weather.service";
import { BuyTileComponent } from "./buy-tile.component";

@Component({
  selector: "app-cheats-panel",
  imports: [BuyTileComponent],
  template: `
    <h2 class="pt-2">Cheats</h2>
    <div class="buy-tile-group">
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
    <h2 class="pt-2">Weather</h2>
    <div class="buy-tile-group">
      <app-buy-tile
        image=""
        text="Sunny"
        [cost]="0"
        (buyClick)="setWeatherSunny()"></app-buy-tile>
      <app-buy-tile
        image=""
        text="Rainy"
        [cost]="0"
        (buyClick)="setWeatherRainy()"></app-buy-tile>
      <app-buy-tile
        image=""
        text="Snow"
        [cost]="0"
        (buyClick)="setWeatherSnow()"></app-buy-tile>
    </div>
  `,
})
export class CheatsPanelComponent {
  plotService = inject(PlotService);
  tractorService = inject(TractorService);
  stashService = inject(StashService);
  weatherService = inject(WeatherService);
  initService = inject(InitService);

  addMoney() {
    this.stashService.addStash(100000);
  }

  resetSave() {
    localStorage.removeItem("gameState");
    window.location.reload();
  }

  setWeatherSunny() {
    this.weatherService.setWeather(WeatherTypes.Sunny);
  }
  setWeatherRainy() {
    this.weatherService.setWeather(WeatherTypes.Rainy);
  }

  setWeatherSnow() {
    this.weatherService.setWeather(WeatherTypes.Snow);
  }
}
