import { Component, computed, inject, signal } from "@angular/core";
import { CheatsService } from "../services/cheats.service";
import { CheatsPanelComponent } from "./cheats-panel.component";
import { ShopPanelComponent } from "./shop-panel.component";
import { StoragePanelComponent } from "./storage-panel.component";

@Component({
  selector: "app-main-panel",
  imports: [ShopPanelComponent, StoragePanelComponent, CheatsPanelComponent],
  template: `
    <div class="p-2 md:p-4 flex flex-col h-full">
      <div
        class="w-full text-2xl flex flex-row items-center justify-between gap-4">
        <button class="text pl-2!" (click)="previousMenu()">{{ "<" }}</button>
        <h1 class="text-2xl font-bold text-center ">
          {{ selectedMenu().text }}
        </h1>
        <button class="text pr-2!" (click)="nextMenu()">{{ ">" }}</button>
      </div>

      <div
        class="flex flex-col gap-4 pt-1 md:pt-4 items-center h-full w-full md:overflow-y-auto overflow-y-scroll">
        @switch (selectedMenu().type) {
          @case (PanelType.Shop) {
            <app-shop-panel class="w-full h-full" />
          }
          @case (PanelType.Storage) {
            <app-storage-panel class="w-full h-full" />
          }
          @case (PanelType.Cheats) {
            <app-cheats-panel class="w-full h-full" />
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
  private cheatsService = inject(CheatsService);

  PanelType = PanelType;

  selectedMenuIndex = signal(0);
  selectedMenu = computed(() => {
    const selected = this.menuItems()?.[this.selectedMenuIndex()];
    return selected || this.menuItems()[0];
  });

  menuItems = computed(() => {
    let items = Object.keys(PanelType).map((key) => {
      return {
        type: key,
        text: PanelType[key as keyof typeof PanelType],
      };
    });

    items = items.filter(
      (item) => this.cheatsService.unlocked() || item.type !== PanelType.Cheats,
    );
    return items;
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
  Storage = "Storage",
  Stats = "Stats",
  Cheats = "Cheats",
}
