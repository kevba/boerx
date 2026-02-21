import { NgClass } from "@angular/common";
import { Component, computed, inject, input, output } from "@angular/core";
import { StashService } from "../services/stash.service";

@Component({
  selector: "app-buy-tile",
  imports: [NgClass],
  template: `
    <div
      class="h-[8rem] w-[8rem] border-2 border-zinc-300 bg-zinc-700 rounded-md select-none flex flex-col items-center transition-colors duration-200"
      [ngClass]="classes()"
      (click)="buyClick.emit()">
      <img [src]="image()" class="flex-1" />
      <span class="text-sm">{{ text() }}</span>
      <span class="text-sm">{{ costText() }}</span>
    </div>
  `,
  standalone: true,
})
export class BuyTileComponent {
  private stashService = inject(StashService);

  classes = computed(() => {
    const canBuy = this.canBuy();
    if (!canBuy) {
      return "border-zinc-500 text-zinc-500 ";
    }

    return "border-green-600 hover:border-green-500 hover:text-green-100 cursor-pointer";
  });

  image = input.required<string>();
  text = input.required<string>();
  cost = input.required<number>();
  disabled = input<boolean>(false);

  buyClick = output();

  costText = computed(() => {
    return `${this.cost()}${this.stashService.stashUnit}`;
  });

  canBuy = computed(() => {
    return this.stashService.stash() >= this.cost() && !this.disabled();
  });
}
