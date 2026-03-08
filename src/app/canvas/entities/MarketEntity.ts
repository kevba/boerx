import { signal } from "@angular/core";
import Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import { EntityType } from "../../models/entity";
import { Entity } from "./Entity";
import { Sprite } from "./Sprite";

export class MarketEntity extends Entity<MarketImage, MarketUpgrade> {
  type = EntityType.Market;
  selectable = true;

  upgrade = signal<MarketUpgrade>(MarketUpgrade.Shed);

  constructor(
    initialCoords: { x: number; y: number },
    layer: Konva.Layer,
    upgrade: MarketUpgrade = MarketUpgrade.Shed,
  ) {
    const id = uuidv4();

    const node = new MarketImage({
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
  }

  upgradeTo(upgrade: MarketUpgrade) {
    this.upgrade.set(upgrade);
  }
}

export enum MarketUpgrade {
  Shed = "Shed",
  Storage = "Storage",
  Warehouse = "Warehouse",
}

export class MarketImage extends Sprite<MarketEntity> {
  protected override color = { r: 200, g: 200, b: 200 };

  constructor(args: { x: number; y: number; id: string }) {
    super({
      id: `market_${args.id}`,
      name: EntityType.Market,
      x: args.x,
      y: args.y,
      imageSrc: "/imgs/market.png",
      EntityType: EntityType.Market,
      totalFrames: 1,
      frameWidth: 32,
      frameHeight: 32,
    });
  }
}
