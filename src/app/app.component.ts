import { NgClass } from "@angular/common";
import { Component, inject } from "@angular/core";
import { CanvasComponent } from "./canvas/canvas.component";
import { ContextPanelComponent } from "./control-panel/context-panel.component";
import { FinancialBarComponent } from "./databars/financial-bar.component";
import { CheatsService } from "./services/cheats.service";
import { InitService } from "./services/init.service";

@Component({
  selector: "app-root",
  imports: [
    ContextPanelComponent,
    FinancialBarComponent,
    CanvasComponent,
    NgClass,
  ],
  template: `
    <div class="flex flex-col w-full h-dvh">
      <div
        class="md:h-[5rem] h-[3rem]  bg-gradient-to-r from-amber-800 via-lime-800 to-green-800 flex items-center ">
        <h1
          class="md:text-5xl text-4xl font-bold  pl-4 select-none transistion-colors duration-500"
          [ngClass]="
            cheatsService.unlocked() ? 'text-amber-600' : 'text-green-600'
          "
          (click)="cheatsService.unlock()">
          BoerX
        </h1>
      </div>
      <div
        class="md:h-[3rem] h-[2rem] p-2 bg-stone-600 border-stone-600 flex items-center md:border-b-6 md:border-stone-700">
        <app-financial-bar class="flex-1" />
      </div>
      <div class="flex-1 flex no-wrap h-full w-full md:flex-row flex-col">
        <app-canvas
          class="flex-grow-1 flex-shrink-0 md:flex-1 content-baseline" />
        <app-context-panel class="md:flex-0" />
      </div>
      <div class="h-[3rem] bg-stone-600 hidden md:visible">
        <div class="flex flex-row gap-4 p-4 h-full"></div>
      </div>
    </div>
  `,
})
export class AppComponent {
  cheatsService = inject(CheatsService);
  initService = inject(InitService);

  ngOnInit() {
    this.initService.init();
  }
}
