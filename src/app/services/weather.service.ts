import { computed, effect, inject, Injectable, signal } from "@angular/core";
import { TickService } from "./tick.service";

@Injectable({
  providedIn: "root",
})
export class WeatherService {
  private seasonDurationInTicks = 1000;

  private tickService = inject(TickService);

  private weatherForecast = signal<Array<WeatherTypes>>([
    ...new Array(10).fill(WeatherTypes.Sunny),
  ]);
  private currentWeather = computed<WeatherTypes>(() => {
    return this.weatherForecast()[0];
  });

  weather = this.currentWeather;
  season = computed(() => {
    const ticks = this.tickService.tick();
    const seasonIndex = Math.floor(ticks / this.seasonDurationInTicks) % 4;
    return Object.values(SeasonTypes)[seasonIndex];
  });

  constructor() {
    effect(() => {
      const tick = this.tickService.tick();
      if (tick % 50 === 0) {
        this.weatherForecast.update((forecast) => {
          const newForecast = [...forecast.splice(1)];
          newForecast.push(this.getRandomWeather());
          return newForecast;
        });
      }
    });
  }

  private getRandomWeather(): WeatherTypes {
    const rand = Math.random();

    if (this.season() === SeasonTypes.Winter) {
      if (rand > 0.3) return WeatherTypes.Snow;
      if (rand > 0.2) return WeatherTypes.Rainy;
      else return WeatherTypes.Sunny;
    }

    if (this.season() === SeasonTypes.Spring) {
      if (rand > 0.5) return WeatherTypes.Rainy;
      else return WeatherTypes.Sunny;
    }

    if (this.season() === SeasonTypes.Summer) {
      if (rand > 0.6) return WeatherTypes.Rainy;
      else return WeatherTypes.Sunny;
    }

    if (this.season() === SeasonTypes.Fall) {
      if (rand > 0.8) return WeatherTypes.Rainy;
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

export enum SeasonTypes {
  Spring = "Spring",
  Summer = "Summer",
  Fall = "Fall",
  Winter = "Winter",
}
