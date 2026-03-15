import { inject } from "@angular/core";
import { EntitiesService } from "../../../services/entities/entities.service";
import { Entity } from "../Entity";
import { Storable } from "../models";

import { Crop } from "../../../services/items/crop.service";
import { IMovement } from "../abilities/move";
import { IStorage } from "../abilities/store";
import { BarnEntity } from "../BarnEntity";
import { PlotEntity } from "../PlotEntity";
import { Act, BehaviorUtils } from "./utils";

export interface IHauler extends Entity<any, any>, IMovement, IStorage {
  hauler: Hauler;
}

export class Hauler {
  fetchTargetId: string | null = null;
  deliveryTargetId: string | null = null;

  private maxRange = 800;

  private entityService = inject(EntitiesService);

  constructor(private entity: IHauler) {}

  weight(): Act {
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
  ): { target: Storable; distance: number; fill: number } | null {
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
  ): { target: Storable; distance: number; fill: number } | null {
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
  ): { target: Storable; distance: number; fill: number } | null {
    const entity =
      this.entityService.entities().find((t) => t.id === id) || null;
    if (!entity) return null;
    const e = entity as Storable;

    return {
      target: e,
      distance: BehaviorUtils.centerDistance(e.node, this.entity.node),
      fill: e.storage.spaceLeft() / e.storage.totalSpace(),
    };
  }

  private findFetchTarget(): {
    target: Storable;
    distance: number;
    fill: number;
  } | null {
    let targets = this.entityService
      .entities()
      .filter((e) => "storage" in e)
      .filter((e) => e instanceof PlotEntity)
      .filter((e) => {
        return (e as Storable).storage.storedItems().length > 0;
      }) as Storable[];

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
    target: Storable;
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
