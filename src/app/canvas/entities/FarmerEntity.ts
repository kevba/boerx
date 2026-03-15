import { effect, signal } from "@angular/core";
import Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import { EntityType } from "../../models/entity";
import { Crop } from "../../services/items/crop.service";
import { Direction, IMovement, Movement } from "./abilities/move";
import { IStorage, Storage } from "./abilities/store";
import { Harvester, IHarvester } from "./behaviors/harvester";
import { Hauler, IHauler } from "./behaviors/hauler";
import { IPlanter, Planter } from "./behaviors/planter";
import { Act } from "./behaviors/utils";
import { Entity } from "./Entity";
import { Sprite } from "./Sprite";

export enum FarmerRoles {
  Plant = "Plant",
  Harvest = "Harvest",
  Transport = "Transport",
  Sell = "Sell",
}

export class FarmerEntity
  extends Entity<FarmerRender, FarmerUpgrade>
  implements IStorage, IMovement, IHarvester, IPlanter, IHauler
{
  override selectable = true;
  override type = EntityType.Farmer;
  cropToPlant = Crop.Wheat;

  roles = signal<FarmerRoles[]>([
    FarmerRoles.Plant,
    FarmerRoles.Harvest,
    FarmerRoles.Transport,
    FarmerRoles.Sell,
  ]);

  private currentRole = signal<FarmerRoles | null>(null);

  // This should be on the sprite
  override initialDirection: Direction = Direction.left;

  move: Movement;
  storage: Storage;
  hauler: Hauler;
  harvester: Harvester;
  planter: Planter;

  private lastAction: string = "";

  upgrade = signal<FarmerUpgrade>(FarmerUpgrade.Farmer);

  constructor(
    initialCoords: { x: number; y: number },
    layer: Konva.Layer,
    upgrade: FarmerUpgrade = FarmerUpgrade.Farmer,
  ) {
    const id = uuidv4();
    const node = new FarmerRender({
      id: id,
      x: initialCoords.x,
      y: initialCoords.y,
    });
    layer.add(node);

    super({
      id: id,
      node: node,
    });
    node.entity = this;

    this.move = new Movement(this.node, 20, (direction) =>
      this.setDirection(direction),
    );

    this.upgrade.set(upgrade);
    this.storage = new Storage(1);
    this.hauler = new Hauler(this);

    this.harvester = new Harvester(this);
    this.planter = new Planter(this);

    this.init();
  }

  protected override update(): void {
    if (this.node.isDragging() || this.node.draggable()) return;

    let actions: Act[] = [];

    actions.push(
      this.harvester.weight(),
      this.planter.weight(),
      this.hauler.weight(),
    );

    actions = actions.map((a) => {
      if (a.description === this.lastAction && a.weight !== 0) {
        a.weight += 0.3;
      }
      return a;
    });

    actions.sort((a, b) => b.weight - a.weight);

    if (actions.length > 0 && actions[0].weight > 0) {
      actions[0].act();
      this.lastAction = actions[0].description;
    }
  }

  upgradeTo(upgrade: FarmerUpgrade) {
    this.upgrade.set(upgrade);
  }
  private _upgradeChangeEffect = effect(() => {
    const upgrade = this.upgrade();
  });
}

export enum FarmerUpgrade {
  Farmer = "Farmer",
}

class FarmerRender extends Sprite<FarmerEntity> {
  override hasCollision = false;
  override frameSpeed = 250;

  private upgradeColor: Record<
    FarmerUpgrade,
    { r: number; g: number; b: number }
  > = {
    [FarmerUpgrade.Farmer]: { r: 54, g: 185, b: 0 },
  };

  constructor(args: { x: number; y: number; id: string }) {
    super({
      id: `farmer_${args.id}`,
      name: EntityType.Farmer,
      x: args.x,
      y: args.y,
      imageSrc: "/sprites/farmer.png",
      EntityType: EntityType.Farmer,
      totalFrames: 3,
      frameWidth: 16,
      frameHeight: 16,
    });
    this.setAttr("crop", {
      x: 0,
      y: 0,
      width: this.frameWidth,
      height: this.frameHeight,
    });
  }

  override updateFrame() {
    if (!this.isMoving()) {
      this.frame = 0;
    } else {
      this.frame = Math.max((this.frame + 1) % this.totalFrames, 1);
    }
  }

  _upgradeEffect = effect(() => {
    const upgrade = this.entity.upgrade();
    this.setColor(this.upgradeColor[upgrade]);
  });

  _movingEffect = effect(() => {
    const isMoving = this.isMoving();
  });
}
