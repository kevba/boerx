import { effect, inject, Injectable } from "@angular/core";
import Konva from "konva";
import { SunService } from "../services/sun.service";
import { WeatherService, WeatherTypes } from "../services/weather.service";
import { ColorMap, NoisyImageService } from "./utils/noisy-image.service";

@Injectable({
  providedIn: "root",
})
export class WeatherRenderService {
  // TODO: Duplicated from canvas.component
  private size = 2500;

  private weatherService = inject(WeatherService);

  private sunService = inject(SunService);

  private weatherRect = new Konva.Rect({
    id: "weather",
    width: this.size,
    height: this.size,
    listening: false,
  });

  private daylightRect = new Konva.Rect({
    id: "daylight",
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
    "-1": "#6b6b6b00",
    "-0.7": "#ffffff7a",
    "-0.8": "#6b6b6b00",
    // "0.6": "#afafaf52",
    // "0.8": "#f3f3f362",
    "1": "#ffffff",
  };

  constructor() {
    this.layer.add(this.weatherRect);
    this.layer.add(this.daylightRect);

    setInterval(() => {
      this.setWeatherOverlay();
    }, 200);

    effect(() => {
      const lightLevel = this.sunService.lightLevel();
      this.setDaylightOverlay(lightLevel);
    });
  }

  private sunnyImage = NoisyImageService.getNoiseImage(1, 1, {
    1: "#ffffff00",
  });

  private setWeatherOverlay() {
    let imageUrl = "";
    if (this.weatherService.weather() === WeatherTypes.Rainy) {
      imageUrl = NoisyImageService.getNoiseImage(128, 8, this.rainColorMap);
    } else if (this.weatherService.weather() === WeatherTypes.Snow) {
      imageUrl = NoisyImageService.getNoiseImage(128, 8, this.snowColorMap);
    } else {
      imageUrl = this.sunnyImage;
    }

    const imageObj = new Image();

    // Image must be loaded before setting as fill pattern, otherwise it won't render
    imageObj.onload = () => {
      this.weatherRect.setAttrs({ fillPatternImage: imageObj });
    };

    imageObj.src = imageUrl;
  }

  private setDaylightOverlay(lightLevel: number) {
    const color = `rgba(0, 0, 0, ${(1 - lightLevel) / 2})`;

    const imageUrl = NoisyImageService.PixelsToImage([[color]], 1);

    const imageObj = new Image();

    // Image must be loaded before setting as fill pattern, otherwise it won't render
    imageObj.onload = () => {
      this.daylightRect.setAttrs({ fillPatternImage: imageObj });
    };

    imageObj.src = imageUrl;
  }
}
