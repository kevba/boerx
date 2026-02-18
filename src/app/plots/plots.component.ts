import { Component, inject } from "@angular/core";
import { PlotsService } from "../services/plots.service";
import { PlotComponent } from "./plot.component";

@Component({
  selector: "app-plots",
  imports: [PlotComponent],
  template: `
    <div class="flex  flex-wrap gap-4">
      @for (plot of plotService.plots(); track plot.id) {
      <app-plot [plotId]="plot.id"></app-plot>
      }
    </div>
  `,
})
export class PlotsComponent {
  plotService = inject(PlotsService);
}
