import { NgClass } from "@angular/common";
import { Component, computed, inject } from "@angular/core";
import { PlotsService } from "../services/entities/plots.service";
import { NutrientsService } from "../services/nutrients.service";
import { StashService } from "../services/stash.service";

@Component({
  selector: "app-nutrients-bar",
  template: `
    <div class="flex flex-row gap-8 w-full">
      @if (showWaterBar()) {
        <div
          animate.enter="shake-enter"
          class="flex flex-row gap-2 items-center flex-1">
          <div [ngClass]="waterStatusClass()">water:</div>
          <div class="w-full flex flex-row rounded border-3 border-zinc-800 ">
            @for (segment of waterBarSegments(); track segment.id) {
              <div
                class="w-[1rem] h-[0.75rem] "
                [ngClass]="
                  segment.filled
                    ? 'bg-[linear-gradient(160deg,#1447e6_45%,#193cb8_55%)]'
                    : 'bg-zinc-700'
                "></div>
              @if (!$last) {
                <div class=" border-l-2 border-zinc-800"></div>
              }
            }
          </div>
        </div>
      }
      @if (showFertilizerBar()) {
        <div
          animate.enter="shake-enter"
          class="flex flex-row gap-2 items-center flex-1">
          <div [ngClass]="fertilizerStatusClass()">fertilizer:</div>
          <div class="w-full flex flex-row rounded border-3 border-zinc-800 ">
            @for (segment of fertilizerBarSegments(); track segment.id) {
              <div
                class="w-[1rem] h-[0.75rem] "
                [ngClass]="
                  segment.filled
                    ? 'bg-[linear-gradient(160deg,#a65f00_45%,#497d00_55%)]'
                    : 'bg-zinc-700'
                "></div>
              @if (!$last) {
                <div class=" border-l-2 border-zinc-800"></div>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .shake-enter {
      animation: shake 500ms ease-in-out;
    }

    @keyframes shake {
      0% {
        transform: translateX(0, 2px);
      }
      25% {
        transform: translate(0, -2px);
      }
      50% {
        transform: translate(0, 2px);
      }
      75% {
        transform: translate(0, -2px);
      }
      100% {
        transform: translate(0, 0);
      }
    }
  `,
  imports: [NgClass],
})
export class NutrientsBarComponent {
  stashService = inject(StashService);
  plotsService = inject(PlotsService);
  nutrientsService = inject(NutrientsService);

  showWaterBar = computed(() => this.plotsService.hasMoistureUpgrade());
  showFertilizerBar = computed(() => this.plotsService.hasSoilUpgrade());

  waterStatusClass = computed(() => {
    const waterRatio =
      this.nutrientsService.water() / this.nutrientsService.maxWater();
    if (waterRatio <= 0) return "text-red-500";
    if (waterRatio < 0.3) return "text-orange-500 ";

    return "text-color";
  });

  fertilizerStatusClass = computed(() => {
    const fertilizerRatio =
      this.nutrientsService.fertilizer() /
      this.nutrientsService.maxFertilizer();
    if (fertilizerRatio <= 0) return "text-red-500 ";
    if (fertilizerRatio < 0.3) return "text-orange-500 ";
    return "text-color";
  });

  waterBarSegments = computed<Segment[]>(() => {
    const totalSegments = 10;

    const water = this.nutrientsService.water();
    const filledSegments = Math.ceil(
      water / (this.nutrientsService.maxWater() / totalSegments),
    );

    const segments: Segment[] = [];
    for (let i = 0; i < totalSegments; i++) {
      const filled = i < filledSegments;
      segments.push({
        id: i,
        filled: filled,
      });
    }

    return segments;
  });

  fertilizerBarSegments = computed<Segment[]>(() => {
    const totalSegments = 10;

    const fertilizer = this.nutrientsService.fertilizer();
    const filledSegments = Math.ceil(
      fertilizer / (this.nutrientsService.maxFertilizer() / totalSegments),
    );

    const segments: Segment[] = [];
    for (let i = 0; i < totalSegments; i++) {
      const filled = i < filledSegments;
      segments.push({
        id: i,
        filled: filled,
      });
    }

    return segments;
  });
}

type Segment = {
  filled: boolean;
  id: number;
};
