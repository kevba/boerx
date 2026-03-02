import { effect, signal } from "@angular/core";
import Konva from "konva";
import { EntityType } from "../../models/entity";
import { Direction, MoveBehavior } from "./behaviors/move";
import { BehaviorUtils } from "./behaviors/utils";
import { Entity } from "./Entity";
import { Sprite } from "./Sprite";

export class TractorEntity extends Entity<TractorImage, TractorUpgrade> {
  override selectable = true;
  override type = EntityType.Tractor;
  private moveBehavior: MoveBehavior;

  override initialDirection: Direction = Direction.right;
  homePlotId: string | null = null;
  atHomePlot = signal(false);

  upgrade = signal<TractorUpgrade>(TractorUpgrade.DearJuan);

  private moveEntityTarget: EntityType.Barn | EntityType.Plot = EntityType.Plot;

  private brandSpeed: Record<TractorUpgrade, number> = {
    [TractorUpgrade.DearJuan]: 24,
    [TractorUpgrade.OldHillland]: 48,
    [TractorUpgrade.Kerel]: 120,
    [TractorUpgrade.Klaas]: 240,
  };

  private brandColors: Record<
    TractorUpgrade,
    { r: number; g: number; b: number }
  > = {
    [TractorUpgrade.DearJuan]: { r: 54, g: 185, b: 0 },
    [TractorUpgrade.OldHillland]: { r: 0, g: 102, b: 204 },
    [TractorUpgrade.Kerel]: { r: 200, g: 16, b: 46 },
    [TractorUpgrade.Klaas]: { r: 255, g: 128, b: 0 },
  };

  constructor(
    initialCoords: { x: number; y: number },
    layer: Konva.Layer,
    upgrade: TractorUpgrade = TractorUpgrade.DearJuan,
  ) {
    const id = crypto.randomUUID();
    const node = new TractorImage({
      id: id,
      x: initialCoords.x,
      y: initialCoords.y,
    });
    layer.add(node);

    super({
      id: id,
      node: node,
    });

    this.moveBehavior = new MoveBehavior(this.node, 0, (direction) =>
      this.setDirection(direction),
    );

    this.upgrade.set(upgrade);
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
    this.node.setColor(this.brandColors[upgrade]);
    this.moveBehavior.setSpeed(this.brandSpeed[upgrade]);
  });

  private moveToTarget() {
    this.atHomePlot.set(false);

    const coords = this.node.position();
    let targetNode: Konva.Node | undefined;
    const layer = this.node.getLayer()!;

    if (this.moveEntityTarget === EntityType.Plot && this.homePlotId) {
      targetNode = layer.findOne(`#plot_${this.homePlotId}`);
      if (!targetNode) {
        this.homePlotId = null;
      }
    }

    // If we don't have a home plot or we're moving towards the barn, find the closest target
    if (!targetNode) {
      const targets = layer.find(`.${this.moveEntityTarget}`) || [];
      targetNode = BehaviorUtils.findClosest(coords, targets);
    }

    if (!targetNode) {
      this.moveBehavior.stop();
      return;
    }

    this.moveBehavior.moveToTarget(targetNode, () => {
      if (this.moveEntityTarget === EntityType.Plot) {
        if (this.homePlotId === null) {
          this.homePlotId = targetNode.id();
        }

        this.atHomePlot.set(true);
      }

      // After reaching the barn, switch back to moving towards the home plot
      if (this.moveEntityTarget === EntityType.Barn) {
        this.moveEntityTarget = EntityType.Plot;
      }
    });
  }

  setTargetToBarn() {
    this.moveEntityTarget = EntityType.Barn;
  }
}

export enum TractorUpgrade {
  DearJuan = "Dear Juan",
  OldHillland = "Old Hillland",
  Kerel = "Kerel",
  Klaas = "Klaas",
}

class TractorImage extends Sprite {
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
}
