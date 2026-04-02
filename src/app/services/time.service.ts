import { computed, effect, inject, Injectable, signal } from "@angular/core";
import { TickService } from "./tick.service";

@Injectable({
  providedIn: "root",
})
export class TimeService {
  private tickService = inject(TickService);

  dayDurationInTicks = 15;
  seasonDuration = 24; // in days
  yearDuration = this.seasonDuration * Object.values(SeasonTypes).length; // in days

  currentHour = computed(() => {
    return Math.floor(this.tickService.tick() % this.dayDurationInTicks);
  });

  currentDay = computed(() => {
    return Math.floor(this.tickService.tick() / this.dayDurationInTicks);
  });

  currentYear = computed(() => {
    return Math.floor(this.currentDay() / this.yearDuration);
  });

  currentDate = computed(() => {
    const dayOfYear = this.currentDay() % this.yearDuration;
    const dayOfSeason = dayOfYear % this.seasonDuration;
    return {
      year: this.currentYear(),
      season: this.currentSeason(),
      day: dayOfSeason,
      dayOfYear: dayOfYear,
    };
  });

  lightLevel = computed(() => {
    const date = this.currentDate();
    const hour = this.currentHour();
    const dayProgress = hour / this.dayDurationInTicks;
    const dayLight = 0.5 * (1 + Math.cos(Math.PI - 2 * Math.PI * dayProgress));

    const dayOfYear = date.dayOfYear;
    const yearProgress = dayOfYear / this.yearDuration;
    const phaseOffset = 0.25;
    const seasonLight =
      0.5 * (1 + Math.cos(2 * Math.PI * (yearProgress - phaseOffset)));

    return dayLight * seasonLight;
  });

  private currentSeason = signal(SeasonTypes.Spring);
  season = this.currentSeason.asReadonly();

  constructor() {
    effect(() => {
      const date = this.currentDate();
      const hour = this.currentHour();
      const dayProgress = hour / this.dayDurationInTicks;
      const dayLight =
        0.5 * (1 + Math.cos(Math.PI - 2 * Math.PI * dayProgress));

      const dayOfYear = date.dayOfYear;
      const yearProgress = dayOfYear / this.yearDuration;
      const phaseOffset = 0.25;
      const seasonLight =
        0.75 + 0.25 * Math.cos(2 * Math.PI * (yearProgress - phaseOffset));

      return dayLight * seasonLight;
    });
  }

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
      days: this.seasonDuration - (this.currentDay() % this.seasonDuration),
    };
  }
}

export enum SeasonTypes {
  Spring = "Spring",
  Summer = "Summer",
  Fall = "Fall",
  Winter = "Winter",
}
