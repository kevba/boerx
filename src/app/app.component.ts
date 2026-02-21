import { Component, computed, inject } from "@angular/core";
import { CanvasComponent } from "./canvas/canvas.component";
import { PlotControlComponent } from "./plots/plot-control.component";
import { IncomeService } from "./services/income.service";
import { MachineService } from "./services/machine.service";
import { PlotsService } from "./services/plots.service";
import { SelectionService } from "./services/selection.service";
import { StashService } from "./services/stash.service";
import { DatabarComponent } from "./topbar/databar.component";

@Component({
  selector: "app-root",
  imports: [
    PlotControlComponent,
    PlotControlComponent,
    DatabarComponent,
    CanvasComponent,
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
            <app-canvas />
            <!-- <app-plots /> -->
          </div>
        </div>
      </div>
      <div class="h-[10rem] bg-neutral-300 ">
        <div class="flex flex-row gap-4 p-4 h-full">
          <!-- controls -->
          <div class="flex flex-col h-full gap-2">
            <h2 class="text-lg font-bold ">Buy</h2>

            <div class="flex flex-col gap-4 h-full">
              <button
                (click)="plotService.addPlot()"
                [disabled]="!canBuyPlot()"
              >
                Plot (-{{ plotService.plotCost() }}
                {{ stashService.stashUnit }})
              </button>
            </div>
            <div class="flex flex-col gap-4 h-full">
              <button
                (click)="machineService.addMachine()"
                [disabled]="!canBuyMachine()"
              >
                Machine (-{{ machineService.machineCost() }}
                {{ stashService.stashUnit }})
              </button>
            </div>
          </div>
          <div class="border-l-2 border-neutral-400"></div>
          @if (showPlotControl()) {
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
  machineService = inject(MachineService);
  stashService = inject(StashService);

  selectionService = inject(SelectionService);
  showPlotControl = computed(
    () => this.selectionService.selectedPlots().length > 0
  );

  canBuyPlot = computed(() => {
    const cost = this.plotService.plotCost();
    const stash = this.stashService.stash();
    return stash >= cost;
  });

  canBuyMachine = computed(() => {
    const cost = this.machineService.machineCost();
    const stash = this.stashService.stash();
    return stash >= cost;
  });
}
