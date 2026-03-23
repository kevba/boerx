import { Component, computed } from "@angular/core";
import { BarnService } from "../../services/entities/barn.service";
import { BaseService } from "../../services/entities/base.service";
import { PanelMenuNavComponent } from "../menu-nav.component";
import { EntityUpgradesComponent } from "./entity-upgrades.component";

@Component({
  selector: "app-barn-panel",
  template: `
    <app-panel-menu-nav [menuOptions]="menuOptions()">
      <ng-template #panelContent let-menu>
        @switch (menu.type) {
          @case ("Upgrades") {
            <app-entity-upgrades />
          }
          @default {
            <div>Select an option</div>
          }
        }
      </ng-template>
    </app-panel-menu-nav>
  `,
  providers: [{ provide: BaseService, useExisting: BarnService }],

  imports: [EntityUpgradesComponent, PanelMenuNavComponent],
})
export class BarnPanelComponent {
  menuOptions = computed(() => ["Upgrades", "Storage"]);
}
