import { signal } from "@angular/core";
import { Ability } from "../abilities/utils";

export type Act = { act: () => void; weight: number; description: string };

export abstract class Behavior extends Ability {
  protected maxRange = 400;
  disabled = signal(false);

  weight(): Act {
    if (this.disabled()) {
      return {
        description: "Disabled",
        act: () => undefined,
        weight: 0,
      };
    }
    return this.getWeight();
  }

  protected abstract getWeight(): Act;
}
