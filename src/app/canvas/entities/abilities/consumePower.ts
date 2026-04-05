import { computed, inject, signal } from "@angular/core";
import { PowerService } from "../../../services/power.service";
import { Entity } from "../Entity";
import { Passive } from "./utils";

export interface IConsumePower extends Entity<any, any> {
  consumePower: ConsumePower;
}

export class ConsumePower extends Passive {
  private powerService = inject(PowerService);
  private consumePerTick = signal(0);
  canConsume = computed(() => {
    return this.powerService.availablePower() >= this.consumePerTick();
  });

  hasPower = signal(true);

  constructor(consumePerTick: number) {
    super();
    this.consumePerTick.set(consumePerTick);
  }

  run(): void {
    if (!this.canConsume()) {
      this.hasPower.set(false);
      return;
    }

    this.hasPower.set(true);
    this.powerService.consume(this.consumePerTick());
  }

  setConsume(amount: number) {
    this.consumePerTick.set(amount);
  }
}
