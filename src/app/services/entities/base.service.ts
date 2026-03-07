import {
  computed,
  inject,
  Injectable,
  Injector,
  runInInjectionContext,
  signal,
} from "@angular/core";
import { Entity } from "../../canvas/entities/Entity";
import { EntityLayerService } from "../entity-layer.service";
import { StashService } from "../stash.service";
import { EntityType } from "./../../models/entity";
import { Upgrader, UpgradeTable } from "./upgradeUtils";

@Injectable({
  providedIn: "root",
})
export abstract class BaseService<
  UpgradeType extends string,
  E extends Entity<any, any>,
> {
  private injector = inject(Injector);
  private entityLayerService = inject(EntityLayerService);
  protected layer = this.entityLayerService.layer;

  protected stashService = inject(StashService);
  protected _entity = signal<E[]>([]);
  protected abstract baseCost: number;

  entities = this._entity.asReadonly();
  cost = computed(
    () => this.baseCost + (this.entities().length * (this.baseCost / 100)) ** 2,
  );
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

    runInInjectionContext(this.injector, () => {
      const base = this.createNew();

      this._entity.update((entities) => [...entities, base]);
    });
  }

  constructor() {}

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
      bases[index].upgradeTo(toUpgrade);
      return [...bases];
    });
  }

  upgradeCost(baseId: string, toUpgrade: UpgradeType): number {
    const base = this._entity().find((base) => base.id === baseId);
    if (!base) return 0;
    return this.upgrader.fromToCost(base.upgrade(), toUpgrade);
  }

  abstract createNew(): E;
}
