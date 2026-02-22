import { Component, computed, inject } from "@angular/core";
import { SelectionService } from "../services/selection.service";
import { BarnPanelComponent } from "./entity-panel/barn-panel.component";
import { PlotPanelComponent } from "./entity-panel/plot-panel.component";
import { TractorPanelComponent } from "./entity-panel/tractor-panel.component";
import { MainPanelComponent } from "./main-panel.component";

@Component({
  selector: "app-control-panel",
  imports: [
    PlotPanelComponent,
    MainPanelComponent,
    TractorPanelComponent,
    BarnPanelComponent,
  ],

  template: `
    <div class="w-[20rem] flex flex-col h-full bg-stone-500 ">
      <div class="relative w-full h-full flex-1 ">
        <app-main-panel
          class="absolute top-0 left-0 w-full h-full border-l-8 border-stone-600" />
        @if (showSelectedControl()) {
          <div
            class="absolute top-0 left-0 w-full h-full bg-stone-500 border-l-8 border-stone-600"
            animate.enter="slide-in-enter"
            animate.leave="slide-in-leave">
            <div class="flex flex-col h-full w-full">
              <div class="w-full flex flex-row items-center gap-4 px-4 pt-4">
                <button class="text " (click)="selectionService.clear()">
                  {{ "<" }}
                </button>
                <span class="text-2xl">Upgrades</span>
              </div>
              <div class=" h-full w-full overflow-scroll">
                @if (showPlotControl()) {
                  <app-plot-panel />
                } @else if (showTractorControl()) {
                  <app-tractor-panel />
                } @else if (showBarnControl()) {
                  <app-barn-panel />
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
export class ControlPanelComponent {
  selectionService = inject(SelectionService);

  showSelectedControl = computed(
    () => this.selectionService.selected().length > 0,
  );

  showPlotControl = computed(
    () => this.selectionService.selectedPlots().length > 0,
  );

  showTractorControl = computed(
    () => this.selectionService.selectedTractors().length > 0,
  );

  showBarnControl = computed(
    () => this.selectionService.selectedBarns().length > 0,
  );
}
