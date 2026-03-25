import { Component, computed, inject, input } from "@angular/core";
import {
  Cultivate,
  ICultivate,
} from "../../canvas/entities/abilities/cultivate";
import { ProgressBarComponent } from "../../components/progressBar.component";
import { BaseService } from "../../services/entities/base.service";
import { CropService } from "../../services/items/crop.service";
import { SelectionService } from "../../services/selection.service";

@Component({
  selector: "app-entity-crop-status",
  template: `
    <div class="grid grid-cols-2 gap-2">
      @for (option of growthStatus(); track option.id) {
        <span class="text-sm">{{ option.crop }}</span>
        <app-progress-bar
          [progress]="option.progress"
          [max]="100"></app-progress-bar>
      }
    </div>
  `,
  imports: [ProgressBarComponent],
})
export class EntityCropStatusComponent {
  private selectionService = inject(SelectionService);
  cropService = inject(CropService);
  service = input.required<BaseService<any, any>>();

  cultivationEntities = computed<ICultivate[]>(() => {
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

  growthStatus = computed(() => {
    const entities = this.cultivationEntities();

    return entities.map((entity) => {
      return {
        id: entity.id,
        crop: entity.cultivate.crop(),
        progress: entity.cultivate.cropGrowthStageFraction() * 100,
      };
    });
  });
}
