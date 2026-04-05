import { Component, computed, inject, Injector } from "@angular/core";
import { CropStock } from "../../canvas/entities/abilities/cropStock";
import { Cultivate } from "../../canvas/entities/abilities/cultivate";
import { Forecast } from "../../canvas/entities/abilities/forecast";
import { GeneratePower } from "../../canvas/entities/abilities/generatePower";
import { EntityType } from "../../models/entity";
import { EntityService } from "../../models/serviceMap";
import { SelectionService } from "../../services/selection.service";
import { PanelMenuNavComponent } from "../menu-nav.component";
import { EntityCropStatusComponent } from "./entity-crop-status.component";
import { EntityCropStockComponent } from "./entity-cropStock.component";
import { EntityGeneratePowerComponent } from "./entity-generate-power.component";
import { EntityPlantComponent } from "./entity-plant.component";
import { EntityUpgradesComponent } from "./entity-upgrades.component";
import { EntityWeatherForecastComponent } from "./entity-weather-forecast.component";
import { SeasonControlPanelComponent } from "./season-control-panel.component";
import { WeatherControlPanelComponent } from "./weather-control-panel.component";

@Component({
  selector: "app-entity-panel",
  template: `
    @let service = entityService();
    @let options = menuOptions();
    @if (panelEnabled() && service && options) {
      <div
        class="context-panel"
        animate.enter="slide-in-enter"
        animate.leave="slide-in-leave">
        <div class="flex flex-col h-full flex-1 ">
          <div class="w-full flex flex-row items-center bg-stone-600 px-4 ">
            <button class="text pl-0! pr-2!" (click)="selectionService.clear()">
              {{ "X" }}
            </button>
            <span class="text-xl md:text-2xl"
              >{{ selectedEntityType()
              }}{{
                selectedCount() > 1 ? "(" + selectedCount() + ")" : ""
              }}</span
            >
            @if (canBeSold() && selectedCount() === 1) {
              <button
                class="text p-0! text-xl! ml-auto text-green-600"
                (click)="sellEntity()">
                {{ "SELL" }}
              </button>
            }
          </div>
          <div class=" h-full w-full overflow-scroll">
            <app-panel-menu-nav [menuOptions]="options">
              <ng-template #panelContent let-menu>
                @switch (menu.type) {
                  @case (PanelType.Upgrade) {
                    <app-entity-upgrades
                      [service]="service"></app-entity-upgrades>
                  }
                  @case (PanelType.Plant) {
                    <app-entity-plant [service]="service" />
                  }
                  @case (PanelType.CropStatus) {
                    <app-entity-crop-status [service]="service" />
                  }
                  @case (PanelType.CropStock) {
                    <app-entity-crop-stock [service]="service" />
                  }
                  @case (PanelType.WeatherControl) {
                    <app-weather-control-panel></app-weather-control-panel>
                  }
                  @case (PanelType.SeasonControl) {
                    <app-season-control-panel></app-season-control-panel>
                  }
                  @case (PanelType.WeatherForecast) {
                    <app-entity-weather-forecast></app-entity-weather-forecast>
                  }
                  @case (PanelType.PowerGeneration) {
                    <app-entity-generate-power
                      [service]="service"></app-entity-generate-power>
                  }
                  @default {
                    <div>Select an option</div>
                  }
                }
              </ng-template>
            </app-panel-menu-nav>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .slide-in-enter {
      animation: slideInFromRight 500ms ease-out;
    }
    .slide-in-leave {
      animation: slideOutToRight 500ms ease-in;
    }

    @keyframes slideInFromRight {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }

    @keyframes slideOutToRight {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(100%);
      }
    }
  `,
  imports: [
    PanelMenuNavComponent,
    EntityUpgradesComponent,
    EntityPlantComponent,
    WeatherControlPanelComponent,
    SeasonControlPanelComponent,
    EntityCropStockComponent,
    EntityCropStatusComponent,
    EntityWeatherForecastComponent,
    EntityGeneratePowerComponent,
  ],
})
export class EntityPanelComponent {
  private injector = inject(Injector);
  selectionService = inject(SelectionService);

  PanelType = PanelType;

  selectedEntityType = computed(
    () => this.selectionService.selected()[0]?.type,
  );

  selectedCount = computed(() => this.selectionService.selected().length);
  canBeSold = computed(() => {
    const entityService = this.entityService();
    if (!entityService) return false;
    return entityService.canBeSold();
  });

  panelEnabled = computed(
    () =>
      (this.menuOptions().length || this.canBeSold()) && this.entityService(),
  );

  entityService = computed(() => {
    if (!this.selectedEntityType()) return null;
    return this.injector.get(
      EntityService[this.selectedEntityType() as EntityType],
    );
  });

  menuOptions = computed(() => {
    const entityService = this.entityService();
    if (!entityService) return [];

    const options: PanelType[] = [];
    const entity = entityService.entities()[0];
    if (!entity) return [];

    if ("cultivate" in entity && entity.cultivate instanceof Cultivate) {
      options.push(PanelType.Plant);
      options.push(PanelType.CropStatus);
    }

    if ("cropStock" in entity && entity.cropStock instanceof CropStock) {
      options.push(PanelType.CropStock);
    }

    const hasUpgrades = Object.keys(entityService.upgrades).length > 0;
    if (hasUpgrades) {
      options.push(PanelType.Upgrade);
    }

    if (entity.type === EntityType.Altar) {
      options.push(PanelType.WeatherControl);
      options.push(PanelType.SeasonControl);
    }

    if ("forecast" in entity && entity.forecast instanceof Forecast) {
      options.push(PanelType.WeatherForecast);
    }

    if (
      "generatePower" in entity &&
      entity.generatePower instanceof GeneratePower
    ) {
      options.push(PanelType.PowerGeneration);
    }

    return options;
  });

  sellEntity() {
    const service = this.entityService();
    if (!service) return;

    const selectedEntityIds = this.selectionService.selected().map((e) => e.id);

    selectedEntityIds.forEach((id) => service.sell(id));
    this.selectionService.clear();
  }
}

enum PanelType {
  Upgrade = "Upgrade",
  Plant = "Plant",
  CropStatus = "Crop Status",
  CropStock = "Storage",
  WeatherControl = "Weather Control",
  SeasonControl = "Season Control",
  WeatherForecast = "Weather Forecast",
  PowerGeneration = "Power",
}
