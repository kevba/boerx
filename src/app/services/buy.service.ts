import { computed, Injectable, signal } from "@angular/core";
import { EntityType } from "../models/entity";

@Injectable({
  providedIn: "root",
})
export class BuyService {
  private _buying = signal<{
    entityType: EntityType;
    callback: () => void;
  } | null>(null);

  buyingEntity = computed(() => this._buying()?.entityType ?? null);
  private buyLocation: { x: number; y: number } | null = null;

  setBuying(entityType: EntityType, callback: () => void) {
    this._buying.set({ entityType, callback });
  }

  clear() {
    this._buying.set(null);
  }

  confirm(x: number, y: number) {
    const callback = this._buying()?.callback;
    if (callback) {
      this.buyLocation = { x, y };
      callback();
    }
    this._buying.set(null);
  }

  getBuyLocation() {
    if (!this.buyLocation) {
      return { x: 50, y: 50 };
    }

    const location = { ...this.buyLocation };
    this.buyLocation = null;

    return location;
  }
}
