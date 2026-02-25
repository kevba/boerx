import { computed, effect, inject, Injectable, signal } from "@angular/core";
import Konva from "konva";
import { CanvasStageService } from "../canvas-stage.service";
import { StashService } from "../stash.service";
import { EntityType } from "./../../models/entity";
import { Upgrader, UpgradeTable } from "./upgradeUtils";

@Injectable({
  providedIn: "root",
})
export abstract class BaseService<
  UpgradeType extends string,
  Entity extends { id: string; upgrade: UpgradeType },
> {
  private stageService = inject(CanvasStageService);
  protected layer = new Konva.Layer({
    imageSmoothingEnabled: false,
  });

  protected stashService = inject(StashService);
  protected _entity = signal<Entity[]>([]);
  protected abstract baseCost: number;

  entities = this._entity.asReadonly();
  cost = computed(() => this.baseCost + (this.entities().length * 10) ** 2);
  abstract entityType: EntityType;

  abstract upgrades: UpgradeTable<UpgradeType>;
  protected upgrader!: Upgrader<UpgradeType>;

  add() {
    const cost = this.cost();
    const stash = this.stashService.stash();
    if (stash < cost) {
      return;
    }
    this.stashService.addStash(-cost);
    const base: Entity = this.createNew();

    this._entity.update((entities) => [...entities, base]);
  }

  constructor() {
    effect(() => {
      const stage = this.stageService.stage();
      if (stage) {
        stage.add(this.layer);
      }
    });
  }

  protected init() {
    this.upgrader = new Upgrader<UpgradeType>(this.upgrades);
  }

  upgrade(baseId: string, toUpgrade: UpgradeType) {
    const base = this._entity().find((base) => base.id === baseId);
    if (!base) return;

    const upgradeCost = this.upgradeCost(baseId, toUpgrade);

    const stash = this.stashService.stash();
    if (stash < upgradeCost) {
      return;
    }
    this.stashService.addStash(-upgradeCost);

    this._entity.update((bases) => {
      const index = bases.findIndex((base) => base.id === baseId);
      if (index === -1) return bases;

      //   Create a new object, otherwise the signal won't detect the change since the reference is the same
      bases[index] = {
        ...bases[index],
        upgrade: toUpgrade,
      };

      return [...bases];
    });
  }

  upgradeCost(baseId: string, toUpgrade: UpgradeType): number {
    const base = this._entity().find((base) => base.id === baseId);
    if (!base) return 0;
    return this.upgrader.fromToCost(base.upgrade, toUpgrade);
  }

  abstract createNew(): Entity;
}
