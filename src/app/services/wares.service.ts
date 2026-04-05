import { Crop } from "./items/crop.service";

export interface Item<T = string> {
  type: T;
  amount: number;
}

export interface CropItem extends Item {
  type: Crop;
}
