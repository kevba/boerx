import { computed, signal } from "@angular/core";
import Konva from "konva";
import { EntityType } from "../../models/entity";
import { Item } from "../../services/wares.service";
import { Entity } from "./Entity";
import { Sprite } from "./Sprite";

export class BarnEntity extends Entity<BarnImage, BarnUpgrade> {
  type = EntityType.Barn;
  selectable = true;

  upgrade = signal<BarnUpgrade>(BarnUpgrade.Shed);

  storage = signal<Item[]>([]);
  maxStoragePerUpgrade: Record<BarnUpgrade, number> = {
    [BarnUpgrade.Shed]: 100,
    [BarnUpgrade.Storage]: 500,
    [BarnUpgrade.Warehouse]: 2000,
  };

  private maxStorage = computed(
    () => this.maxStoragePerUpgrade[this.upgrade()],
  );

  spaceLeft = computed(() => {
    const currentStorage = this.storage();
    const totalAmount = currentStorage.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    return this.maxStorage() - totalAmount;
  });

  isFull = computed(() => {
    return this.spaceLeft() <= 0;
  });

  constructor(
    initialCoords: { x: number; y: number },
    layer: Konva.Layer,
    upgrade: BarnUpgrade = BarnUpgrade.Shed,
  ) {
    const id = crypto.randomUUID();

    const node = new BarnImage({
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

  upgradeTo(upgrade: BarnUpgrade) {
    this.upgrade.set(upgrade);
  }

  store(item: Item): Item | null {
    if (this.isFull()) {
      return item;
    }

    const currentStorage = this.storage();
    const itemIndex = currentStorage.findIndex((i) => i.type === item.type);
    const remainder = item.amount - this.spaceLeft();
    const toStore = { ...item, amount: item.amount - remainder };
    const remainingItem = { ...item, amount: remainder };

    if (itemIndex === -1) {
      this.storage.set([...currentStorage, toStore]);
      return remainder > 0 ? remainingItem : null;
    }

    currentStorage[itemIndex] = toStore;
    this.storage.set([...currentStorage]);
    return remainder > 0 ? remainingItem : null;
  }

  retrieve(type: string, amount: number): Item | null {
    const currentStorage = this.storage();
    const itemIndex = currentStorage.findIndex((item) => item.type === type);
    if (itemIndex === -1) return null;

    const item = currentStorage[itemIndex];
    if (item.amount < amount) return null;

    const updatedItem = { ...item, amount: item.amount - amount };
    const updatedStorage = [...currentStorage];

    if (updatedItem.amount === 0) {
      updatedStorage.splice(itemIndex, 1);
    } else {
      updatedStorage[itemIndex] = updatedItem;
    }
    this.storage.set(updatedStorage);

    return { ...item, amount };
  }
}

export enum BarnUpgrade {
  Shed = "Shed",
  Storage = "Storage",
  Warehouse = "Warehouse",
}

export class BarnImage extends Sprite {
  entity!: BarnEntity;

  constructor(args: { x: number; y: number; id: string }) {
    super({
      id: `barn_${args.id}`,
      name: EntityType.Barn,
      x: args.x,
      y: args.y,
      imageSrc: "/imgs/barn.png",
      EntityType: EntityType.Barn,
      totalFrames: 1,
      frameWidth: 32,
      frameHeight: 32,
    });
  }
}
