import { effect, inject, Injectable, signal } from "@angular/core";
import { TickService } from "./tick.service";

@Injectable({
  providedIn: "root",
})
export class WeatherService {
  private tickService = inject(TickService);

  private currentWeather = signal<WeatherTypes>(WeatherTypes.Sunny);
  weather = this.currentWeather.asReadonly();

  constructor() {
    effect(() => {
      const tick = this.tickService.tick();
      if (tick % 10 === 0) {
        this.currentWeather.set(this.getRandomWeather());
      }
    });
  }

  private getRandomWeather(): WeatherTypes {
    const weatherValues = Object.values(WeatherTypes);
    const randomIndex = Math.max(
      Math.floor((Math.random() - 0.2) * weatherValues.length),
      0,
    );
    return weatherValues[randomIndex];
  }
}

export enum WeatherTypes {
  Sunny = "Sunny",
  Rainy = "Rainy",
}
