import { computed, Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class CropService {
  plantCost = signal<Record<Crop, number>>({
    [Crop.Grass]: 10,
    [Crop.Wheat]: 300,
    [Crop.Corn]: 500,
    [Crop.Potato]: 600,
  });

  private harvestCounter = signal<Record<Crop, number>>({
    [Crop.Grass]: 0,
    [Crop.Wheat]: 0,
    [Crop.Corn]: 0,
    [Crop.Potato]: 0,
  });

  hc = signal(0);

  earnings = computed<Record<Crop, number>>(() => ({
    [Crop.Grass]: this.earningsCalculation(
      Crop.Grass,
      100,
      this.harvestCounter()
    ),
    [Crop.Wheat]: this.earningsCalculation(
      Crop.Wheat,
      200,
      this.harvestCounter()
    ),
    [Crop.Corn]: this.earningsCalculation(
      Crop.Corn,
      250,
      this.harvestCounter()
    ),
    [Crop.Potato]: this.earningsCalculation(
      Crop.Potato,
      300,
      this.harvestCounter()
    ),
  }));

  harvestEarnings(crop: Crop): number {
    const earnings = this.earnings()[crop];

    return earnings;
  }

  updateHarvestCounter(crop: Crop) {
    this.harvestCounter.update((counter) => {
      return {
        ...counter,
        [crop]: counter[crop] + 1,
      };
    });
  }

  private earningsCalculation(
    crop: Crop,
    base: number,
    harvests: Record<Crop, number>
  ): number {
    const totalHarvests = Object.values(harvests).reduce((a, b) => a + b, 0);
    const fraction = harvests[crop] || 1 / (totalHarvests || 1);
    const modifier = 0.5 - fraction;

    const newEarning = base + modifier * 10;
    return Math.max(newEarning, base);
  }
}

export enum Crop {
  Grass = "grass",
  Wheat = "wheat",
  Corn = "corn",
  Potato = "potato",
}
