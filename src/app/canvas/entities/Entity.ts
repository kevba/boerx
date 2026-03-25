import {
  effect,
  inject,
  Injector,
  signal,
  Signal,
  untracked,
} from "@angular/core";
import Konva from "konva";
import { map } from "rxjs";
import { AppInjectorHolder } from "../../../main";
import { EntityType } from "../../models/entity";
import { SelectionService } from "../../services/selection.service";
import { TickService } from "../../services/tick.service";
import { ImageUtils } from "../utils/imageUtils";
import { RenderUtils } from "../utils/renderUtils";
import { Direction } from "./abilities/move";
import { Passive } from "./abilities/utils";
import { Act, Behavior } from "./behaviors/models";

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

  public node: T;
  selectable: boolean = true;
  abstract type: EntityType;
  protected initialDirection: Direction = Direction.right;
  abstract upgrade: Signal<UpgradeType>;

  protected lastAction: string = "";

  protected get selectionService(): SelectionService {
    return AppInjectorHolder.injector.get(SelectionService);
  }

  constructor(options: EntityOptions<T>) {
    this.node = options.node;
    this.node.entity = this as any;
    this.id = options.id;

    this.node.on("click tap", (e) => this.onSelect(e));

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

  protected update(): void {
    if (this.node.isDragging() || this.node.draggable()) return;
    this.executeBehaviors();
    this.executePassives();
  }

  private executeBehaviors() {
    let actions: Act[] = [];

    Object.values(this)
      .filter((attr) => {
        return attr instanceof Behavior;
      })
      .forEach((behavior: Behavior) => {
        actions.push(behavior.weight());
      });

    actions = actions.map((a) => {
      if (a.description === this.lastAction && a.weight !== 0) {
        a.weight += 0.3;
      }
      return a;
    });

    actions.sort((a, b) => b.weight - a.weight);

    if (actions.length > 0 && actions[0].weight > 0) {
      actions[0].act();
      this.lastAction = actions[0].description;
    }
  }

  private executePassives() {
    const passives = Object.values(this).filter((attr) => {
      return attr instanceof Passive;
    });

    passives.forEach((passive: Passive) => {
      untracked(() => passive.run());
    });
  }

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
  protected selected = signal(false);
  isSelected = this.selected.asReadonly();
  isMoving = signal(false);

  constructor(args: { x: number; y: number; id: string; type: EntityType }) {
    const width = ImageUtils.entitySize[args.type][0];
    const height = ImageUtils.entitySize[args.type][1];

    super({
      id: `${args.type}_${args.id}`,
      name: args.type,
      x: args.x,
      y: args.y,
      width: width,
      height: height,
    });

    this.selectedRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: width,
      height: height,
      stroke: ImageUtils.selectedColor,
      strokeWidth: width > 64 ? 4 : 2,
      visible: false,
      listening: false,
    });
    this.add(this.selectedRect);

    this.dragHandler();
  }

  setSelected(selected: boolean) {
    this.selected.set(selected);
  }

  _selectedEffect = effect(() => {
    const selected = this.selected();
    this.setAttr("draggable", selected);
    if (this.selectedRect) {
      this.selectedRect.moveToTop();
      this.selectedRect.visible(selected);
    }
  });

  private dragHandler() {
    let originSafe: { x: number; y: number } | null = null;

    this.on("dragstart", (e) => {
      originSafe = this.absolutePosition();
    });

    this.on("dragend", () => {
      originSafe = null;
    });

    this.dragBoundFunc((pos) => {
      if (!originSafe) return pos;

      const targetDest = { x: pos.x, y: pos.y };

      if (!this.collidesAt(targetDest)) {
        originSafe = targetDest;
        return targetDest;
      }

      let safeDest = this.searchDestination(targetDest, originSafe);
      safeDest = this.searchDestination(
        { x: targetDest.x, y: safeDest.y },
        safeDest,
      );
      safeDest = this.searchDestination(
        { x: safeDest.x, y: targetDest.y },
        safeDest,
      );

      originSafe = safeDest;
      return { x: safeDest.x, y: safeDest.y };
    });
  }

  private searchDestination(
    target: { x: number; y: number },
    safe: { x: number; y: number },
  ) {
    let low = 0;
    let high = 1;
    let best = {
      distance: RenderUtils.distance(target, safe),
      x: safe.x,
      y: safe.y,
    };

    // Binary search to find the point closest to target that doesn't collide
    for (let t = 0; t <= 10; t += 1) {
      const middle = (low + high) / 2;

      const candidate = this.lerpPoint(safe, target, middle);
      if (!this.collidesAt(candidate)) {
        const distance = RenderUtils.distance(candidate, target);
        if (distance < best.distance) {
          low = middle;
          best = { distance, x: candidate.x, y: candidate.y };
        }
      } else {
        high = middle;
      }
    }

    return { x: best.x, y: best.y };
  }

  private collidesAt(position: { x: number; y: number }): boolean {
    const currentRect = this.getClientRect();
    const currentPos = this.absolutePosition();

    const dx = position.x - currentPos.x;
    const dy = position.y - currentPos.y;

    const candidate = {
      x: currentRect.x + dx,
      y: currentRect.y + dy,
      width: currentRect.width,
      height: currentRect.height,
    };

    for (const child of this.getLayer()?.children || []) {
      if (child === this) continue;
      const childRect = child.getClientRect();

      if (RenderUtils.intersect(candidate, childRect)) {
        return true;
      }
    }

    return false;
  }

  private lerpPoint(
    a: { x: number; y: number },
    b: { x: number; y: number },
    t: number,
  ): { x: number; y: number } {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    };
  }
}
