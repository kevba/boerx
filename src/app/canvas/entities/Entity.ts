import Konva from "konva";
import { map } from "rxjs";
import { AppInjectorHolder } from "../../../main";
import { EntityType } from "../../models/entity";
import { SelectionService } from "../../services/selection.service";
import { RenderUtils } from "../utils/renderUtils";
import { Direction } from "./behaviors/move";

export type EntityOptions<T extends Konva.Node> = {
  node: T;
  id: string;
};

export abstract class Entity<T extends Konva.Node> {
  id: string;

  protected node: T;
  abstract selectable: boolean;
  abstract type: EntityType;
  protected initialDirection: Direction = Direction.right;

  protected get selectionService(): SelectionService {
    return AppInjectorHolder.injector.get(SelectionService);
  }

  constructor(options: EntityOptions<T>) {
    this.node = options.node;
    this.id = options.id;

    this.node.on("click", (e) => this.onSelect(e));

    this.selectionService.selectedPerType$
      .pipe(map((entities) => entities[this.type]?.includes(this.id) || false))
      .subscribe((selected) => {
        this.setSelected(selected);
      });
  }

  init() {
    setInterval(() => {
      this.update();
    }, 200);
  }

  protected update() {}

  setSelected(selected: boolean) {
    if (!this.selectable) return;

    this.node.setAttr("draggable", selected);
    this.node.setAttr(
      "stroke",
      selected ? RenderUtils.selectedColor : undefined,
    );
  }

  protected onSelect(e: Konva.KonvaEventObject<MouseEvent>) {
    if (!this.selectable) return;

    this.selectionService.setMulti(e.evt.shiftKey);
    this.selectionService.select(this.type, this.id);
  }

  destroy() {
    this.node.destroy();
  }

  protected setDirection(direction: Direction) {
    if (direction === this.initialDirection) {
      this.node.scaleX(1);
      this.node.offsetX(0);
    } else {
      this.node.scaleX(-1);
      this.node.offsetX(this.node.width());
    }
  }
}
