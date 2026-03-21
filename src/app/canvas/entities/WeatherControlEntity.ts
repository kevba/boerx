import { effect, signal } from "@angular/core";
import Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import { EntityType } from "../../models/entity";
import { Entity } from "./Entity";
import { Sprite } from "./Sprite";

export class WeatherControlEntity extends Entity<
  WeatherControlImage,
  WeatherControlUpgrade
> {
  type = EntityType.WeatherControl;

  upgrade = signal<WeatherControlUpgrade>(WeatherControlUpgrade.Pillar);

  maxStoragePerUpgrade: Record<WeatherControlUpgrade, number> = {
    [WeatherControlUpgrade.Pillar]: 20,
  };

  constructor(
    initialCoords: { x: number; y: number },
    layer: Konva.Layer,
    upgrade: WeatherControlUpgrade = WeatherControlUpgrade.Pillar,
  ) {
    const id = uuidv4();

    const node = new WeatherControlImage({
      ...initialCoords,
      id,
    });
    layer.add(node);

    super({
      id,
      node,
    });
    this.node.entity = this;
    this.upgrade.set(upgrade);

    this.init();
  }

  upgradeTo(upgrade: WeatherControlUpgrade) {
    this.upgrade.set(upgrade);
  }

  private _upgradeEffect = effect(() => {});
}

export enum WeatherControlUpgrade {
  Pillar = "Pillar",
}

export class WeatherControlImage extends Sprite<WeatherControlEntity> {
  override frameSpeed = 100;
  constructor(args: { x: number; y: number; id: string }) {
    super({
      id: `weathercontrol_${args.id}`,
      name: EntityType.WeatherControl,
      x: args.x,
      y: args.y,
      imageSrc: "/sprites/weather-control.png",
      EntityType: EntityType.WeatherControl,
      totalFrames: 10,
      frameWidth: 32,
      frameHeight: 32,
    });
  }
}
