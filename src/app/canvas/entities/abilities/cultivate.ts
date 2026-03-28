import { computed, effect, inject, signal } from "@angular/core";
import { Crop, CropService } from "../../../services/items/crop.service";
import { StashService } from "../../../services/stash.service";
import { Entity } from "../Entity";
import { IStorage } from "./store";
import { Passive } from "./utils";

export interface ICultivate extends IStorage {
  cultivate: Cultivate;
}

export class Cultivate extends Passive {
  private cropService = inject(CropService);
  private stashService = inject(StashService);

  constructor(private entity: Entity<any, any> & IStorage) {
    super();
  }

  run() {
    this.growTick();
  }

  protected _crop = signal<Crop>(Crop.Grass);
  crop = this._crop.asReadonly();

  canHarvest = computed(() => {
    const crop = this._crop();
    const growthStage = this.cropGrowthStage();
    const maxGrowthStage = this.cropToHarvestTicks[crop];
    return growthStage >= maxGrowthStage;
  });

  canPlant = computed(() => {
    const crop = this._crop();
    const cost = this.cropService.plantCost()[crop];
    const stash = this.stashService.stash();
    if (stash < cost) {
      return false;
    }
    return this._crop() === Crop.Grass && !this.canHarvest();
  });

  protected lastPlantedCrop = signal<Crop | null>(null);
  lastPlanted = computed(() => {
    const crop = this.lastPlantedCrop();
    if (!crop || crop === Crop.Grass) {
      return null;
    }
    return crop;
  });

  private cropToHarvestTicks: Record<Crop, number> = {
    [Crop.Wheat]: 20,
    [Crop.Corn]: 30,
    [Crop.Potato]: 30,
    [Crop.Strawberry]: 60,
    [Crop.Tomato]: 60,
    [Crop.Grass]: 100000000,
  };

  cropGrowthStage = signal(0);
  cropGrowthStageFraction = computed(() => {
    const crop = this._crop();
    const growthStage = this.cropGrowthStage();
    const maxGrowthStage = this.cropToHarvestTicks[crop];
    return maxGrowthStage ? growthStage / maxGrowthStage : 0;
  });

  plant(crop: Crop) {
    if (!this.canPlant()) return;
    const cost = this.cropService.plantCost()[crop];

    this.stashService.addStash(-cost);

    this._crop.set(crop);
    this.lastPlantedCrop.set(crop);
  }

  replace(crop: Crop) {
    const cost = this.cropService.plantCost()[crop];
    const stash = this.stashService.stash();
    if (stash < cost) {
      return;
    }
    this.stashService.addStash(-cost);

    this._crop.set(crop);
    this.lastPlantedCrop.set(crop);
  }

  private _cropChangeEffect = effect(() => {
    const crop = this._crop();
    this.cropGrowthStage.set(0);
  });

  private growTick() {
    const crop = this._crop();
    const growthStage = this.cropGrowthStage();
    const maxGrowthStage = this.cropToHarvestTicks[crop];

    if (growthStage >= maxGrowthStage) return;

    this.cropGrowthStage.set(growthStage + this.growth());
  }

  harvest() {
    const harvestedCrop = this._crop();
    this._crop.set(Crop.Grass);
    this.cropGrowthStage.set(0);

    this.entity.storage.clear();
    this.entity.storage.store({
      type: harvestedCrop,
      amount: this.harvestAmount(),
    });
  }

  harvestAmount() {
    return 1;
  }

  growth(): number {
    return 1;
  }

  override marshalSave() {
    return {
      crop: this._crop(),
      cropGrowthStage: this.cropGrowthStage(),
      lastPlantedCrop: this.lastPlantedCrop(),
    };
  }

  override restoreFromSave(data: ReturnType<this["marshalSave"]>) {
    this._crop.set(data.crop);
    this.cropGrowthStage.set(data.cropGrowthStage);
    this.lastPlantedCrop.set(data.lastPlantedCrop);
  }
}
