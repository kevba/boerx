import { Component, inject, input } from "@angular/core";
import { BaseService } from "../../services/entities/base.service";
import { SelectionService } from "../../services/selection.service";
import { BuyTileComponent } from "../buy-tile.component";

@Component({
  selector: "app-entity-upgrades",
  template: ``,
  imports: [BuyTileComponent],
})
export class EntityUpgradesComponent {
  selectionService = inject(SelectionService);
  service = input.required<BaseService<any, any>>();
}
