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
export class TimeService {
  private tickService = inject(TickService);

  dayDurationInTicks = 60;
  seasonDuration = 24; // in days
  yearDuration = this.seasonDuration * Object.values(SeasonTypes).length; // in days

  currentDay = computed(() => {
    return Math.floor(this.tickService.tick() / this.dayDurationInTicks);
  });

  currentYear = computed(() => {
    return Math.floor(this.currentDay() / this.yearDuration);
  });

  currentDate = computed(() => {
    const dayOfYear = this.currentDay() % this.yearDuration;
    const seasonIndex = Math.floor(dayOfYear / this.seasonDuration);
    const dayOfSeason = dayOfYear % this.seasonDuration;
    return {
      year: this.currentYear(),
      season: Object.values(SeasonTypes)[seasonIndex],
      day: dayOfSeason,
    };
  });

  private currentSeason = signal(SeasonTypes.Spring);
  season = this.currentSeason.asReadonly();

  constructor() {
    effect(() => {
      const day = this.currentDay();

      const changeOver = (day + 1) % this.seasonDuration === 0;

      if (!changeOver) return;

      const currentSeason = untracked(() => this.currentSeason());
      const seasons = Object.values(SeasonTypes);
      const nextIndex = (seasons.indexOf(currentSeason) + 1) % seasons.length;
      const nextSeason = seasons[nextIndex];
      this.currentSeason.set(nextSeason);
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
