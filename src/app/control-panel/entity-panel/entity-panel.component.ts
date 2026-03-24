import { Component, computed, inject, Injector } from "@angular/core";
import { Cultivate } from "../../canvas/entities/abilities/cultivate";
import { EntityType } from "../../models/entity";
import { BarnService } from "../../services/entities/barn.service";
import { BaseService } from "../../services/entities/base.service";
import { CowService } from "../../services/entities/cow.service";
import { FarmerService } from "../../services/entities/farmer.service";
import { GreenhouseService } from "../../services/entities/greenhouse.service";
import { MarketService } from "../../services/entities/market.service";
import { PlotService } from "../../services/entities/plots.service";
import { TractorService } from "../../services/entities/tractor.service";
import { VanService } from "../../services/entities/van.service";
import { WeatherControlService } from "../../services/entities/weather-control.service";
import { SelectionService } from "../../services/selection.service";
import { PanelMenuNavComponent } from "../menu-nav.component";
import { EntityPlantComponent } from "./entity-plant.component";
import { EntityUpgradesComponent } from "./entity-upgrades.component";

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
                  @case (PanelType.Storage) {}
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
      entityService[this.selectedEntityType() as EntityType],
    );
  });

  menuOptions = computed(() => {
    const entityService = this.entityService();
    if (!entityService) return [];

    const options: PanelType[] = [];
    const entity = entityService.entities()[0];
    if (!entity) return [];

    const hasUpgrades = Object.keys(entityService.upgrades).length > 0;
    if (hasUpgrades) {
      options.push(PanelType.Upgrade);
    }

    if ("cultivate" in entity && entity.cultivate instanceof Cultivate) {
      options.push(PanelType.Plant);
      options.push(PanelType.CropStatus);
    }

    if ("storage" in entity && entity.storage instanceof Storage) {
      options.push(PanelType.Storage);
    }

    return options;
  });
}

enum PanelType {
  Upgrade = "Upgrade",
  Plant = "Plant",
  CropStatus = "Crop Status",
  Storage = "Storage",
}

const entityService: Record<EntityType, typeof BaseService<any, any>> = {
  [EntityType.Plot]: PlotService,
  [EntityType.Farmer]: FarmerService,
  [EntityType.Barn]: BarnService,
  [EntityType.Tractor]: TractorService,
  [EntityType.Van]: VanService,
  [EntityType.Market]: MarketService,
  [EntityType.Cow]: CowService,
  [EntityType.Greenhouse]: GreenhouseService,
  [EntityType.WeatherControl]: WeatherControlService,
};
