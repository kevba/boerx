import { Component, inject } from "@angular/core";
import { PlotControlComponent } from "./plots/plot-control.component";
import { PlotsComponent } from "./plots/plots.component";
import { IncomeService } from "./services/income.service";
import { PlotsService } from "./services/plots.service";
import { StashService } from "./services/stash.service";
import { DatabarComponent } from "./topbar/databar.component";

@Component({
  selector: "app-root",
  imports: [
    PlotsComponent,
    PlotControlComponent,
    PlotControlComponent,
    DatabarComponent,
  ],
  template: `
    <div class="flex flex-col w-full h-screen">
      <div
        class="h-[5rem] bg-gradient-to-r from-amber-800 via-lime-800 to-green-800 flex items-center "
      >
        <h1 class="text-3xl  font-bold  pl-4 text-green-600">BoerX</h1>
      </div>
      <div class="p-2 bg-neutral-300"><app-databar /></div>
      <div class="flex-1 bg-green-500 h-full">
        <div class="flex no-wrap p-8 h-full w-full">
          <!-- plots -->
          <div class="w-[60%] content-baseline">
            <app-plots />
          </div>
        </div>
      </div>
      <div class="h-[10rem] bg-neutral-300 ">
        <div class="flex flex-row gap-4 p-4 h-full">
          <!-- controls -->
          <div class="flex flex-col h-full gap-2">
            <h2 class="text-lg font-bold ">Buy</h2>

            <div class="flex flex-col gap-4 h-full">
              <button (click)="plotService.addPlot()">
                Add Plot (-{{ plotService.plotCost() }}
                {{ stashService.stashUnit }})
              </button>
            </div>
          </div>
          <div class="border-l-2 border-neutral-400"></div>
          @if (plotService.selectedPlotId()) {
          <app-plot-control />
          }
        </div>
      </div>
    </div>
  `,
})
export class AppComponent {
  // Injecting the service to make sure it is initialized and running
  _incomeService = inject(IncomeService);

  plotService = inject(PlotsService);
  stashService = inject(StashService);
}
