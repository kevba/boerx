import { Component, computed, inject, Injector } from "@angular/core";
import { Cultivate } from "../../canvas/entities/abilities/cultivate";
import { Storage } from "../../canvas/entities/abilities/store";
import { EntityType } from "../../models/entity";
import { EntityService } from "../../models/serviceMap";
import { SelectionService } from "../../services/selection.service";
import { PanelMenuNavComponent } from "../menu-nav.component";
import { EntityPlantComponent } from "./entity-plant.component";
import { EntityStorageComponent } from "./entity-storage.component";
import { EntityUpgradesComponent } from "./entity-upgrades.component";
import { SeasonControlPanelComponent } from "./season-control-panel.component";
import { WeatherControlPanelComponent } from "./weather-control-panel.component";

@Component({
  selector: "app-entity-panel",
  template: `
    @let service = entityService();
    @let options = menuOptions();
    @if (options.length && service) {
      <div
        class="context-panel"
        animate.enter="slide-in-enter"
        animate.leave="slide-in-leave">
        <div class="flex flex-col h-full flex-1 ">
          <div
            class="w-full flex flex-row items-center gap-2 bg-stone-600 px-6 ">
            <button class="text pl-0! pr-2!" (click)="selectionService.clear()">
              {{ "X" }}
            </button>
            <span class="text-xl md:text-2xl">{{ selectedEntityType() }}</span>
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
                  @case (PanelType.CropStatus) {}
                  @case (PanelType.Storage) {
                    <app-entity-storage [service]="service" />
                  }
                  @case (PanelType.WeatherControl) {
                    <app-weather-control-panel></app-weather-control-panel>
                  }
                  @case (PanelType.SeasonControl) {
                    <app-season-control-panel></app-season-control-panel>
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
    EntityStorageComponent,
  ],
})
export class EntityPanelComponent {
  private injector = inject(Injector);
  selectionService = inject(SelectionService);

  PanelType = PanelType;

  selectedEntityType = computed(
    () => this.selectionService.selected()[0]?.type,
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

    if ("storage" in entity && entity.storage instanceof Storage) {
      options.push(PanelType.Storage);
    }

    const hasUpgrades = Object.keys(entityService.upgrades).length > 0;
    if (hasUpgrades) {
      options.push(PanelType.Upgrade);
    }

    if (entity.type === EntityType.WeatherControl) {
      options.push(PanelType.WeatherControl);
      options.push(PanelType.SeasonControl);
    }

    return options;
  });
}

enum PanelType {
  Upgrade = "Upgrade",
  Plant = "Plant",
  CropStatus = "Crop Status",
  Storage = "Storage",
  WeatherControl = "Weather Control",
  SeasonControl = "Season Control",
}
