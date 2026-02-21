import { Component, computed, signal } from "@angular/core";
import { ShopPanelComponent } from "./shop-panel.component";

@Component({
  selector: "app-main-panel",
  imports: [ShopPanelComponent],
  template: `
    <div class="p-4 flex flex-col h-full">
      <div
        class="w-full text-2xl flex flex-row items-center justify-between gap-4">
        <button class="text" (click)="previousMenu()">{{ "<" }}</button>
        <h1 class="text-2xl font-bold text-center ">
          {{ selectedMenu().text }}
        </h1>
        <button class="text" (click)="nextMenu()">{{ ">" }}</button>
      </div>

      <div class="flex flex-col gap-4 pt-4 items-center">
        @switch (selectedMenu().type) {
          @case (PanelType.Shop) {
            <app-shop-panel />
          }
          @default {
            <div>Select an option</div>
          }
        }
      </div>
    </div>
  `,
})
export class MainPanelComponent {
  PanelType = PanelType;

  selectedMenuIndex = signal(0);
  selectedMenu = computed(() => this.menuItems()[this.selectedMenuIndex()]);

  menuItems = computed(() => {
    return Object.keys(PanelType).map((key) => {
      return {
        type: key,
        text: PanelType[key as keyof typeof PanelType],
      };
    });
  });

  nextMenu() {
    let nextIndex = this.selectedMenuIndex() + 1;
    if (nextIndex >= this.menuItems().length) {
      nextIndex = 0;
    }
    this.selectedMenuIndex.set(nextIndex);
  }

  previousMenu() {
    let prevIndex = this.selectedMenuIndex() - 1;
    if (prevIndex < 0) {
      prevIndex = this.menuItems().length - 1;
    }

    this.selectedMenuIndex.set(prevIndex);
  }
}

enum PanelType {
  Shop = "Shop",
  Stats = "Stats",
}
