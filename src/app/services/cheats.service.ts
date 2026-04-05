import { computed, Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class CheatsService {
  private pressesRequired = 5;
  private pressCount = signal(0);

  unlocked = computed(() => this.pressCount() >= this.pressesRequired);

  constructor() {
    if (window.location.hostname === "localhost") {
      this.pressCount.set(this.pressesRequired);
    }
  }

  unlock() {
    if (this.unlocked()) {
      this.pressCount.set(0);
    }
    this.pressCount.update((count) => count + 1);
  }
}
