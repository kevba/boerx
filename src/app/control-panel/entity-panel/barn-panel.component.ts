import { Component } from "@angular/core";
import { BarnService } from "../../services/entities/barn.service";
import { BaseService } from "../../services/entities/base.service";
import { EntityUpgradesComponent } from "./entity-upgrades.component";

@Component({
  selector: "app-barn-panel",
  template: `
      <app-entity-upgrades />

  `,
    providers: [{ provide: BaseService, useExisting: BarnService }],
  
  imports: [EntityUpgradesComponent],
})
export class BarnPanelComponent {
 
}
