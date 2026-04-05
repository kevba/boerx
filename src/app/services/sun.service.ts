import { computed, inject, Injectable } from "@angular/core";
import { SeasonTypes, TimeService } from "./time.service";
import { WeatherService, WeatherTypes } from "./weather.service";

@Injectable({
  providedIn: "root",
})
export class SunService {
  private timeService = inject(TimeService);
  private weatherService = inject(WeatherService);

  lightLevel = computed(() => {
    const hour = this.timeService.hourOfDay();
    const season = this.timeService.season();
    const dayOfSeason = this.timeService.dayOfSeason();
    let day = 0;

    switch (season) {
      case SeasonTypes.Spring:
        day = dayOfSeason + this.timeService.seasonDuration;
        break;
      case SeasonTypes.Summer:
        day = dayOfSeason + this.timeService.seasonDuration * 2;
        break;
      case SeasonTypes.Fall:
        day = dayOfSeason + this.timeService.seasonDuration * 3;
        break;
      case SeasonTypes.Winter:
        day = dayOfSeason;
        break;
    }

    const hourRad = (hour / this.timeService.dayDuration) * Math.PI;
    const dailyLightLevel = Math.sin(hourRad);

    const seasonRad = (day / this.timeService.yearDuration) * Math.PI;
    const seasonalLightLevel = Math.sin(seasonRad);

    const baseLight = dailyLightLevel * (0.7 + seasonalLightLevel * 0.3);

    const darkEdge = 0.35; // stay fully dark until lightLevel rises above this
    const lightEdge = 0.8; // start brightening after this
    const t = Math.min(
      Math.max((lightEdge - baseLight) / (lightEdge - darkEdge), 0),
      1,
    );

    const lightLevel = 1 - t * t * (3 - 2 * t);
    return lightLevel;
  });

  solarRadiation = computed(() => {
    const base = this.lightLevel() * 1000;
    if (this.weatherService.weather() === WeatherTypes.Sunny) {
      return base;
    }
    return base * 0.7;
  });
}
