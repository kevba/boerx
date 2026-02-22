export class Upgrader<T extends string> {
  constructor(private upgrades: UpgradeTable<T>) {}

  fromToCost(from: T, to: T): number {
    if (from === to) return 0;

    const upgrade = this.upgrades[from];
    if (!upgrade) return 0;

    if (upgrade.next === to) {
      return upgrade.upgradeCost;
    }

    // check downgrade
    const downgradeCost = this.getDowngradeCost(from, to);
    if (downgradeCost !== 0) {
      return -downgradeCost;
    }

    // Somehow trying to downgrade or upgrade to an upgrade that is not in the path
    if (!upgrade.next) {
      return 0;
    }

    // If the next upgrade is not the target, we need to check the next one
    const nextCost = this.fromToCost(upgrade.next as T, to);
    if (nextCost === 0) {
      return 0;
    }

    return upgrade.upgradeCost + nextCost;
  }

  private getDowngradeCost(from: T, to: T): number {
    let current = to;
    let cost = 0;

    while (current) {
      const currentUpgrade = this.upgrades[current];
      if (!currentUpgrade || !currentUpgrade.next) break;

      cost += currentUpgrade.upgradeCost;

      if (currentUpgrade.next === from) {
        return cost;
      }

      current = currentUpgrade.next as T;
    }

    return 0;
  }
}

export interface UpgradeTable<T extends string> {
  [key: string]: Upgrade<T>;
}

export interface Upgrade<T> {
  next: T | null;
  upgradeCost: number;
  [key: string]: any;
}
