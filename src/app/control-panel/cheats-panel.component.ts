import { Component, inject } from "@angular/core";
import { BuyTileComponent } from "../components/buy-tile.component";
import { PlotService } from "../services/entities/plots.service";
import { TractorService } from "../services/entities/tractor.service";
import { InitService } from "../services/init.service";
import { StashService } from "../services/stash.service";
import { WeatherService, WeatherTypes } from "../services/weather.service";

@Component({
  selector: "app-cheats-panel",
  imports: [BuyTileComponent],
  template: `
    <div class="buy-tile-group">
      <app-buy-tile
        image=""
        text="money!"
        [cost]="-100000"
        (buyClick)="addMoney()"></app-buy-tile>
      <app-buy-tile
        image=""
        text="reset save"
        [cost]="0"
        (buyClick)="resetSave()"></app-buy-tile>
    </div>
  `,
})
export class CheatsPanelComponent {
  plotService = inject(PlotService);
  tractorService = inject(TractorService);
  stashService = inject(StashService);
  weatherService = inject(WeatherService);
  initService = inject(InitService);

  weatherTypes = Object.values(WeatherTypes);

  addMoney() {
    this.stashService.addStash(100000);
  }

  resetSave() {
    localStorage.removeItem("gameState");
    window.location.reload();
  }

  setWeather(weather: WeatherTypes) {
    this.weatherService.setWeather(weather);
  }
}
