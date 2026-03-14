import { effect, signal } from "@angular/core";
import Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import { EntityType } from "../../models/entity";
import { Crop } from "../../services/items/crop.service";
import { CropTransporter } from "./behaviors/cropTransporter";
import { Harvester, IHarvester } from "./behaviors/harvester";
import { Direction, IMover, Mover } from "./behaviors/move";
import { IPlanter, Planter } from "./behaviors/planter";
import { IStorer, Storer } from "./behaviors/storer";
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
  implements IStorer, IMover, IHarvester, IPlanter
{
  override selectable = true;
  override type = EntityType.Farmer;

  roles = signal<FarmerRoles[]>([
    FarmerRoles.Plant,
    FarmerRoles.Harvest,
    FarmerRoles.Transport,
    FarmerRoles.Sell,
  ]);

  private currentRole = signal<FarmerRoles | null>(null);

  // This should be on the sprite
  override initialDirection: Direction = Direction.left;

  move: Mover;
  storage: Storer;
  cropTransporter: CropTransporter;
  cropMarketTransporter: CropTransporter;
  harvester: Harvester;
  planter: Planter;

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

    this.move = new Mover(this.node, 20, (direction) =>
      this.setDirection(direction),
    );

    this.upgrade.set(upgrade);
    this.storage = new Storer(1);
    this.cropTransporter = new CropTransporter(
      this,
      EntityType.Plot,
      EntityType.Barn,
    );
    this.cropMarketTransporter = new CropTransporter(
      this,
      EntityType.Barn,
      EntityType.Market,
    );
    this.harvester = new Harvester(this);
    this.planter = new Planter(this, Crop.Wheat);

    this.init();
  }

  protected override update(): void {
    if (this.node.isDragging() || this.node.draggable()) return;

    const actions: {
      act: () => void;
      weight: number;
    }[] = [];

    actions.push(this.harvester.weight());

    actions.sort((a, b) => b.weight - a.weight);

    if (actions.length > 0 && actions[0].weight > 0) {
      actions[0].act();
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
