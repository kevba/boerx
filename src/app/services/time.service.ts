import { computed, inject, Injectable, signal } from "@angular/core";
import { TickService } from "./tick.service";

@Injectable({
  providedIn: "root",
})
export class TimeService {
  private tickService = inject(TickService);

  timeTick = 1;

  hourDuration = this.timeTick * 1;
  dayDuration = this.hourDuration * 24;
  seasonDuration = this.dayDuration * 24;
  yearDuration = this.seasonDuration * Object.values(SeasonTypes).length; // in days

  totalHours = computed(() => {
    return Math.floor(this.tickService.tick() / this.hourDuration);
  });

  hourOfDay = computed(() => {
    return Math.floor(this.totalHours() % this.dayDuration);
  });

  totalDays = computed(() => {
    return Math.floor(this.tickService.tick() / this.dayDuration);
  });

  totalYears = computed(() => {
    return Math.floor(this.totalDays() / this.yearDuration);
  });

  dayOfYear = computed(() => {
    return this.totalDays() % (this.yearDuration / this.dayDuration);
  });

  dayOfSeason = computed(() => {
    return this.dayOfYear() % (this.seasonDuration / this.dayDuration);
  });

  displayDate = computed(() => {
    return {
      year: this.totalYears(),
      hour: this.hourOfDay(),
      season: this.currentSeason(),
      day: this.dayOfSeason() + 1, // +1 to make it 1-indexed for display
    };
  });

  lightLevel = computed(() => {
    const hour = this.hourOfDay();
    const season = this.currentSeason();
    const dayOfSeason = this.dayOfSeason();
    let day = 0;

    switch (season) {
      case SeasonTypes.Spring:
        day = dayOfSeason + this.seasonDuration;
        break;
      case SeasonTypes.Summer:
        day = dayOfSeason + this.seasonDuration * 2;
        break;
      case SeasonTypes.Fall:
        day = dayOfSeason + this.seasonDuration * 3;
        break;
      case SeasonTypes.Winter:
        day = dayOfSeason;
        break;
    }

    const hourRad = (hour / this.dayDuration) * Math.PI;
    const dailyLightLevel = Math.sin(hourRad);

    const seasonRad = (day / this.yearDuration) * Math.PI;
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

  private currentSeason = signal(SeasonTypes.Spring);
  season = this.currentSeason.asReadonly();

  constructor() {}

  setSeason(season: SeasonTypes) {
    this.currentSeason.set(season);
  }

  daysTillSeason(): { season: SeasonTypes; days: number } {
    const currentSeason = this.currentSeason();
    const seasons = Object.values(SeasonTypes);
    const nextIndex = (seasons.indexOf(currentSeason) + 1) % seasons.length;
    const nextSeason = seasons[nextIndex];
    return {
      season: nextSeason,
      days: this.seasonDuration - (this.totalDays() % this.seasonDuration),
    };
  }
}

export enum SeasonTypes {
  Spring = "Spring",
  Summer = "Summer",
  Fall = "Fall",
  Winter = "Winter",
}
