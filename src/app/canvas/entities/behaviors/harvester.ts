import { inject } from "@angular/core";
import { EntitiesService } from "../../../services/entities/entities.service";
import { Entity } from "../Entity";
import { Harvestable } from "../models";
import { IMover } from "./move";
import { IStorer } from "./storer";
import { BehaviorUtils } from "./utils";

export interface IHarvester {
  harvester: Harvester;
}

export class Harvester {
  targetId: string | null = null;

  private entityService = inject(EntitiesService);

  constructor(private entity: Entity<any, any> & IMover & IStorer) {}

  act(): boolean {
    let target: (Entity<any, any> & Harvestable) | null = null;
    if (!this.targetId) {
      target = this.findTarget();
      this.targetId = target?.id || null;
      return false;
    } else {
      target = this.findTargetById(this.targetId);
      if (!target) {
        this.targetId = null;
        return false;
      }
    }

    this.entity.move.moveToTarget(target?.node, () => {
      if (!target?.canHarvest()) return;
      target.harvest();
      this.targetId = null;
    });

    return true;
  }

  private findTargetById(id: string): (Entity<any, any> & Harvestable) | null {
    const entity =
      this.entityService.entities().find((t) => t.id === id) || null;
    if (!entity || !("harvest" in entity)) return null;

    return entity as Entity<any, any> & Harvestable;
  }

  private findTarget(): (Entity<any, any> & Harvestable) | null {
    // Prevent multiple  targeting the same entity
    const otherHarvesters = this.entityService
      .entities()
      .filter((e) => "harvester" in e)
      .map((e) => (e as IHarvester).harvester.targetId);

    let targets = this.entityService
      .entities()
      .filter((e) => "harvest" in e)
      .filter((e) => (e as Entity<any, any> & Harvestable).canHarvest())
      .filter((e) => !otherHarvesters.includes(e.id))
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
      }) as (Entity<any, any> & Harvestable)[];

    return targets[0] || null;
  }
}
