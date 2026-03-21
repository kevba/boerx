import { inject } from "@angular/core";
import { EntitiesService } from "../../../services/entities/entities.service";
import { Entity } from "../Entity";

import { Crop } from "../../../services/items/crop.service";
import { ICultivate } from "../abilities/cultivate";
import { IMovement } from "../abilities/move";
import { IStorage } from "../abilities/store";
import { BarnEntity } from "../BarnEntity";
import { Act, Behavior, BehaviorUtils } from "./utils";

export interface IHauler extends Entity<any, any>, IMovement, IStorage {
  hauler: Hauler;
}

export class Hauler extends Behavior {
  fetchTargetId: string | null = null;
  deliveryTargetId: string | null = null;

  override maxRange = 300;

  private entityService = inject(EntitiesService);

  constructor(private entity: IHauler) {
    super();
  }

  override getWeight(): Act {
    const isFull = this.entity.storage.isFull();
    const fetchTarget = this.getFetchTarget(this.fetchTargetId);
    const deliveryTarget = this.getDeliveryTarget(this.deliveryTargetId);

    if (isFull && deliveryTarget) {
      if (deliveryTarget.distance < 10) {
        return {
          weight: 1,
          description: `Hauler: delivering to target`,
          act: () => {
            this.entity.move.stop();
            this.deliveryTargetId = null;
            this.fetchTargetId = null;

            const storedItems = this.entity.storage.retrieveAll() || [];
            storedItems.forEach((item) => {
              const remainder = deliveryTarget.target.storage.store(item);
              if (remainder) {
                this.entity.storage.store(remainder);
              }
            });
          },
        };
      } else {
        let weight = Math.max(1 - deliveryTarget.distance / this.maxRange, 0);

        return {
          description: `Hauler: moving to delivery target`,
          weight: weight,
          act: () => {
            this.deliveryTargetId = deliveryTarget.target.id;
            this.fetchTargetId = null;

            this.entity.move.moveToTarget(deliveryTarget.target.node, () => {
              this.entity.move.stop();
            });
          },
        };
      }
    }

    if (!isFull && fetchTarget) {
      if (fetchTarget.distance < 10) {
        return {
          weight: 1,
          description: `Hauler: fetching from target`,
          act: () => {
            this.deliveryTargetId = null;
            this.fetchTargetId = null;

            this.entity.move.stop();
            Object.values(Crop).forEach((crop) => {
              if (this.entity.storage.spaceLeft() <= 0) {
                return;
              }

              const item = fetchTarget.target.storage.retrieveMax(crop);
              if (!item) return;

              const remainder = this.entity.storage.store(item);
              if (remainder) {
                fetchTarget.target.storage.store(remainder);
              }
            });
          },
        };
      } else {
        return {
          description: `Hauler: moving to fetch target`,
          weight:
            Math.max(1 - fetchTarget.distance / this.maxRange, 0) *
            fetchTarget.fill,
          act: () => {
            this.fetchTargetId = fetchTarget.target.id;
            this.deliveryTargetId = null;

            this.entity.move.moveToTarget(fetchTarget.target?.node, () => {
              this.entity.move.stop();
            });
          },
        };
      }
    }

    return {
      weight: 0,
      description: `Hauler: Idle`,
      act: () => undefined,
    };
  }

  private getFetchTarget(
    id: string | null,
  ): { target: IStorage; distance: number; fill: number } | null {
    if (id) {
      const target = this.findTargetById(id);
      if (target) {
        return target;
      }
    }
    const foundTarget = this.findFetchTarget();
    return foundTarget;
  }

  private getDeliveryTarget(
    id: string | null,
  ): { target: IStorage; distance: number; fill: number } | null {
    if (id) {
      const target = this.findTargetById(id);
      if (target) {
        return target;
      }
    }
    const foundTarget = this.findDeliveryTarget();
    return foundTarget;
  }

  private findTargetById(
    id: string,
  ): { target: IStorage; distance: number; fill: number } | null {
    const entity =
      this.entityService.entities().find((t) => t.id === id) || null;
    if (!entity) return null;
    const e = entity as IStorage;

    return {
      target: e,
      distance: BehaviorUtils.centerDistance(e.node, this.entity.node),
      fill: e.storage.spaceLeft() / e.storage.totalSpace(),
    };
  }

  private findFetchTarget(): {
    target: ICultivate;
    distance: number;
    fill: number;
  } | null {
    let targets = this.entityService
      .entities()
      .filter((e) => "storage" in e && "cultivate" in e)
      .filter((e) => {
        return (e as ICultivate).storage.storedItems().length > 0;
      }) as ICultivate[];

    const targetsWithDistance = targets.map((t) => {
      return {
        target: t,
        distance: BehaviorUtils.centerDistance(t.node, this.entity.node),
        fill: t.storage.spaceLeft() / t.storage.totalSpace(),
      };
    });

    targetsWithDistance.sort((a, b) => a.distance - b.distance);
    return targetsWithDistance[0] || null;
  }

  private findDeliveryTarget(): {
    target: IStorage;
    distance: number;
    fill: number;
  } | null {
    let targets = this.entityService
      .entities()
      .filter((e) => "storage" in e)
      .filter((e) => e instanceof BarnEntity)
      .filter((e) => {
        const storable = e as BarnEntity;

        return storable.storage.spaceLeft() > 0;
      });

    const targetsWithDistance = targets.map((t) => {
      return {
        target: t,
        distance: BehaviorUtils.centerDistance(t.node, this.entity.node),
        fill: t.storage.spaceLeft() / t.storage.totalSpace(),
      };
    });

    targetsWithDistance.sort((a, b) => a.distance - b.distance);
    return targetsWithDistance[0] || null;
  }
}
