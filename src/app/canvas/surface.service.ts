import { computed, Injectable } from "@angular/core";
import { ColorMap, NoisyImageService } from "./utils/noisy-image.service";

@Injectable({
  providedIn: "root",
})
export class SurfaceService {
  surfaceColorMap: ColorMap = {
    "-0.8": "#09770e",
    "-0.2": "#04800a",
    "0.2": "#558004",
    "0.4": "#556B2F",
    "1": "#7A8450",
  };

  tileImageUrl = computed(() => {
    const image = NoisyImageService.getNoiseImage(
      500,
      10,
      0.9,
      this.surfaceColorMap,
    );
    return image;
  });

  constructor() {}
}
