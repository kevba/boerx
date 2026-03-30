import {
  computed,
  inject,
  Injectable,
  Injector,
  runInInjectionContext,
} from "@angular/core";
import { Entity } from "../../canvas/entities/Entity";
import { BuyService } from "../buy.service";
import { EntityLayerService } from "../entity-layer.service";
import { StashService } from "../stash.service";
import { EntityType } from "./../../models/entity";
import { EntitiesService } from "./entities.service";
import { Upgrader, UpgradeTable } from "./upgradeUtils";

@Injectable({
  providedIn: "root",
})
export abstract class BaseService<
  UpgradeType extends string,
  E extends Entity<any, any>,
> {
  private injector = inject(Injector);
  protected entityLayerService = inject(EntityLayerService);
  private buyService = inject(BuyService);
  protected entitiesService = inject(EntitiesService);

  protected stashService = inject(StashService);
  protected abstract baseCost: number;

  canBeSold = computed(() => true);
  entities = computed(
    () =>
      this.entitiesService
        .entities()
        .filter((e) => e.type === this.entityType) as E[],
  );

  cost = computed(() => {
    const entityCountMod = Math.floor(this.entities().length ** 1.5);
    return this.baseCost + Math.floor(entityCountMod * this.baseCost * 0.2);
  });

  abstract entityType: EntityType;

  abstract upgrades: UpgradeTable<UpgradeType>;
  protected upgrader!: Upgrader<UpgradeType>;

  getById(id: string): E | undefined {
    return this.entities().find((entity) => entity.id === id);
  }

  buy() {
    const cost = this.cost();
    const stash = this.stashService.stash();
    if (stash < cost) {
      return;
    }
    this.stashService.addStash(-cost);
    const coords = this.buyService.getBuyLocation();

    this.add(coords);
  }

  sell(id: string) {
    const entity = this.getById(id);
    if (!entity) return;

    this.stashService.addStash(this.baseCost);

    const e = this.getById(id);
    if (e) {
      e.destroy();
    }
    this.entitiesService.entities.update((entities) =>
      entities.filter((e) => e.id !== id),
    );
  }

  add(coords: { x: number; y: number }) {
    runInInjectionContext(this.injector, () => {
      const base = this.createNew(coords);
      this.entitiesService.entities.update((entities) => [...entities, base]);
    });
  }

  upgrade(baseId: string, toUpgrade: UpgradeType) {
    const base = this.getById(baseId);
    if (!base) return;

    const upgradeCost = this.upgradeCost(baseId, toUpgrade);

    const stash = this.stashService.stash();
    if (stash < upgradeCost) {
      return;
    }
    this.stashService.addStash(-upgradeCost);

    this.entitiesService.entities.update((bases) => {
      const index = bases.findIndex((base) => base.id === baseId);
      if (index === -1) return bases;

      //   Create a new object, otherwise the signal won't detect the change since the reference is the same
      bases[index].upgradeTo(toUpgrade);
      return [...bases];
    });
  }

  upgradeCost(baseId: string, toUpgrade: UpgradeType): number {
    const base = this.getById(baseId);
    if (!base) return 0;
    return this.upgrader.fromToCost(base.upgrade(), toUpgrade);
  }

  protected init() {
    this.upgrader = new Upgrader<UpgradeType>(this.upgrades);
  }

  abstract createNew(coords: { x: number; y: number }): E;
}
