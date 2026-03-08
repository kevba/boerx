import { Injectable } from "@angular/core";
import Konva from "konva";
import { ColorMap, NoisyImageService } from "./utils/noisy-image.service";

@Injectable({
  providedIn: "root",
})
export class SurfaceService {
  // TODO: Duplicated from canvas.component
  private size = 2500;

  backgroundLayer = new Konva.Layer({
    listening: false,
    imageSmoothingEnabled: false,
  });

  private backgroudRect = new Konva.Rect({
    id: "background",
    width: this.size,
    height: this.size,
    listening: false,
  });

  surfaceColorMap: ColorMap = {
    "-0.8": "#09770e",
    "-0.2": "#04800a",
    "0.2": "#558004",
    "0.4": "#556B2F",
    "1": "#7A8450",
  };

  constructor() {
    this.setBackgroundImage();
    this.backgroundLayer.add(this.backgroudRect);
  }

  private setBackgroundImage() {
    const imageUrl = NoisyImageService.getNoiseImage(
      128,
      8,
      0.9,
      this.surfaceColorMap,
    );

    const imageObj = new Image();

    // Image must be loaded before setting as fill pattern, otherwise it won't render
    imageObj.onload = () => {
      this.backgroudRect.setAttrs({ fillPatternImage: imageObj });
    };

    imageObj.src = imageUrl;
  }
}
