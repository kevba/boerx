import { computed, Injectable, signal } from "@angular/core";
import { Crop } from "./entities/crop.service";

@Injectable({
  providedIn: "root",
})
export class NutrientsService {
  private _maxWater = signal(1000);
  private _maxFertilizer = signal(1000);

  private _water = signal(1000);
  private _fertilizer = signal(1000);

  maxWater = this._maxWater.asReadonly();
  maxFertilizer = this._maxFertilizer.asReadonly();

  water = this._water.asReadonly();
  fertilizer = this._fertilizer.asReadonly();

  cropBaseDepletion = computed<
    Record<Crop, { water: number; nutrients: number }>
  >(() => ({
    [Crop.Grass]: {
      water: 0,
      nutrients: 0,
    },
    [Crop.Wheat]: {
      water: 1,
      nutrients: 1,
    },
    [Crop.Corn]: {
      water: 5,
      nutrients: 2,
    },
    [Crop.Potato]: {
      water: 10,
      nutrients: 5,
    },
  }));

  cropValueMult = computed<Record<Crop, { water: number; nutrients: number }>>(
    () => {
      const water = this._water();
      const fertilizer = this._fertilizer();

      return {
        [Crop.Grass]: {
          water: water ? 1 : 0,
          nutrients: fertilizer ? 1 : 0,
        },
        [Crop.Wheat]: {
          water: water ? 1.05 : 0,
          nutrients: fertilizer ? 1.2 : 0,
        },
        [Crop.Corn]: {
          water: water ? 1.2 : 0,
          nutrients: fertilizer ? 1.2 : 0,
        },
        [Crop.Potato]: {
          water: water ? 1.5 : 0,
          nutrients: fertilizer ? 1.5 : 0,
        },
      };
    },
  );
  addWater(amount: number) {
    this._water.update((w) => w + amount);
  }

  addFertilizer(amount: number) {
    this._fertilizer.update((f) => f + amount);
  }
}
