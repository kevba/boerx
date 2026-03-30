import { inject, signal } from "@angular/core";
import { PowerService } from "../../../services/power.service";
import { Entity } from "../Entity";
import { Passive } from "./utils";

export interface IGeneratePower extends Entity<any, any> {
  generatePower: GeneratePower;
}

export class GeneratePower extends Passive {
  private powerService = inject(PowerService);
  private generatedPowerPerTick = signal(0);
  generatedPower = this.generatedPowerPerTick.asReadonly();

  constructor(generatedPower: number) {
    super();
    this.generatedPowerPerTick.set(generatedPower);
  }

  run(): void {
    this.powerService.add(this.generatedPowerPerTick());
  }
}
