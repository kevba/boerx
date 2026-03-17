import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-market-panel",
  imports: [FormsModule],
  host: {
    class: "w-full",
  },
  template: ` <div class="flex flex-col flex-wrap gap-4 w-full"></div> `,
})
export class MarketPanelComponent {}
