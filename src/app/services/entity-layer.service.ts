import { Injectable } from "@angular/core";
import Konva from "konva";

@Injectable({
  providedIn: "root",
})
export class EntityLayerService {
  topLayer = new Konva.Layer({
    id: "entityTopLayer",
    imageSmoothingEnabled: false,
  });
  bottomLayer = new Konva.Layer({
    id: "entityBottomLayer",
    imageSmoothingEnabled: false,
  });

  constructor() {}
}
