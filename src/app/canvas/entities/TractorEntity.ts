import { effect, inject, signal } from "@angular/core";
import Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import { EntityType } from "../../models/entity";
import { BarnService } from "../../services/entities/barn.service";
import { PlotsService } from "../../services/entities/plots.service";
import { TractorService } from "../../services/entities/tractor.service";
import { BarnImage } from "./BarnEntity";
import { Direction, MoveBehavior } from "./behaviors/move";
import { IStorer, Storer } from "./behaviors/storer";
import { BehaviorUtils } from "./behaviors/utils";
import { Entity } from "./Entity";
import { PlotEntity } from "./PlotEntity";
import { Sprite } from "./Sprite";

export class TractorEntity
  extends Entity<TractorRender, TractorUpgrade>
  implements IStorer
{
  override selectable = true;
  override type = EntityType.Tractor;
  private moveBehavior: MoveBehavior;
  private plotService = inject(PlotsService);
  private tractorService = inject(TractorService);
  private barnService = inject(BarnService);

  override initialDirection: Direction = Direction.right;

  currentPlotTargetId: string | null = null;

  storage: Storer;

  upgrade = signal<TractorUpgrade>(TractorUpgrade.DearJuan);

  private moveEntityTarget: EntityType.Barn | EntityType.Plot = EntityType.Plot;

  private brandSpeed: Record<TractorUpgrade, number> = {
    [TractorUpgrade.DearJuan]: 48,
    [TractorUpgrade.OldHillland]: 60,
    [TractorUpgrade.Kerel]: 72,
    [TractorUpgrade.Klaas]: 84,
  };

  constructor(
    initialCoords: { x: number; y: number },
    layer: Konva.Layer,
    upgrade: TractorUpgrade = TractorUpgrade.DearJuan,
  ) {
    const id = uuidv4();
    const node = new TractorRender({
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

    this.moveBehavior = new MoveBehavior(this.node, 0, (direction) =>
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

  upgradeTo(upgrade: TractorUpgrade) {
    this.upgrade.set(upgrade);
  }
  private _upgradeChangeEffect = effect(() => {
    const upgrade = this.upgrade();
    this.moveBehavior.setSpeed(this.brandSpeed[upgrade]);
  });

  private moveToTarget() {
    if (this.moveEntityTarget === EntityType.Barn) {
      this.currentPlotTargetId = null;
      this.barnMovingBehavior();
    }

    if (this.moveEntityTarget === EntityType.Plot) {
      this.plotMovingBehavoir();
    }
  }

  setTargetToBarn() {
    this.moveEntityTarget = EntityType.Barn;
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
    this.currentPlotTargetId = plot.id;

    this.moveBehavior.moveToTarget(plotNode, () => {
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

      if (this.storage.storedItems().length > 0) {
        this.setTargetToBarn();
      }
    });
  }

  private barnMovingBehavior() {
    const barn = this.barnService.entities();
    const closest = BehaviorUtils.findClosest(
      this.node.position(),
      barn.map((b) => b.node),
    );

    this.moveBehavior.moveToTarget(closest, () => {
      // After reaching the barn, switch back to moving towards the home plot
      const barn = closest as BarnImage;
      const cargo = this.storage.retrieveAll();
      if (!cargo) return;

      // Cargo that can not be stored will be dumped :(
      const _remain = barn.entity.storage.storeAll(cargo);
      this.moveEntityTarget = EntityType.Plot;
    });

    return;
  }

  private getTargetPlot(): PlotEntity | undefined {
    const otherTractorTargets = this.tractorService
      .entities()
      .map((tractor) => tractor.currentPlotTargetId);

    let plots = this.plotService
      .entities()
      .filter((plot) => {
        if (otherTractorTargets.includes(plot.id)) {
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

export enum TractorUpgrade {
  DearJuan = "Dear Juan",
  OldHillland = "Old Hillland",
  Kerel = "Kerel",
  Klaas = "Klaas",
}

class TractorRender extends Sprite<TractorEntity> {
  override hasCollision = false;

  private brandColors: Record<
    TractorUpgrade,
    { r: number; g: number; b: number }
  > = {
    [TractorUpgrade.DearJuan]: { r: 54, g: 185, b: 0 },
    [TractorUpgrade.OldHillland]: { r: 0, g: 102, b: 204 },
    [TractorUpgrade.Kerel]: { r: 200, g: 16, b: 46 },
    [TractorUpgrade.Klaas]: { r: 255, g: 128, b: 0 },
  };

  constructor(args: { x: number; y: number; id: string }) {
    super({
      id: `tractor_${args.id}`,
      name: EntityType.Tractor,
      x: args.x,
      y: args.y,
      imageSrc: "/sprites/tractor.png",
      EntityType: EntityType.Tractor,
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

  _upgradeEffect = effect(() => {
    const upgrade = this.entity.upgrade();
    this.setColor(this.brandColors[upgrade]);
  });
}
