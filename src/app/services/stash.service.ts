import { computed, effect, Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class StashService {
  private _stash = signal<number>(20000);
  private tick = signal(0);

  stashUnit = "ƒ";
  stash = computed(() => this._stash());

  addStash(amount: number) {
    this._stash.update((stash) => stash + amount);
  }

  constructor() {
    effect(() => {
      const _ = this.tick();
      this.updateStashOnTick();
    });
  }

  private updateStashOnTick() {}
}
