import { NgClass } from "@angular/common";
import { Component, computed, input } from "@angular/core";

@Component({
  selector: "app-progress-bar",
  template: ` <div
    class="w-full flex flex-row rounded border-3 border-zinc-800 ">
    @for (segment of segments(); track segment.id) {
      <div
        class="w-[1rem] h-[0.75rem] "
        [ngClass]="segment.filled ? colorClass() : 'bg-zinc-700'"></div>
      @if (!$last) {
        <div class=" border-l-2 border-zinc-800"></div>
      }
    }
  </div>`,
  imports: [NgClass],
})
export class ProgressBarComponent {
  progress = input.required<number>();
  max = input.required<number>();
  colorClass = input<string>("bg-green-500");

  segments = computed<Segment[]>(() => {
    const totalSegments = 10;

    const water = this.progress();
    const filledSegments = Math.ceil(water / (this.max() / totalSegments));

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
