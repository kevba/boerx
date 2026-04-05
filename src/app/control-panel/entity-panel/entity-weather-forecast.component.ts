import { Component, computed, inject } from "@angular/core";
import { WeatherStationService } from "../../services/entities/weatherStation.service";
import { SunService } from "../../services/sun.service";
import { WeatherService } from "../../services/weather.service";

@Component({
  selector: "app-entity-weather-forecast",
  template: `
    <div class="grid grid-cols-2 gap-1">
      <span class="col-span-1">Light </span>
      <p class="col-span-1">{{ rad() }}W/m²</p>
      <span class="col-span-1">now</span>
      <p class="col-span-1">{{ currentWeather() }}</p>

      @for (day of forecast(); track day.day) {
        <span class="col-span-1">{{ day.day }}</span>
        <p class="col-span-1">{{ day.weather }}</p>
      }
    </div>
  `,
  imports: [],
})
export class EntityWeatherForecastComponent {
  private weatherService = inject(WeatherService);
  private weatherStations = inject(WeatherStationService);
  private sunService = inject(SunService);

  rad = computed(() => this.sunService.solarRadiation());

  currentWeather = computed(() => this.weatherService.weather());
  forecast = computed(() => {
    const maxForecast = this.weatherStations.entities().length + 1;

    return this.weatherService
      .forecast()
      .slice(0, maxForecast)
      .map((weather, index) => {
        return {
          weather,
          day: index + 1,
        };
      });
  });
}
