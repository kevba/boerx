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
export class PowerService {
  private tickService = inject(TickService);
  private power = signal(0);
  private overSupply = signal(0);
  private generated = signal(0);
  availablePower = computed(() => this.power());
  overSuppliedPower = computed(() => this.overSupply());

  constructor() {
    effect(() => {
      const _tick = this.tickService.calculate();
      const generated = untracked(() => this.generated());
      const currentPower = untracked(() => this.power());
      this.power.set(generated);
      this.generated.set(0);
      this.overSupply.set(Math.max(0, currentPower));
    });
  }

  add(amount: number): void {
    this.generated.update((g) => g + amount);
  }

  consume(amount: number): boolean {
    if (this.power() >= amount) {
      this.power.update((p) => p - amount);
      return true;
    }
    return false;
  }

  consumeOverSupply(amount: number): void {
    this.overSupply.update((o) => o - amount);
  }
}
