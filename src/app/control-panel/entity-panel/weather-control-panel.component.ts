import { Component, inject } from "@angular/core";
import {
  SeasonTypes,
  WeatherService,
  WeatherTypes,
} from "../../services/weather.service";
import { BuyTileComponent } from "../buy-tile.component";

@Component({
  selector: "app-weather-control-panel",
  imports: [BuyTileComponent],
  host: {
    class: "w-full",
  },
  template: `
    <h2 class="pt-2">Weather</h2>

    <div class="flex flex-col flex-wrap gap-4 w-full">
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
    </div>
  `,
})
export class WeatherControlPanelComponent {
  private weatherService = inject(WeatherService);

  weatherTypes = Object.values(WeatherTypes);
  seasonTypes = Object.values(SeasonTypes);
  setWeather(weather: WeatherTypes) {
    this.weatherService.setWeather(weather);
  }

  setSeason(season: SeasonTypes) {
    this.weatherService.setSeason(season);
  }
}
