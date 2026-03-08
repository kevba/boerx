import { inject } from "@angular/core";
import { EntityType } from "../../../models/entity";
import { EntitiesService } from "../../../services/entities/entities.service";
import { Entity } from "../Entity";
import { IMover } from "./move";
import { IStorer } from "./storer";
import { BehaviorUtils } from "./utils";

export interface ICropTransporter {
  cropTransporter: CropTransporter;
}

export class CropTransporter {
  movingToType: EntityType | null = null;
  targetId: string | null = null;

  private entityService = inject(EntitiesService);

  constructor(
    private entity: Entity<any, any> & IMover & IStorer,
    private sourceType: EntityType,
    private destinationType: EntityType,
  ) {}

  act(): boolean {
    if (this.entity.storage.storedItems().length === 0) {
      this.movingToType = this.sourceType;
    } else {
      this.movingToType = this.destinationType;
    }

    let target: (Entity<any, any> & IStorer) | null = null;
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
      if (!target?.storage) return;

      if (this.movingToType === this.sourceType) {
        const inStorage = target.storage.retrieveAll();
        if (inStorage) {
          this.entity.storage.storeAll(inStorage);
        }
      } else if (this.movingToType === this.destinationType) {
        const cargo = this.entity.storage.retrieveAll();
        if (!cargo) return;

        if (target?.storage) {
          target.storage.storeAll(cargo);
        }
      }

      this.targetId = null;
    });

    return true;
  }

  private findTargetById(id: string): (Entity<any, any> & IStorer) | null {
    const entity =
      this.entityService.entities().find((t) => t.id === id) || null;
    if (!entity || !("storage" in entity)) return null;

    return entity as Entity<any, any> & IStorer;
  }

  private findTarget(): (Entity<any, any> & IStorer) | null {
    // Prevent multiple crop transporters targeting the same entity
    const otherCropTransporters = this.entityService
      .entities()
      .filter((e) => e.type === this.movingToType)
      .filter((e) => "cropTransporter" in e)
      .map((e) => (e as ICropTransporter).cropTransporter.targetId);

    let targets = this.entityService
      .entities()
      .filter((e) => e.type === this.movingToType)
      .filter((e) => "storage" in e)
      .filter((e) => {
        if (this.movingToType === this.destinationType) {
          return true;
        }
        return (
          (e as Entity<any, any> & IStorer).storage.storedItems().length > 0
        );
      })
      .filter((e) => !otherCropTransporters.includes(e.id))
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
      }) as (Entity<any, any> & IStorer)[];

    return targets[0] || null;
  }
}
