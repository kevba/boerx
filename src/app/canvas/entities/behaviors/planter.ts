import { inject } from "@angular/core";
import { EntitiesService } from "../../../services/entities/entities.service";
import { Crop } from "../../../services/items/crop.service";
import { Entity } from "../Entity";
import { Plantable } from "../models";
import { IMover } from "./move";
import { BehaviorUtils } from "./utils";

export interface IPlanter {
  planter: Planter;
}

export class Planter {
  targetId: string | null = null;

  private entityService = inject(EntitiesService);

  constructor(
    private entity: Entity<any, any> & IMover,
    private crop: Crop,
  ) {}

  act(): boolean {
    let target: (Entity<any, any> & Plantable) | null = null;
    if (!this.targetId) {
      target = this.findTarget();
      this.targetId = target?.id || null;
    } else {
      target = this.findTargetById(this.targetId);
      if (!target) {
        this.targetId = null;
      }
    }

    if (!target) return false;

    this.entity.move.moveToTarget(target?.node, () => {
      if (!target?.canPlant()) return;
      target.plant(this.crop);
      this.targetId = null;
    });

    return true;
  }

  private findTargetById(id: string): (Entity<any, any> & Plantable) | null {
    const entity =
      this.entityService.entities().find((t) => t.id === id) || null;
    if (!entity || !("plant" in entity)) return null;

    return entity as Entity<any, any> & Plantable;
  }

  private findTarget(): (Entity<any, any> & Plantable) | null {
    // Prevent multiple  targeting the same entity
    const otherPlanters = this.entityService
      .entities()
      .filter((e) => "planter" in e)
      .map((e) => (e as IPlanter).planter.targetId);

    let targets = this.entityService
      .entities()
      .filter((e) => "canPlant" in e)
      .filter((e) => !otherPlanters.includes(e.id))
      .filter((e) => (e as Entity<any, any> & Plantable).canPlant())
      // TODO: in range checks
      .sort((a, b) => {
        const aEntity = a as Entity<any, any>;
        const bEntity = b as Entity<any, any>;

        const aDist = BehaviorUtils.distance(
          aEntity.node.position(),
          this.entity.node.position(),
        );
        const bDist = BehaviorUtils.distance(
          bEntity.node.position(),
          this.entity.node.position(),
        );

        return aDist - bDist;
      }) as (Entity<any, any> & Plantable)[];

    return targets[0] || null;
  }
}
