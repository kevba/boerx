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
import { Entity } from "./Entity";
import { Sprite } from "./Sprite";

export class TractorEntity
  extends Entity<TractorRender, TractorUpgrade>
  implements IStorage, IMovement, IHarvester, IPlanter, IHauler
{
  override selectable = true;
  override type = EntityType.Tractor;
  cropToPlant = Crop.Wheat;

  override initialDirection: Direction = Direction.right;

  currentPlotTargetId: string | null = null;

  storage: Storage = new Storage();

  move: Movement = new Movement(this.node, 0, (direction) =>
    this.setDirection(direction),
  );

  hauler: Hauler = new Hauler(this);
  harvester: Harvester = new Harvester(this);
  planter: Planter = new Planter(this);

  upgrade = signal<TractorUpgrade>(TractorUpgrade.DearJuan);

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

    this.upgrade.set(upgrade);

    this.init();
  }

  upgradeTo(upgrade: TractorUpgrade) {
    this.upgrade.set(upgrade);
  }

  private _upgradeChangeEffect = effect(() => {
    const upgrade = this.upgrade();
    this.move.setSpeed(this.brandSpeed[upgrade]);
  });
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
