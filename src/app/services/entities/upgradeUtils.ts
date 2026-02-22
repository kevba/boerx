export class UpgradeUtils {
  static FromToCost<T extends string>(
    upgradeKey: UpgradeTable<T>,
    from: T,
    to: T,
  ): number {
    let upgradeCost = 0;

    const upgrades = Object.values(upgradeKey).map(
      (upgrade) => (upgrade as Upgrade<T>).next,
    );

    const base = Object.keys(upgradeKey).find(
      (upgrade) => !upgrades.includes(upgrade as T),
    );
    const orderedUpgrades: Upgrade<T>[] = [];
    orderedUpgrades.push(upgradeKey[base as T]);

    while (orderedUpgrades.length < Object.keys(upgradeKey).length) {
      const lastUpgrade = orderedUpgrades[orderedUpgrades.length - 1];
      const nextUpgrade = upgradeKey[lastUpgrade.next as T];
      orderedUpgrades.push(nextUpgrade);
    }

    const fromIndex = orderedUpgrades.findIndex(
      (upgrade) => upgrade.next === from,
    );
    const toIndex = orderedUpgrades.findIndex((upgrade) => upgrade.next === to);

    if (fromIndex === -1 || toIndex === -1 || fromIndex > toIndex) {
      return 0;
    }

    for (let i = fromIndex; i < toIndex; i++) {
      upgradeCost += orderedUpgrades[i].upgradeCost;
    }

    return upgradeCost;
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
