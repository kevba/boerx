import { Component, computed, inject } from "@angular/core";
import { SelectionService } from "../services/selection.service";
import { BuyPanelComponent } from "./buy-panel.component";
import { PlotPanelComponent } from "./plot-panel.component";

@Component({
  selector: "app-control-panel",
  imports: [PlotPanelComponent, BuyPanelComponent],
  template: `
    <div class="flex flex-col gap-4 p-4">
      <h2>Control Panel</h2>

      <app-buy-panel />
      @if (showPlotControl()) {
      <app-plot-panel />
      }
    </div>
  `,
})
export class ControlPanelComponent {
  selectionService = inject(SelectionService);
  showPlotControl = computed(
    () => this.selectionService.selectedPlots().length > 0
  );
}
