import { Component, computed, inject, input } from "@angular/core";
import {
  Cultivate,
  ICultivate,
} from "../../canvas/entities/abilities/cultivate";
import { BaseService } from "../../services/entities/base.service";
import { Crop, CropService } from "../../services/items/crop.service";
import { SelectionService } from "../../services/selection.service";
import { BuyTileComponent } from "../buy-tile.component";

@Component({
  selector: "app-entity-plant",
  template: `
    <div class="buy-tile-group">
      @for (option of cropOptions(); track option.crop) {
        <app-buy-tile
          [image]="cropService.images[option.crop]"
          [text]="option.crop"
          [cost]="option.plantConst"
          [disabled]="option.disabled"
          (buyClick)="plantCrop(option.crop)"></app-buy-tile>
      }
    </div>
  `,
  imports: [BuyTileComponent],
})
export class EntityPlantComponent {
  private selectionService = inject(SelectionService);
  cropService = inject(CropService);
  service = input.required<BaseService<any, any>>();

  crops = computed(() => {
    const service = this.service();
    if ("supportedCrops" in service) {
      return service.supportedCrops as Crop[];
    }
    return [];
  });

  plantableEntities = computed<ICultivate[]>(() => {
    const selectedIds =
      this.selectionService.selectedPerType()[this.service().entityType];

    const service = this.service();
    return service
      .entities()
      .filter((p) => selectedIds.includes(p.id))
      .filter((e): e is ICultivate => {
        return "cultivate" in e && e.cultivate instanceof Cultivate;
      });
  });

  cropOptions = computed(() => {
    const plantConst = this.cropService.plantCost();
    const entities = this.plantableEntities();

    return this.crops().map((crop) => {
      const plotsWithoutCrop = entities.filter(
        (p) => p?.cultivate?.crop() !== crop,
      ).length;
      return {
        crop: crop,
        disabled: plotsWithoutCrop === 0,
        plantConst: plantConst[crop] * (plotsWithoutCrop || 1),
      };
    });
  });

  plantCrop(crop: Crop) {
    const entities = this.plantableEntities();
    const service = this.service();
    if ("plantOn" in service && typeof service.plantOn === "function") {
      service.plantOn(
        entities.map((e) => e.id),
        crop,
      );
    }
  }
}
