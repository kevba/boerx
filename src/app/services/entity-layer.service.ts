import { Injectable } from "@angular/core";
import Konva from "konva";

@Injectable({
  providedIn: "root",
})
export class EntityLayerService {
  layer = new Konva.Layer({
    id: "entityLayer",
    imageSmoothingEnabled: false,
  });

  constructor() {}
}
