import { Entity } from "../Entity";
import { Stock } from "./stock";

export interface IWaterStock extends Entity<any, any> {
  waterStock: WaterStock;
}

export class WaterStock extends Stock<"water"> {}
