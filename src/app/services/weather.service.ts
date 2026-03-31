import {
  computed,
  effect,
  inject,
  Injectable,
  linkedSignal,
} from "@angular/core";
import { SeasonTypes, TimeService } from "./time.service";

@Injectable({
  providedIn: "root",
})
export class WeatherService {
  private timeService = inject(TimeService);

  private weatherForecast = linkedSignal<Array<WeatherTypes>>(() => {
    const forecast: WeatherTypes[] = [];

    for (let i = 0; i < 10; i++) {
      forecast.push(this.getNextForecast(forecast));
    }

    return forecast;
  });

  private currentWeather = computed<WeatherTypes>(() => {
    return this.weatherForecast()[0];
  });

  forecast = computed(() => [...this.weatherForecast()].splice(1));
  weather = this.currentWeather;

  constructor() {
    effect(() => {
      const _day = this.timeService.currentDay();
      this.weatherForecast.update((forecast) => {
        const nextForecast = this.getNextForecast(forecast);
        const newForecast = [...forecast].splice(1);
        newForecast.push(nextForecast);
        return newForecast;
      });
    });
  }

  private getNextForecast(currentForecast: WeatherTypes[]): WeatherTypes {
    let season = this.timeService.season();
    const nextSeason = this.timeService.daysTillSeason();

    if (nextSeason.days <= currentForecast.length) {
      season = nextSeason.season;
    }

    const rand = Math.random();

    if (season === SeasonTypes.Winter) {
      if (rand > 0.3) return WeatherTypes.Snow;
      if (rand > 0.2) return WeatherTypes.Rainy;
      else return WeatherTypes.Sunny;
    }

    if (season === SeasonTypes.Spring) {
      if (rand > 0.65) return WeatherTypes.Rainy;
      else return WeatherTypes.Sunny;
    }

    if (season === SeasonTypes.Summer) {
      if (rand > 0.7) return WeatherTypes.Rainy;
      else return WeatherTypes.Sunny;
    }

    if (season === SeasonTypes.Fall) {
      if (rand > 0.2) return WeatherTypes.Rainy;
      else return WeatherTypes.Sunny;
    }

    return WeatherTypes.Sunny;
  }

  setWeather(weather: WeatherTypes) {
    this.weatherForecast.update((forecast) => {
      const newForecast = new Array(forecast.length).fill(weather);
      newForecast[0] = weather;
      return newForecast;
    });
  }
}

export enum WeatherTypes {
  Sunny = "Sunny",
  Rainy = "Rainy",
  Snow = "Snow",
}
