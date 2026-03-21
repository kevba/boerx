import { Injectable } from "@angular/core";
import {
  GreenhouseEntity,
  GreenhouseUpgrade,
} from "../../canvas/entities/GreenHouseEntity";
import { EntityType } from "../../models/entity";
import { Crop } from "../items/crop.service";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: "root",
})
export class GreenhouseService extends BaseService<
  GreenhouseUpgrade,
  GreenhouseEntity
> {
  override entityType = EntityType.Greenhouse;
  protected baseCost = 6000;
  supportedCrops = [
    Crop.Wheat,
    Crop.Corn,
    Crop.Potato,
    Crop.Strawberry,
    Crop.Tomato,
  ];

  upgrades = {};

  constructor() {
    super();
    this.init();
  }

  createNew(coords: { x: number; y: number }): GreenhouseEntity {
    return new GreenhouseEntity(coords, this.entityLayerService.bottomLayer);
  }

  plantOn(ids: string[], crop: Crop) {
    for (const id of ids) {
      this.plant(id, crop);
    }
  }

  plant(plotId: string, crop: Crop) {
    this.entitiesService.entities.update((greenhouses) => {
      const greenhouseIndex = greenhouses.findIndex(
        (greenhouse) => greenhouse.id === plotId,
      );
      if (greenhouseIndex === -1) return greenhouses;

      (greenhouses[greenhouseIndex] as GreenhouseEntity).cultivate.plant(crop);

      return greenhouses;
    });
  }
}
