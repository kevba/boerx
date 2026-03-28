import { computed, signal } from "@angular/core";
import { Item } from "../../../services/wares.service";
import { Entity } from "../Entity";
import { Ability } from "./utils";

export interface IStorage extends Entity<any, any> {
  storage: Storage;
}

export class Storage extends Ability {
  private storage = signal<Item[]>([]);

  private maxStorage = signal(10);

  constructor(maxStorage?: number) {
    super();
    if (maxStorage !== undefined) {
      this.maxStorage.set(maxStorage);
    }
  }

  spaceUsed = computed(() => {
    const currentStorage = this.storage();
    const totalAmount = currentStorage.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    return totalAmount;
  });

  spaceLeft = computed(() => {
    return this.maxStorage() - this.spaceUsed();
  });

  filledFraction = computed(() => {
    if (this.maxStorage() === 0) return 0;
    return this.spaceUsed() / this.maxStorage();
  });

  totalSpace = computed(() => this.maxStorage());

  isFull = computed(() => {
    return this.spaceLeft() <= 0;
  });

  storedItems = computed(() => {
    return this.storage();
  });

  store(item: Item): Item | null {
    if (this.isFull()) {
      return item;
    }

    const currentStorage = this.storage();
    const itemIndex = currentStorage.findIndex((i) => i.type === item.type);
    const unstorable = Math.max(item.amount - this.spaceLeft(), 0);
    const remainingItem = { ...item, amount: unstorable };

    if (itemIndex === -1) {
      this.storage.set([
        ...currentStorage,
        {
          type: item.type,
          amount: item.amount - unstorable,
        },
      ]);
      return unstorable > 0 ? remainingItem : null;
    }

    currentStorage[itemIndex] = {
      type: item.type,
      amount: currentStorage[itemIndex].amount + item.amount - unstorable,
    };
    this.storage.set([...currentStorage]);
    return unstorable > 0 ? remainingItem : null;
  }

  storeAll(items: Item[]): Item[] {
    let remainingItems: Item[] = [];
    items.forEach((item) => {
      const remaining = this.store(item);
      if (remaining) {
        remainingItems.push(remaining);
      }
    });
    return remainingItems;
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

  retrieveMax(type: string): Item | null {
    const currentStorage = this.storage();
    const itemIndex = currentStorage.findIndex((item) => item.type === type);
    if (itemIndex === -1) return null;

    const item = currentStorage[itemIndex];

    const updatedStorage = [...currentStorage];

    updatedStorage.splice(itemIndex, 1);

    this.storage.set(updatedStorage);

    return { ...item, amount: item.amount };
  }

  retrieveAll(): Item[] | null {
    const result: Item[] = [];
    const items = this.storage();
    items.forEach((item) => {
      const retrieved = this.retrieveMax(item.type);
      if (retrieved) {
        result.push(retrieved);
      }
    });
    return result;
  }

  clear() {
    this.storage.set([]);
  }

  setMaxStorage(amount: number) {
    this.maxStorage.set(amount);
  }

  override marshalSave() {
    return {
      storage: this.storage(),
    };
  }

  override restoreFromSave(data: ReturnType<this["marshalSave"]>) {
    this.storage.set(data.storage);
  }
}
