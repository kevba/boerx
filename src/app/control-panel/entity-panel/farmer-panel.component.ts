import { Component, computed, inject } from "@angular/core";
import { FarmerEntity, FarmerRoles } from "../../canvas/entities/FarmerEntity";
import { BaseService } from "../../services/entities/base.service";
import { FarmerService } from "../../services/entities/farmer.service";
import { SelectionService } from "../../services/selection.service";

@Component({
  selector: "app-farmer-panel",
  template: `
    <div class="flex flex-col gap-1">
      @for (option of roleOptions(); track option.role) {
        <div class="flex flex-row items-center gap-2 ">
          <input
            type="checkbox"
            [id]="option.role"
            [checked]="option.checked"
            (change)="setRole(option.role, $event.target.checked)" />
          <label [for]="option.role"> {{ option.role }}</label>
        </div>
      }
    </div>
  `,
  imports: [],
  providers: [{ provide: BaseService, useExisting: FarmerService }],
})
export class FarmerPanelComponent {
  farmerService = inject(FarmerService);
  selectionService = inject(SelectionService);

  selectedEntities = computed(() => {
    const selectedIds =
      this.selectionService.selectedPerType()[this.farmerService.entityType];
    return this.farmerService
      .entities()
      .filter((p) => selectedIds.includes(p.id));
  });

  roleOptions = computed(() => {
    const entities = this.selectedEntities() as FarmerEntity[];
    const roles = Object.values(FarmerRoles);

    const isSingleFarmer = entities.length === 1;

    return roles.map((role) => {
      return {
        role: role,
        checked: isSingleFarmer ? entities[0].roles().includes(role) : false,
      };
    });
  });

  setRole(role: FarmerRoles, checked: boolean) {
    for (const entity of this.selectedEntities() as FarmerEntity[]) {
      this.farmerService.updateRole(entity.id, role, checked);
    }
  }
}
