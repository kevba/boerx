import { inject, Injectable } from "@angular/core";
import Konva from "konva";
import { WeatherService } from "../services/weather.service";
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

  surfaceColorMap: ColorMap = {
    "-0.8": "#33318666",
    "-0.3": "#0400ff26",
    "1": "#0400ff26",
  };

  constructor() {
    this.layer.add(this.weatherRect);

    setInterval(() => {
      this.setWeatherOverlay();
    }, 100);
  }

  private setWeatherOverlay() {
    let imageUrl = "";
    if (this.weatherService.weather() === "Rainy") {
      imageUrl = NoisyImageService.getNoiseImage(
        128,
        8,
        0.9,
        this.surfaceColorMap,
      );
    } else {
      imageUrl = NoisyImageService.getNoiseImage(128, 8, 0.9, {
        "-1": "#00000000",
      });
    }

    const imageObj = new Image();

    // Image must be loaded before setting as fill pattern, otherwise it won't render
    imageObj.onload = () => {
      this.weatherRect.setAttrs({ fillPatternImage: imageObj });
    };

    imageObj.src = imageUrl;
  }
}
