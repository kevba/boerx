import { Component, computed, inject } from "@angular/core";
import { EntityType } from "../models/entity";
import { SelectionService } from "../services/selection.service";
import { BarnPanelComponent } from "./entity-panel/barn-panel.component";
import { FarmerPanelComponent } from "./entity-panel/farmer-panel.component";
import { GreenhousePanelComponent } from "./entity-panel/greenhouse-panel.component";
import { PlotPanelComponent } from "./entity-panel/plot-panel.component";
import { TractorPanelComponent } from "./entity-panel/tractor-panel.component";
import { WeatherControlPanelComponent } from "./entity-panel/weather-control-panel.component";
import { MainPanelComponent } from "./main-panel.component";

@Component({
  selector: "app-context-panel",
  imports: [
    PlotPanelComponent,
    MainPanelComponent,
    TractorPanelComponent,
    BarnPanelComponent,
    WeatherControlPanelComponent,
    FarmerPanelComponent,
    GreenhousePanelComponent,
  ],

  template: `
    <div
      class="md:w-[20rem] w-full md:h-full h-[14rem] md:h-full flex flex-col ">
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
        @if (showSelectedControl()) {
          <div
            class="context-panel"
            animate.enter="slide-in-enter"
            animate.leave="slide-in-leave">
            <div class="flex flex-col h-full flex-1 ">
              <div
                class="w-full flex flex-row items-center gap-2 bg-stone-600 px-6 ">
                <button
                  class="text pl-0! pr-2!"
                  (click)="selectionService.clear()">
                  {{ "X" }}
                </button>
                <span class="text-xl md:text-2xl">{{
                  selectedEntityType()
                }}</span>
              </div>
              <div class=" h-full w-full overflow-scroll">
                @if (selectedEntityType() === EntityType.Plot) {
                  <app-plot-panel />
                } @else if (selectedEntityType() === EntityType.Tractor) {
                  <app-tractor-panel />
                } @else if (selectedEntityType() === EntityType.Barn) {
                  <app-barn-panel />
                } @else if (
                  selectedEntityType() === EntityType.WeatherControl
                ) {
                  <app-weather-control-panel />
                } @else if (selectedEntityType() === EntityType.Farmer) {
                  <app-farmer-panel />
                }
                @if (selectedEntityType() === EntityType.Greenhouse) {
                  <app-greenhouse-panel />
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .slide-in-enter {
      animation: slideInFromRight 500ms ease-out;
    }
    .slide-in-leave {
      animation: slideOutToRight 500ms ease-in;
    }

    @keyframes slideInFromRight {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }

    @keyframes slideOutToRight {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(100%);
      }
    }
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
    EntityType.WeatherControl,
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
