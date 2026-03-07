import { Crop } from "./items/crop.service";

export interface Item {
  type: string;
  amount: number;
}

export interface CropItem extends Item {
  type: Crop;
}
