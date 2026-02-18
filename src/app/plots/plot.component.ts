import { NgClass } from "@angular/common";
import { Component, computed, inject, input } from "@angular/core";
import { Crop } from "../services/crop.service";
import { PlotsService } from "../services/plots.service";

@Component({
  selector: "app-plot",
  imports: [NgClass],
  template: `
    <div
      (click)="selectPlot()"
      [class]="'w-16 h-16 rounded-md border-2 relative cursor-pointer '"
      [ngClass]="{
        'border-amber-600': isSelected(),
        'border-neutral-400': !isSelected()
      }"
    >
      <div [ngClass]="color()" class="w-full h-full"></div>
    </div>
  `,
})
export class PlotComponent {
  plotService = inject(PlotsService);
  plotId = input.required<string>();

  plot = computed(() => {
    const plot = this.plotService.plots().find((p) => p.id === this.plotId())!;
    return plot;
  });
  crop = computed(() => {
    return this.plot().crop;
  });

  isSelected = computed(
    () => this.plotService.selectedPlotId() === this.plot().id
  );

  color = computed(() => {
    switch (this.crop()) {
      case Crop.Wheat:
        return "bg-yellow-400";
      case Crop.Corn:
        return "bg-yellow-600";
      case Crop.Potato:
        return "bg-orange-400";
      default:
        return "bg-green-600";
    }
  });

  selectPlot() {
    this.plotService.selectedPlotId.set(this.plot().id);
  }
}
