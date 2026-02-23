import { Component } from "@angular/core";
import { BaseService } from "../../services/entities/base.service";
import {
  TractorService
} from "../../services/entities/tractor.service";
import { EntityUpgradesComponent } from "./entity-upgrades.component";

@Component({
  selector: "app-tractor-panel",
  template: `
      <app-entity-upgrades />
  `,
  imports: [EntityUpgradesComponent],
  providers: [{ provide: BaseService, useExisting: TractorService }]
})
export class TractorPanelComponent {
 
}
