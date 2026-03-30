import { Component, computed, inject, input } from "@angular/core";
import {
  GeneratePower,
  IGeneratePower,
} from "../../canvas/entities/abilities/generatePower";
import { BaseService } from "../../services/entities/base.service";
import { SelectionService } from "../../services/selection.service";

@Component({
  selector: "app-entity-generate-power",
  template: `
    <div class="grid grid-cols-2 gap-2 w-full">
      <span class="text-lg">{{ "TOTAL" }}</span>
      <span>{{ total() }} KWh</span>
      <div class="col-span-2"></div>
      @for (item of generatingEntities(); track item.id) {
        <div class="col-span-1">
          <div class="text">{{ item.type }}</div>
        </div>
        <div class="col-span-1">
          <div class="text">{{ item.power }} KWh</div>
        </div>
      }
    </div>
  `,
})
export class EntityGeneratePowerComponent {
  private selectionService = inject(SelectionService);
  service = input.required<BaseService<any, any>>();

  generatorEntities = computed<IGeneratePower[]>(() => {
    const selectedIds =
      this.selectionService.selectedPerType()[this.service().entityType];

    const service = this.service();
    return service
      .entities()
      .filter((p) => selectedIds.includes(p.id))
      .filter((e): e is IGeneratePower => {
        return "generatePower" in e && e.generatePower instanceof GeneratePower;
      });
  });

  generatingEntities = computed(() => {
    const entities = this.generatorEntities();

    return entities.map((e) => ({
      id: e.id,
      type: e.type,
      power: e.generatePower.generatedPower(),
    }));
  });

  total = computed(() => {
    return this.generatingEntities().reduce((sum, e) => sum + e.power, 0);
  });
}
