import { effect, inject, Injector, Signal } from "@angular/core";
import Konva from "konva";
import { map } from "rxjs";
import { AppInjectorHolder } from "../../../main";
import { EntityType } from "../../models/entity";
import { SelectionService } from "../../services/selection.service";
import { TickService } from "../../services/tick.service";
import { RenderUtils } from "../utils/renderUtils";
import { Direction } from "./behaviors/move";

export type EntityOptions<T extends Konva.Node> = {
  node: T;
  id: string;
};

export abstract class Entity<
  T extends EntityRender<Entity<any, any>>,
  UpgradeType extends string,
> {
  id: string;
  protected injector = inject(Injector);
  protected tick = inject(TickService);

  protected node: T;
  abstract selectable: boolean;
  abstract type: EntityType;
  protected initialDirection: Direction = Direction.right;
  abstract upgrade: Signal<UpgradeType>;

  protected get selectionService(): SelectionService {
    return AppInjectorHolder.injector.get(SelectionService);
  }

  constructor(options: EntityOptions<T>) {
    this.node = options.node;
    this.node.entity = this as any;
    this.id = options.id;

    this.node.on("click", (e) => this.onSelect(e));

    this.selectionService.selectedPerType$
      .pipe(map((entities) => entities[this.type]?.includes(this.id) || false))
      .subscribe((selected) => {
        this.setSelected(selected);
      });
  }

  init() {
    effect(() => {
      const t = this.tick.tick();
      this.update();
    });
  }

  protected update() {}

  protected setSelected(selected: boolean) {
    if (!this.selectable) return;

    this.node.setSelected(selected);
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

  abstract upgradeTo(upgrade: UpgradeType): void;
}

export class EntityRender<T extends Entity<any, any>> extends Konva.Group {
  selectedRect: Konva.Rect | null = null;
  entity!: T;
  protected hasCollision = true;

  constructor(args: { x: number; y: number; id: string; type: EntityType }) {
    const size = RenderUtils.entitySize[args.type][0];

    super({
      id: `${args.type}_${args.id}`,
      name: args.type,
      x: args.x,
      y: args.y,
      width: size,
      height: size,
    });

    this.selectedRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: size,
      height: size,
      stroke: RenderUtils.selectedColor,
      strokeWidth: 2,
      visible: false,
    });
    this.add(this.selectedRect);

    this.dragHandler();
  }

  setSelected(selected: boolean) {
    this.setAttr("draggable", selected);
    if (this.selectedRect) {
      this.selectedRect.visible(selected);
    }
  }

  private dragHandler() {
    this.on("dragmove", (e) => {
      if (!this.hasCollision) return;

      const collidingNode = this.detectCollision();
      if (!collidingNode) return;
      const moving = e.target.getClientRect();
      const collider = collidingNode.getClientRect();

      let safeX = moving.x;
      let safeY = moving.y;

      let constrainedX = 0;
      let constrainedY = 0;

      const penX = Math.min(
        moving.x + moving.width - collider.x,
        collider.x + collider.width - moving.x,
      );
      const penY = Math.min(
        moving.y + moving.height - collider.y,
        collider.y + collider.height - moving.y,
      );

      if (moving.x < collider.x && moving.x + moving.width > collider.x) {
        constrainedX = collider.x - moving.width;
      } else if (
        moving.x > collider.x &&
        collider.x + collider.width > moving.x
      ) {
        constrainedX = collider.x + collider.width;
      }

      if (moving.y < collider.y && moving.y + moving.height > collider.y) {
        constrainedY = collider.y - moving.height;
      } else if (
        moving.y > collider.y &&
        collider.y + collider.height > moving.y
      ) {
        constrainedY = collider.y + collider.height;
      }

      const parentTransform = e.target
        .getParent()!
        .getAbsoluteTransform()
        .copy()
        .invert();

      if (penX < penY) {
        safeX = constrainedX;
      } else {
        safeY = constrainedY;
      }

      const safeCoords = parentTransform.point({ x: safeX, y: safeY });

      e.target.position(safeCoords);
    });
  }

  private detectCollision(): Konva.Node | null {
    const entities = this.getLayer!()?.children || [];

    for (const child of entities) {
      if (child === this) continue;
      const intersect = RenderUtils.intersect(
        this.getClientRect(),
        child.getClientRect(),
      );
      if (intersect) {
        return child;
      }
    }
    return null;
  }
}
