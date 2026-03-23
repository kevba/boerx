import { inject } from "@angular/core";
import { EntitiesService } from "../../../services/entities/entities.service";
import { Entity } from "../Entity";

import { RenderUtils } from "../../utils/renderUtils";
import { Cultivate, ICultivate } from "../abilities/cultivate";
import { IMovement } from "../abilities/move";
import { IStorage } from "../abilities/store";
import { Act, Behavior } from "./models";

export interface IHarvester extends Entity<any, any>, IMovement, IStorage {
  harvester: Harvester;
}

export enum HarvesterState {
  Idle = "Idle",
  Harvesting = "Harvesting",
  MovingToTarget = "MovingToTarget",
}

export class Harvester extends Behavior {
  targetId: string | null = null;
  override maxRange = 300;

  private entityService = inject(EntitiesService);

  constructor(private entity: IHarvester) {
    super();
  }

  override getWeight(): Act {
    const targetInfo = this.getTarget();

    if (!targetInfo) {
      return {
        description: `Harvester: No target`,
        act: () => undefined,
        weight: 0,
      };
    }

    // eh close enough to harvest, just do it
    if (targetInfo.distance < 10) {
      return {
        description: `Harvester: Harvesting`,
        act: () => {
          this.entity.move.stop();
          targetInfo.target.cultivate.harvest();
          this.targetId = null;
        },
        weight: 1,
      };
    }

    return {
      description: `Harvester: moving to cultivate`,
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
    const otherHarvesters = this.entityService
      .entities()
      .filter((e) => "harvester" in e)
      .map((e) => (e as IHarvester).harvester.targetId);

    return entities.filter((e) => !otherHarvesters.includes(e.id));
  }

  private getTargets(): ICultivate[] {
    let targets = this.entityService
      .entities()
      .filter((e) => "cultivate" in e && e.cultivate instanceof Cultivate)
      .filter((e) => (e as ICultivate).cultivate.canHarvest());

    return targets as ICultivate[];
  }
}
