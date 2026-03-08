import { effect, inject, signal } from "@angular/core";
import Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import { EntityType } from "../../models/entity";
import { FarmerService } from "../../services/entities/farmer.service";
import { PlotsService } from "../../services/entities/plots.service";
import { Crop } from "../../services/items/crop.service";
import { Direction, MoveBehavior } from "./behaviors/move";
import { IStorer, Storer } from "./behaviors/storer";
import { Entity } from "./Entity";
import { PlotEntity } from "./PlotEntity";
import { Sprite } from "./Sprite";

export class FarmerEntity
  extends Entity<FarmerRender, FarmerUpgrade>
  implements IStorer
{
  override selectable = true;
  override type = EntityType.Farmer;
  private moveBehavior: MoveBehavior;
  private plotService = inject(PlotsService);
  private farmerService = inject(FarmerService);

  // This should be on the sprite
  override initialDirection: Direction = Direction.left;

  currentPlotTargetId: string | null = null;

  storage: Storer;

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

    this.moveBehavior = new MoveBehavior(this.node, 20, (direction) =>
      this.setDirection(direction),
    );

    this.upgrade.set(upgrade);
    this.storage = new Storer();

    this.init();
  }

  protected override update(): void {
    if (this.node.isDragging() || this.node.draggable()) return;
    this.moveToTarget();
  }

  upgradeTo(upgrade: FarmerUpgrade) {
    this.upgrade.set(upgrade);
  }
  private _upgradeChangeEffect = effect(() => {
    const upgrade = this.upgrade();
  });

  private moveToTarget() {
    this.plotMovingBehavoir();
  }

  private plotMovingBehavoir() {
    let plot: PlotEntity | undefined;

    if (this.currentPlotTargetId) {
      plot = this.plotService.getById(this.currentPlotTargetId);
    } else {
      plot = this.getTargetPlot();
    }

    if (!plot) {
      this.currentPlotTargetId = null;
      return;
    }

    const plotNode = plot.node;
    this.currentPlotTargetId = plotNode.id();

    this.node.isMoving.set(true);
    this.moveBehavior.moveToTarget(plotNode, () => {
      this.node.isMoving.set(false);

      const inStorage = plotNode.entity.storage.retrieveAll();
      if (inStorage) {
        this.storage.storeAll(inStorage);
      }

      if (plot.canHarvest()) {
        plot.harvest();
        const harvested = plot.storage.retrieveAll();
        if (!harvested) return;
        this.storage.storeAll(harvested);
      }

      if (plot.canPlant()) {
        this.plotService.plantOnPlot(plot.id, Crop.Potato);
      }
    });
  }

  private getTargetPlot(): PlotEntity | undefined {
    const otherFarmerTargets = this.farmerService
      .entities()
      .map((farmer) => farmer.currentPlotTargetId);

    let plots = this.plotService
      .entities()
      .filter((plot) => {
        if (otherFarmerTargets.includes(plot.id)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.cropGrowthStageFraction() === b.cropGrowthStageFraction()) {
          return b.cropGrowthStage() - a.cropGrowthStage();
        }

        return b.cropGrowthStageFraction() - a.cropGrowthStageFraction();
      });

    return plots[0];
  }
}

export enum FarmerUpgrade {
  Farmer = "Farmer",
}

class FarmerRender extends Sprite<FarmerEntity> {
  override hasCollision = false;
  isMoving = signal(false);

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
