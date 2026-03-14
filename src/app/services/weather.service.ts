import {
  computed,
  effect,
  inject,
  Injectable,
  signal,
  untracked,
} from "@angular/core";
import { TickService } from "./tick.service";

@Injectable({
  providedIn: "root",
})
export class WeatherService {
  private seasonDurationInTicks = 120;

  private tickService = inject(TickService);

  private weatherForecast = signal<Array<WeatherTypes>>([
    ...new Array(10).fill(WeatherTypes.Sunny),
  ]);
  private currentWeather = computed<WeatherTypes>(() => {
    return this.weatherForecast()[0];
  });
  private currentSeason = signal(SeasonTypes.Spring);

  weather = this.currentWeather;
  season = this.currentSeason.asReadonly();

  constructor() {
    effect(() => {
      const tick = this.tickService.tick();
      if (tick % 20 === 0) {
        this.weatherForecast.update((forecast) => {
          const newForecast = [...forecast.splice(1)];
          newForecast.push(this.getRandomWeather());
          return newForecast;
        });
      }
    });

    effect(() => {
      const ticks = this.tickService.tick();

      const changeOver = (ticks + 1) % this.seasonDurationInTicks === 0;

      if (!changeOver) return;

      const currentSeason = untracked(() => this.currentSeason());
      const seasons = Object.values(SeasonTypes);
      const nextIndex = (seasons.indexOf(currentSeason) + 1) % seasons.length;
      const nextSeason = seasons[nextIndex];
      this.weatherForecast.update((forecast) => {
        const newForecast = new Array(forecast.length).map(() =>
          this.getRandomWeather(),
        );
        return newForecast;
      });

      this.currentSeason.set(nextSeason);
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

  setSeason(season: SeasonTypes) {
    this.currentSeason.set(season);
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
