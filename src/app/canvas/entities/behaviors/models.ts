import { signal } from "@angular/core";

export type Act = { act: () => void; weight: number; description: string };

export abstract class Behavior {
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
