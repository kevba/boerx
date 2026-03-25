import { inject } from "@angular/core";
import { EntitiesService } from "../../../services/entities/entities.service";
import { Crop } from "../../../services/items/crop.service";
import { Entity } from "../Entity";

import { RenderUtils } from "../../utils/renderUtils";
import { Cultivate, ICultivate } from "../abilities/cultivate";
import { IMovement } from "../abilities/move";
import { IStorage } from "../abilities/store";
import { Act, Behavior } from "./models";

export interface IPlanter extends Entity<any, any>, IMovement, IStorage {
  planter: Planter;
}

export class Planter extends Behavior {
  targetId: string | null = null;

  private entityService = inject(EntitiesService);
  override maxRange = 300;

  constructor(private entity: IPlanter) {
    super();
  }

  override getWeight(): Act {
    const targetInfo = this.getTarget();
    if (!targetInfo) {
      return {
        description: `Planter: No target`,
        act: () => undefined,
        weight: 0,
      };
    }

    if (targetInfo.distance < 10) {
      return {
        description: `Planter: planting`,
        act: () => {
          if (!targetInfo.target.cultivate.canPlant()) return;

          this.entity.move.stop();
          const cropToPlant =
            targetInfo.target.cultivate.lastPlantedCrop() || Crop.Wheat;

          targetInfo.target.cultivate.plant(cropToPlant);
          this.targetId = null;
        },
        weight: 1,
      };
    }

    return {
      description: `Planter: moving to icultivate`,
      act: () => {
        this.targetId = targetInfo?.target.id || null;
        this.entity.move.moveToTarget(targetInfo.target?.node, () => {
          this.entity.move.stop();
        });
      },
      weight: Math.max(1 - targetInfo.distance / this.maxRange, 0),
    };
  }

  private getTarget(): { target: ICultivate; distance: number } | null {
    if (!this.targetId) {
      const foundTarget = this.findTarget();
      return foundTarget;
    } else {
      const target = this.findTargetById(this.targetId);
      return target;
    }
  }

  private findTargetById(
    id: string,
  ): { target: ICultivate; distance: number } | null {
    const entity =
      this.entityService.entities().find((t) => t.id === id) || null;
    if (!entity) return null;

    return {
      target: entity as ICultivate,
      distance: RenderUtils.nodeDistance(entity.node, this.entity.node),
    };
  }

  private findTarget(): { target: ICultivate; distance: number } | null {
    let targets = this.getTargets();
    targets = this.filterAlreadyTargeted(targets);

    const targetsWithDistance = targets.map((t) => {
      return {
        target: t,
        distance: RenderUtils.nodeDistance(t.node, this.entity.node),
      };
    });

    targetsWithDistance.sort((a, b) => a.distance - b.distance);
    return targetsWithDistance[0] || null;
  }

  private filterAlreadyTargeted(entities: ICultivate[]): ICultivate[] {
    // Prevent multiple  targeting the same entity
    const otherPlanters = this.entityService
      .entities()
      .filter((e) => "planter" in e)
      .map((e) => (e as IPlanter).planter.targetId);

    return entities.filter((e) => !otherPlanters.includes(e.id));
  }

  private getTargets(): ICultivate[] {
    let targets = this.entityService
      .entities()
      .filter((e) => "cultivate" in e && e.cultivate instanceof Cultivate)
      .filter((e) => (e as ICultivate).cultivate.canPlant());

    return targets as ICultivate[];
  }
}
