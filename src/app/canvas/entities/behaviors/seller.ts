import { inject } from "@angular/core";
import { EntitiesService } from "../../../services/entities/entities.service";
import { Entity } from "../Entity";
import { Storable } from "../models";

import { Crop } from "../../../services/items/crop.service";
import { IMovement } from "../abilities/move";
import { IStorage } from "../abilities/store";
import { BarnEntity } from "../BarnEntity";
import { MarketEntity } from "../MarketEntity";
import { Act, BehaviorUtils, Behavoir } from "./utils";

export interface ISeller extends Entity<any, any>, IMovement, IStorage {
  seller: Seller;
}

export class Seller extends Behavoir {
  fetchTargetId: string | null = null;
  deliveryTargetId: string | null = null;

  override maxRange = 1600;

  private entityService = inject(EntitiesService);

  constructor(private entity: ISeller) {
    super();
  }

  override getWeight(): Act {
    const hasItems = this.entity.storage.storedItems().length > 0;
    const fetchTarget = this.getFetchTarget(this.fetchTargetId);
    const deliveryTarget = this.getDeliveryTarget(this.deliveryTargetId);

    if (!hasItems && fetchTarget) {
      if (fetchTarget.distance < 10) {
        return {
          weight: 1,
          description: `Seller: fetching from target`,
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
          description: `Seller: moving to fetch target`,
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

    if (hasItems && deliveryTarget) {
      if (deliveryTarget.distance < 10) {
        return {
          weight: 1,
          description: `Seller: delivering to target`,
          act: () => {
            this.entity.move.stop();
            this.deliveryTargetId = null;
            this.fetchTargetId = null;

            const storedItems = this.entity.storage.retrieveAll() || [];
            deliveryTarget.target.sellItems(storedItems);
          },
        };
      } else {
        let weight = Math.max(1 - deliveryTarget.distance / this.maxRange, 0);

        return {
          description: `Seller: moving to delivery target`,
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

    return {
      weight: 0,
      description: `Seller: Idle`,
      act: () => undefined,
    };
  }

  private getFetchTarget(
    id: string | null,
  ): { target: Storable; distance: number; fill: number } | null {
    if (id) {
      let entity =
        this.entityService.entities().find((t) => t.id === id) || null;
      if (entity) {
        const storableEntity = entity as Storable;

        return {
          target: storableEntity,
          distance: BehaviorUtils.centerDistance(
            storableEntity.node,
            this.entity.node,
          ),
          fill:
            storableEntity.storage.spaceLeft() /
            storableEntity.storage.totalSpace(),
        };
      }
    }

    const foundTarget = this.findFetchTarget();
    return foundTarget;
  }

  private getDeliveryTarget(
    id: string | null,
  ): { target: MarketEntity; distance: number; fill: number } | null {
    if (id) {
      let entity =
        this.entityService.entities().find((t) => t.id === id) || null;
      if (entity) {
        const storableEntity = entity as MarketEntity;

        return {
          target: storableEntity,
          distance: BehaviorUtils.centerDistance(
            storableEntity.node,
            this.entity.node,
          ),
          fill: 0,
        };
      }
    }

    const foundTarget = this.findDeliveryTarget();
    return foundTarget;
  }

  private findFetchTarget(): {
    target: Storable;
    distance: number;
    fill: number;
  } | null {
    let targets = this.entityService
      .entities()
      .filter((e) => "storage" in e)
      .filter((e) => e instanceof BarnEntity)
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
    target: MarketEntity;
    distance: number;
    fill: number;
  } | null {
    let targets = this.entityService
      .entities()
      .filter((e) => e instanceof MarketEntity) as MarketEntity[];

    const targetsWithDistance = targets.map((t) => {
      return {
        target: t,
        distance: BehaviorUtils.centerDistance(t.node, this.entity.node),
        fill: 0,
      };
    });

    targetsWithDistance.sort((a, b) => a.distance - b.distance);
    return targetsWithDistance[0] || null;
  }
}
