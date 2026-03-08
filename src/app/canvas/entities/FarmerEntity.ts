import { effect, signal } from "@angular/core";
import Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import { EntityType } from "../../models/entity";
import { Crop } from "../../services/items/crop.service";
import { CropTransporter, ICropTransporter } from "./behaviors/cropTransporter";
import { Harvester, IHarvester } from "./behaviors/harvester";
import { Direction, IMover, Mover } from "./behaviors/move";
import { IPlanter, Planter } from "./behaviors/planter";
import { IStorer, Storer } from "./behaviors/storer";
import { Entity } from "./Entity";
import { Sprite } from "./Sprite";

export class FarmerEntity
  extends Entity<FarmerRender, FarmerUpgrade>
  implements IStorer, IMover, ICropTransporter, IHarvester, IPlanter
{
  override selectable = true;
  override type = EntityType.Farmer;

  // This should be on the sprite
  override initialDirection: Direction = Direction.left;

  currentPlotTargetId: string | null = null;

  move: Mover;
  storage: Storer;
  cropTransporter: CropTransporter;
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
    this.harvester = new Harvester(this);
    this.planter = new Planter(this, Crop.Wheat);

    this.init();
  }

  protected override update(): void {
    if (this.node.isDragging() || this.node.draggable()) return;

    const actOrder = [this.planter, this.harvester, this.cropTransporter].sort(
      (a, b) => {
        if (a.targetId && !b.targetId) return -1;
        if (!a.targetId && b.targetId) return 1;
        return 0;
      },
    );

    for (const behavior of actOrder) {
      if (behavior.act()) {
        break;
      }
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
