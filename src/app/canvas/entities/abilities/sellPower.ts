import { inject, signal } from "@angular/core";
import { PowerService } from "../../../services/power.service";
import { Entity } from "../Entity";
import { StashService } from "./../../../services/stash.service";
import { Passive } from "./utils";

export interface ISellPower extends Entity<any, any> {
  sellPower: SellPower;
}

export class SellPower extends Passive {
  private powerService = inject(PowerService);
  private stashService = inject(StashService);
  private pricePerPowerUnit = signal(1);

  run(): void {
    const overSuppliedPower = this.powerService.overSuppliedPower();
    this.powerService.consumeOverSupply(overSuppliedPower);
    this.stashService.addStash(overSuppliedPower * this.pricePerPowerUnit());
  }
}
