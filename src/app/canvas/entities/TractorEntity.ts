import { effect, signal } from "@angular/core";
import Konva from "konva";
import { EntityType } from "../../models/entity";
import { BarnImage } from "./BarnEntity";
import { Direction, MoveBehavior } from "./behaviors/move";
import { IStorer, Storer } from "./behaviors/storer";
import { Entity } from "./Entity";
import { PlotRender } from "./PlotEntity";
import { Sprite } from "./Sprite";

export class TractorEntity
  extends Entity<TractorRender, TractorUpgrade>
  implements IStorer
{
  override selectable = true;
  override type = EntityType.Tractor;
  private moveBehavior: MoveBehavior;

  override initialDirection: Direction = Direction.right;

  currentPlotTargetId: string | null = null;

  storage: Storer;

  upgrade = signal<TractorUpgrade>(TractorUpgrade.DearJuan);

  private moveEntityTarget: EntityType.Barn | EntityType.Plot = EntityType.Plot;

  private brandSpeed: Record<TractorUpgrade, number> = {
    [TractorUpgrade.DearJuan]: 24,
    [TractorUpgrade.OldHillland]: 48,
    [TractorUpgrade.Kerel]: 120,
    [TractorUpgrade.Klaas]: 240,
  };

  constructor(
    initialCoords: { x: number; y: number },
    layer: Konva.Layer,
    upgrade: TractorUpgrade = TractorUpgrade.DearJuan,
  ) {
    const id = crypto.randomUUID();
    const node = new TractorRender({
      id: id,
      x: initialCoords.x,
      y: initialCoords.y,
    });
    layer.add(node);
    node.setZIndex(1000); // Ensure tractors are on top of other entities

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
    let targetNode: Konva.Node | undefined;
    const layer = this.node.getLayer()!;

    if (this.currentPlotTargetId) {
      targetNode = layer.findOne(`#${this.currentPlotTargetId}`);
    } else {
      targetNode = this.getTargetPlot();
    }

    if (!targetNode) {
      this.currentPlotTargetId = null;
      return;
    }

    const plot = targetNode as PlotRender;
    this.currentPlotTargetId = plot.id();

    this.moveBehavior.moveToTarget(plot, () => {
      const inStorage = plot.entity.storage.retrieveAll();
      if (inStorage) {
        this.storage.storeAll(inStorage);
      }

      if (plot.entity.canHarvest()) {
        plot.entity.harvest();
        const harvested = plot.entity.storage.retrieveAll();
        if (!harvested) return;
        this.storage.storeAll(harvested);
      }

      if (this.storage.storedItems().length > 0) {
        this.setTargetToBarn();
      }
    });
  }

  private barnMovingBehavior() {
    const layer = this.node.getLayer()!;

    let targetNode = layer.findOne(`.${EntityType.Barn}`);
    if (!targetNode) return;

    this.moveBehavior.moveToTarget(targetNode, () => {
      // After reaching the barn, switch back to moving towards the home plot
      const barn = targetNode as BarnImage;
      const cargo = this.storage.retrieveAll();
      if (!cargo) return;

      // Cargo that can not be stored will be dumped :(
      const _remain = barn.entity.storage.storeAll(cargo);
      this.moveEntityTarget = EntityType.Plot;
    });

    return;
  }

  private getTargetPlot() {
    const layer = this.node.getLayer()!;
    const otherTractorTargets = layer
      .find(`.${EntityType.Tractor}`)
      .filter((node) => {
        return node.id() !== this.node.id();
      })
      .map((node) => (node as TractorRender).entity.currentPlotTargetId);

    let targets = layer.find(`.${this.moveEntityTarget}`) || [];
    targets = targets
      .filter((node) => {
        if (!(node instanceof Konva.Group)) return false;
        const plot = node as PlotRender;

        if (!plot.entity) return false;

        if (otherTractorTargets.includes(plot.id())) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const bEntity = (b as PlotRender).entity;
        const aEntity = (a as PlotRender).entity;

        if (
          bEntity.cropGrowthStageFraction() ===
          aEntity.cropGrowthStageFraction()
        ) {
          return bEntity.cropGrowthStage() - aEntity.cropGrowthStage();
        }

        return (
          bEntity.cropGrowthStageFraction() - aEntity.cropGrowthStageFraction()
        );
      });

    return targets[0];
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
