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
