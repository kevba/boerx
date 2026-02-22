import { effect, inject, Injectable } from "@angular/core";
import Konva from "konva";
import { EntityType } from "../../models/entity";
import { BuyService } from "../../services/buy.service";
import {
  Tractor,
  TractorService,
} from "../../services/entities/tractor.service";
import { SelectionService } from "../../services/selection.service";
import { TractorEntity } from "../entities/TractorEntity";

@Injectable({
  providedIn: "root",
})
export class TractorRenderService {
  private tractorsService = inject(TractorService);
  private selectionService = inject(SelectionService);
  private buyService = inject(BuyService);

  private entities: Record<string, TractorEntity> = {};

  layer = new Konva.Layer({
    imageSmoothingEnabled: false,
  });

  constructor() {
    effect(() => {
      const tractors = this.tractorsService.tractors();
      const selectedTractors = this.selectionService.selectedTractors();

      tractors.forEach((element, i) => {
        const isSelected = selectedTractors.includes(element.id);

        this.renderTractor(element, isSelected);
      });
    });
  }

  setStage(stage: Konva.Stage) {
    stage.add(this.layer);
  }

  private renderTractor(tractor: Tractor, selected: boolean) {
    const layer = this.layer;
    if (!layer) return;

    let entity = this.entities[tractor.id];
    if (!entity) {
      const coords = this.buyService.getBuyLocation();
      entity = new TractorEntity(tractor, coords, layer);
      entity.onClick((e) => {
        this.selectionService.setMulti(e.evt.shiftKey);
        this.selectionService.select(EntityType.Tractor, tractor.id);
      });
      this.entities[tractor.id] = entity;
    }

    entity.update(tractor);
    entity.setSelected(selected);
  }
}
