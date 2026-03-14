import { Component, inject } from "@angular/core";
import { PlotService } from "../services/entities/plots.service";
import { TractorService } from "../services/entities/tractor.service";
import { InitService } from "../services/init.service";
import { StashService } from "../services/stash.service";
import {
  SeasonTypes,
  WeatherService,
  WeatherTypes,
} from "../services/weather.service";
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
      @for (weather of weatherTypes; track weather) {
        <app-buy-tile
          image=""
          [text]="weather"
          [cost]="0"
          (buyClick)="setWeather(weather)"></app-buy-tile>
      }
    </div>
    <h2 class="pt-2">Season</h2>
    <div class="buy-tile-group">
      @for (season of seasonTypes; track season) {
        <app-buy-tile
          image=""
          [text]="season"
          [cost]="0"
          (buyClick)="setSeason(season)"></app-buy-tile>
      }
    </div>
  `,
})
export class CheatsPanelComponent {
  plotService = inject(PlotService);
  tractorService = inject(TractorService);
  stashService = inject(StashService);
  weatherService = inject(WeatherService);
  initService = inject(InitService);

  weatherTypes = Object.values(WeatherTypes);
  seasonTypes = Object.values(SeasonTypes);

  addMoney() {
    this.stashService.addStash(100000);
  }

  resetSave() {
    localStorage.removeItem("gameState");
    window.location.reload();
  }

  setWeather(weather: WeatherTypes) {
    this.weatherService.setWeather(weather);
  }

  setSeason(season: SeasonTypes) {
    this.weatherService.setSeason(season);
  }
}
