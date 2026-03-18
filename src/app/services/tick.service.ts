import { computed, effect, Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class TickService {
  private _tick = signal(0);
  tick = this._tick.asReadonly();

  private _calculateTick = signal(0);
  calculate = this._calculateTick.asReadonly();

  dayDurationInTicks = 20;
  currentDay = computed(() => {
    return Math.floor(this.tick() / this.dayDurationInTicks);
  });

  constructor() {
    setInterval(() => {
      this._tick.update((tick) => tick + 1);
    }, 1000);

    // Calculate must happen after normal tick to prevent race conditions
    effect(() => {
      const tick = this.tick();
      this._calculateTick.set(tick);
    });
  }

  private updateOnTick() {}
}
