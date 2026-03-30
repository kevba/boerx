import { Component, computed, inject } from "@angular/core";
import { EntityType } from "../models/entity";
import { SelectionService } from "../services/selection.service";
import { EntityPanelComponent } from "./entity-panel/entity-panel.component";
import { MainPanelComponent } from "./main-panel.component";

@Component({
  selector: "app-context-panel",
  imports: [MainPanelComponent, EntityPanelComponent],

  template: `
    <div class="md:w-[20rem] w-full md:h-full h-[14rem]  flex flex-col ">
      <div class="relative w-full flex-1">
        <div class="context-panel">
          <div class="flex flex-col h-full flex-1 ">
            <div
              class="w-full flex flex-row items-center gap-2 bg-stone-600 px-6 py-2">
              <span class="text-xl md:text-2xl">{{ "Control" }}</span>
            </div>
            <div class=" h-full w-full overflow-scroll">
              <app-main-panel />
            </div>
          </div>
        </div>
        <app-entity-panel />
      </div>
    </div>
  `,
})
export class ContextPanelComponent {
  selectionService = inject(SelectionService);
  EntityType = EntityType;

  private entityWithPanel = [
    EntityType.Plot,
    EntityType.Barn,
    EntityType.Tractor,
    EntityType.Market,
    EntityType.Farmer,
    EntityType.Altar,
    EntityType.Greenhouse,
  ];

  showSelectedControl = computed(
    () =>
      this.selectionService.selected().filter((s) => {
        return this.entityWithPanel.includes(s.type);
      }).length > 0,
  );

  selectedEntityType = computed(
    () => this.selectionService.selected()[0]?.type,
  );
}
