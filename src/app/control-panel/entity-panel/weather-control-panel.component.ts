import { Component, inject } from "@angular/core";
import { BuyTileComponent } from "../../components/buy-tile.component";
import { WeatherService, WeatherTypes } from "../../services/weather.service";

@Component({
  selector: "app-weather-control-panel",
  imports: [BuyTileComponent],
  host: {
    class: "w-full",
  },
  template: `
    <div class="buy-tile-group">
      @for (weather of weatherTypes; track weather) {
        <app-buy-tile
          image=""
          [text]="weather"
          [cost]="0"
          (buyClick)="setWeather(weather)"></app-buy-tile>
      }
    </div>
  `,
})
export class WeatherControlPanelComponent {
  private weatherService = inject(WeatherService);
  weatherTypes = Object.values(WeatherTypes);

  setWeather(weather: WeatherTypes) {
    this.weatherService.setWeather(weather);
  }
}
