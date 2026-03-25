import { Component, inject } from "@angular/core";
import { BuyTileComponent } from "../../components/buy-tile.component";
import { SeasonTypes, WeatherService } from "../../services/weather.service";

@Component({
  selector: "app-season-control-panel",
  imports: [BuyTileComponent],
  host: {
    class: "w-full",
  },
  template: `
    <div class="buy-tile-group">
      @for (season of seasonTypes; track season) {
        <app-buy-tile
          image=""
          [text]="season"
          [cost]="0"
          (buyClick)="setSeason(season)"></app-buy-tile>
      }
    </div>
  `,
})
export class SeasonControlPanelComponent {
  private weatherService = inject(WeatherService);

  seasonTypes = Object.values(SeasonTypes);
  setSeason(season: SeasonTypes) {
    this.weatherService.setSeason(season);
  }
}
