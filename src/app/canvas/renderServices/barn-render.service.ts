import { effect, inject, Injectable } from "@angular/core";
import Konva from "konva";
import { EntityType } from "../../models/entity";
import { BuyService } from "../../services/buy.service";
import { Barn, BarnService } from "../../services/entities/barn.service";
import { SelectionService } from "../../services/selection.service";
import { BarnEntity } from "../entities/BarnEntity";

@Injectable({
  providedIn: "root",
})
export class BarnRenderService {
  private barnService = inject(BarnService);
  private selectionService = inject(SelectionService);
  private buyService = inject(BuyService);

  private entities: Record<string, BarnEntity> = {};

  layer = new Konva.Layer({
    imageSmoothingEnabled: false,
  });

  constructor() {
    effect(() => {
      const barns = this.barnService.barns();
      const selectedBarns = this.selectionService.selectedBarns();

      barns.forEach((element, i) => {
        const isSelected = selectedBarns.includes(element.id);

        this.renderBarn(element, isSelected);
      });
    });
  }

  setStage(stage: Konva.Stage) {
    stage.add(this.layer);
  }

  private renderBarn(barn: Barn, selected: boolean) {
    const layer = this.layer;
    if (!layer) return;

    let entity = this.entities[barn.id];
    if (!entity) {
      const coords = this.buyService.getBuyLocation();
      entity = new BarnEntity(barn, { x: coords.x, y: coords.y }, layer);
      entity.onClick(() => {
        this.selectionService.setMulti(false);
        this.selectionService.select(EntityType.Barn, barn.id);
      });
      this.entities[barn.id] = entity;
    }

    entity.update(barn);
    entity.setSelected(selected);
  }
}
