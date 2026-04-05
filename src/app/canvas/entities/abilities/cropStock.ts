import { Crop } from "../../../services/items/crop.service";
import { Entity } from "../Entity";
import { Stock } from "./stock";

export interface ICropStock extends Entity<any, any> {
  cropStock: CropStock;
}

export class CropStock extends Stock<Crop> {}
