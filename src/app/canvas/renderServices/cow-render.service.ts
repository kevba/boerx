import { effect, inject, Injectable } from "@angular/core";
import Konva from "konva";
import { EntityType } from "../../models/entity";
import { BuyService } from "../../services/buy.service";
import {
  Cow,
  CowService,
} from "../../services/entities/cow.service";
import { SelectionService } from "../../services/selection.service";
import { CowEntity } from "../entities/CowEntity";

@Injectable({
  providedIn: "root",
})
export class CowRenderService {
  private cowsService = inject(CowService);
  private selectionService = inject(SelectionService);
  private buyService = inject(BuyService);

  private entities: Record<string, CowEntity> = {};

  layer = new Konva.Layer({
    imageSmoothingEnabled: false,
  });

  constructor() {
    effect(() => {
      const cows = this.cowsService.entities();
      const selectedCows = this.selectionService.selectedPerType()[EntityType.Cow];
      console.log("Rendering cows", cows, selectedCows);
      cows.forEach((element, i) => {
        const isSelected = selectedCows.includes(element.id);
        this.renderCow(element, isSelected);
      });
    });
  }

  setStage(stage: Konva.Stage) {
    stage.add(this.layer);
  }

  private renderCow(cow: Cow, selected: boolean) {
    const layer = this.layer;
    if (!layer) return;

    let entity = this.entities[cow.id];
    if (!entity) {
      const coords = this.buyService.getBuyLocation();
      entity = new CowEntity(cow, coords, layer);
      entity.onClick((e) => {
        this.selectionService.setMulti(e.evt.shiftKey);
        this.selectionService.select(EntityType.Cow, cow.id);
      });
      this.entities[cow.id] = entity;
    }

    entity.update(cow);
    entity.setSelected(selected);
  }
}
