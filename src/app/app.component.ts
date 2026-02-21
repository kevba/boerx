import { NgClass } from "@angular/common";
import { Component, inject } from "@angular/core";
import { CanvasComponent } from "./canvas/canvas.component";
import { ControlPanelComponent } from "./control-panel/control-panel.component";
import { CheatsService } from "./services/cheats.service";
import { IncomeService } from "./services/income.service";
import { DatabarComponent } from "./topbar/databar.component";

@Component({
  selector: "app-root",
  imports: [ControlPanelComponent, DatabarComponent, CanvasComponent, NgClass],
  template: `
    <div class="flex flex-col w-full h-screen">
      <div
        class="h-[5rem] bg-gradient-to-r from-amber-800 via-lime-800 to-green-800 flex items-center ">
        <h1
          class="text-5xl font-bold  pl-4 select-none transistion-colors duration-500"
          [ngClass]="
            cheatsService.unlocked() ? 'text-amber-600' : 'text-green-600'
          "
          (click)="cheatsService.unlock()">
          BoerX
        </h1>
      </div>
      <div class="h-[3rem] p-2 bg-stone-600 border-stone-600 flex items-center">
        <app-databar class="flex-1" />
      </div>
      <div class="flex-1 flex no-wrap h-full w-full">
        <app-canvas class="flex-1 content-baseline" />
        <app-control-panel />
      </div>
      <div class="h-[3rem] bg-stone-600 ">
        <div class="flex flex-row gap-4 p-4 h-full">
          <!-- controls -->
        </div>
      </div>
    </div>
  `,
})
export class AppComponent {
  // Injecting the service to make sure it is initialized and running
  _incomeService = inject(IncomeService);

  cheatsService = inject(CheatsService);
}
