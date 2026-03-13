import { inject, Injectable } from "@angular/core";
import Konva from "konva";
import { WeatherService, WeatherTypes } from "../services/weather.service";
import { ColorMap, NoisyImageService } from "./utils/noisy-image.service";

@Injectable({
  providedIn: "root",
})
export class WeatherRenderService {
  // TODO: Duplicated from canvas.component
  private size = 2500;

  private weatherService = inject(WeatherService);

  private weatherRect = new Konva.Rect({
    id: "weather",
    width: this.size,
    height: this.size,
    listening: false,
  });

  layer = new Konva.Layer({
    imageSmoothingEnabled: false,
    listening: false,
  });

  rainColorMap: ColorMap = {
    "-1": "#33318666",
    "0.5": "#1e1cc444",
    "0.8": "#0400ff52",
    "1": "#0400ff26",
  };

  snowColorMap: ColorMap = {
    "-1": "#8d8d8d42",
    "0.4": "#afafaf52",
    "0.8": "#f3f3f362",
    "1": "#ffffff52",
  };

  constructor() {
    this.layer.add(this.weatherRect);

    setInterval(() => {
      this.setWeatherOverlay();
    }, 200);
  }

  private setWeatherOverlay() {
    let imageUrl = "";
    if (this.weatherService.weather() === WeatherTypes.Rainy) {
      imageUrl = NoisyImageService.getNoiseImage(128, 8, this.rainColorMap);
    } else if (this.weatherService.weather() === WeatherTypes.Snow) {
      imageUrl = NoisyImageService.getNoiseImage(128, 8, this.snowColorMap);
    } else {
      imageUrl = "";
    }

    const imageObj = new Image();

    // Image must be loaded before setting as fill pattern, otherwise it won't render
    imageObj.onload = () => {
      this.weatherRect.setAttrs({ fillPatternImage: imageObj });
    };

    imageObj.src = imageUrl;
  }
}
