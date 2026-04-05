import { inject } from "@angular/core";
import { EntitiesService } from "../../../services/entities/entities.service";
import { Entity } from "../Entity";

import { Crop } from "../../../services/items/crop.service";
import { RenderUtils } from "../../utils/renderUtils";
import { ICropStock } from "../abilities/cropStock";
import { IMovement } from "../abilities/move";
import { BarnEntity } from "../BarnEntity";
import { MarketEntity } from "../MarketEntity";
import { Act, Behavior } from "./models";

export interface ISeller extends Entity<any, any>, IMovement, ICropStock {
  seller: Seller;
}

export class Seller extends Behavior {
  fetchTargetId: string | null = null;
  deliveryTargetId: string | null = null;

  override maxRange = 1600;

  private entityService = inject(EntitiesService);

  constructor(private entity: ISeller) {
    super();
  }

  override getWeight(): Act {
    const hasItems = this.entity.cropStock.storedItems().length > 0;
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
              if (this.entity.cropStock.spaceLeft() <= 0) {
                return;
              }

              const item = fetchTarget.target.cropStock.retrieveMax(crop);
              if (!item) return;

              const remainder = this.entity.cropStock.store(item);
              if (remainder) {
                fetchTarget.target.cropStock.store(remainder);
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

            const storedItems = this.entity.cropStock.retrieveAll() || [];
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
  ): { target: ICropStock; distance: number; fill: number } | null {
    if (id) {
      let entity =
        this.entityService.entities().find((t) => t.id === id) || null;
      if (entity) {
        const storableEntity = entity as ICropStock;

        return {
          target: storableEntity,
          distance: RenderUtils.nodeDistance(
            storableEntity.node,
            this.entity.node,
          ),
          fill:
            storableEntity.cropStock.spaceLeft() /
            storableEntity.cropStock.totalSpace(),
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
          distance: RenderUtils.nodeDistance(
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
    target: ICropStock;
    distance: number;
    fill: number;
  } | null {
    // Prevent multiple  targeting the same entity
    const otherSellers = this.entityService
      .entities()
      .filter((e) => "seller" in e)
      .map((e) => (e as ISeller).seller.fetchTargetId);

    let targets = this.entityService
      .entities()
      .filter((e) => "storage" in e)
      .filter((e) => e instanceof BarnEntity)
      .filter((e) => !otherSellers.includes(e.id))
      .filter((e) => {
        return (e as ICropStock).cropStock.storedItems().length > 0;
      }) as ICropStock[];

    const targetsWithDistance = targets.map((t) => {
      return {
        target: t,
        distance: RenderUtils.nodeDistance(t.node, this.entity.node),
        fill: t.cropStock.spaceLeft() / t.cropStock.totalSpace(),
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
        distance: RenderUtils.nodeDistance(t.node, this.entity.node),
        fill: 0,
      };
    });

    targetsWithDistance.sort((a, b) => a.distance - b.distance);
    return targetsWithDistance[0] || null;
  }
}
