import { computed, signal } from "@angular/core";
import { Item } from "../../../services/wares.service";
import { Entity } from "../Entity";
import { Ability } from "./utils";

export interface IStock extends Entity<any, any> {
  stock: Stock<any>;
}

export class Stock<T extends string> extends Ability {
  private stock = signal<Item<T>[]>([]);

  private maxStock = signal(10);

  constructor(maxStock?: number) {
    super();
    if (maxStock !== undefined) {
      this.maxStock.set(maxStock);
    }
  }

  spaceUsed = computed(() => {
    const currentStock = this.stock();
    const totalAmount = currentStock.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    return totalAmount;
  });

  spaceLeft = computed(() => {
    return this.maxStock() - this.spaceUsed();
  });

  filledFraction = computed(() => {
    if (this.maxStock() === 0) return 0;
    return this.spaceUsed() / this.maxStock();
  });

  totalSpace = computed(() => this.maxStock());

  isFull = computed(() => {
    return this.spaceLeft() <= 0;
  });

  storedItems = computed(() => {
    return this.stock();
  });

  store(item: Item<T>): Item<T> | null {
    if (this.isFull()) {
      return item;
    }

    const currentStock = this.stock();
    const itemIndex = currentStock.findIndex((i) => i.type === item.type);
    const unstorable = Math.max(item.amount - this.spaceLeft(), 0);
    const remainingItem = { ...item, amount: unstorable };

    if (itemIndex === -1) {
      this.stock.set([
        ...currentStock,
        {
          type: item.type,
          amount: item.amount - unstorable,
        },
      ]);
      return unstorable > 0 ? remainingItem : null;
    }

    currentStock[itemIndex] = {
      type: item.type,
      amount: currentStock[itemIndex].amount + item.amount - unstorable,
    };
    this.stock.set([...currentStock]);
    return unstorable > 0 ? remainingItem : null;
  }

  storeAll(items: Item<T>[]): Item<T>[] {
    let remainingItems: Item<T>[] = [];
    items.forEach((item) => {
      const remaining = this.store(item);
      if (remaining) {
        remainingItems.push(remaining);
      }
    });
    return remainingItems;
  }

  retrieve(type: T, amount: number): Item<T> | null {
    const currentStock = this.stock();
    const itemIndex = currentStock.findIndex((item) => item.type === type);
    if (itemIndex === -1) return null;

    const item = currentStock[itemIndex];
    if (item.amount < amount) return null;

    const updatedItem = { ...item, amount: item.amount - amount };
    const updatedStock = [...currentStock];

    if (updatedItem.amount === 0) {
      updatedStock.splice(itemIndex, 1);
    } else {
      updatedStock[itemIndex] = updatedItem;
    }
    this.stock.set(updatedStock);

    return { ...item, amount };
  }

  retrieveMax(type: T): Item<T> | null {
    const currentStock = this.stock();
    const itemIndex = currentStock.findIndex((item) => item.type === type);
    if (itemIndex === -1) return null;

    const item = currentStock[itemIndex];

    const updatedStock = [...currentStock];

    updatedStock.splice(itemIndex, 1);

    this.stock.set(updatedStock);

    return { ...item, amount: item.amount };
  }

  retrieveAll(): Item<T>[] | null {
    const result: Item<T>[] = [];
    const items = this.stock();
    items.forEach((item) => {
      const retrieved = this.retrieveMax(item.type);
      if (retrieved) {
        result.push(retrieved);
      }
    });
    return result;
  }

  clear() {
    this.stock.set([]);
  }

  setMaxStock(amount: number) {
    this.maxStock.set(amount);
  }

  override marshalSave() {
    return {
      stock: this.stock(),
    };
  }

  override restoreFromSave(data: ReturnType<this["marshalSave"]>) {
    this.stock.set(data.stock);
  }
}
