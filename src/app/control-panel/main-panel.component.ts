import { Component, computed, inject } from "@angular/core";
import { CheatsService } from "../services/cheats.service";
import { CheatsPanelComponent } from "./cheats-panel.component";
import { PanelMenuNavComponent } from "./menu-nav.component";
import { ShopPanelComponent } from "./shop-panel.component";

@Component({
  selector: "app-main-panel",
  imports: [ShopPanelComponent, CheatsPanelComponent, PanelMenuNavComponent],
  template: `
    <app-panel-menu-nav [menuOptions]="menuOptions()">
      <ng-template #panelContent let-menu>
        @switch (menu.type) {
          @case (PanelType.Shop) {
            <app-shop-panel class="w-full h-full" />
          }
          @case (PanelType.Cheats) {
            <app-cheats-panel class="w-full h-full" />
          }
          @default {
            <div>Select an option</div>
          }
        }
      </ng-template>
    </app-panel-menu-nav>
  `,
})
export class MainPanelComponent {
  private cheatsService = inject(CheatsService);
  PanelType = PanelType;
  menuOptions = computed(() => {
    let items = Object.keys(PanelType).filter(
      (item) => this.cheatsService.unlocked() || item !== PanelType.Cheats,
    );

    return items;
  });
}

enum PanelType {
  Shop = "Shop",
  Stats = "Stats",
  Cheats = "Cheats",
}
