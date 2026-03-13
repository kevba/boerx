import { effect, inject, Injectable } from "@angular/core";
import Konva from "konva";
import { SeasonTypes, WeatherService } from "../services/weather.service";
import { ColorMap, NoisyImageService } from "./utils/noisy-image.service";

@Injectable({
  providedIn: "root",
})
export class SurfaceService {
  private weatherService = inject(WeatherService);

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

  winterSurfaceColorMap: ColorMap = {
    "-0.8": "#417043",
    "-0.2": "#405041",
    "0.2": "#556635",
    "0.4": "#a3b387",
    "1": "#acaf9d",
  };

  springSurfaceColorMap: ColorMap = {
    "-0.8": "#3b8112",
    "-0.2": "#077c0d",
    "0.2": "#558004",
    "0.21": "#936599",
    "0.22": "#578108",
    "0.24": "#c29e00",
    "0.248": "#578108",
    "0.4": "#426b2f",
    "0.45": "#936599",
    "0.455": "#426b2f",
    "1": "#7A8450",
  };

  constructor() {
    this.setBackgroundImage();
    this.backgroundLayer.add(this.backgroudRect);

    effect(() => {
      const season = this.weatherService.season();
      let colorMap = this.surfaceColorMap;
      if (season === SeasonTypes.Winter) {
        colorMap = this.winterSurfaceColorMap;
      } else if (season === SeasonTypes.Spring) {
        colorMap = this.springSurfaceColorMap;
      }
      this.setBackgroundImage(colorMap);
    });
  }

  private setBackgroundImage(colorMap: ColorMap = this.surfaceColorMap) {
    const imageUrl = NoisyImageService.getPerlinNoiseImage(
      128,
      8,
      0.9,
      colorMap,
    );

    const imageObj = new Image();

    // Image must be loaded before setting as fill pattern, otherwise it won't render
    imageObj.onload = () => {
      this.backgroudRect.setAttrs({ fillPatternImage: imageObj });
    };

    imageObj.src = imageUrl;
  }
}
