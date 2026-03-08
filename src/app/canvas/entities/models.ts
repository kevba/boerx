import { Signal } from "@angular/core";
import { Crop } from "../../services/items/crop.service";

export interface CropGrower {
  cropGrowthStageFraction: Signal<number>; // Value between 0 and 1 representing growth progress
  cropGrowthStage: Signal<number>; // Current growth stage as an integer
}

export interface Harvestable extends CropGrower {
  canHarvest: Signal<boolean>;
  harvest(): void;
}

export interface Plantable extends CropGrower {
  canPlant: Signal<boolean>;
  plant(crop: Crop): void;
  crop: Signal<Crop>;
}
