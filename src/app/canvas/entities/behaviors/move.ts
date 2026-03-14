import { effect } from "@angular/core";
import Konva from "konva";
import { EntityRender } from "../Entity";
import { BehaviorUtils } from "./utils";

export interface IMover {
  move: Mover;
}

export class Mover {
  private moving = false;
  private moveTimeout: ReturnType<typeof setTimeout> | null = null;
  // interval of movement loop in ms, lower is smoother but more CPU intensive
  private movementLoopTime = 100;

  constructor(
    private entity: EntityRender<any>,
    // Speed in pixels per second
    private speed: number = 24,
    private directionCallback: (direction: Direction) => void = () => {},
  ) {}

  moveToTarget(target: Konva.Node, onReach?: () => void) {
    // Center of the target
    const center = BehaviorUtils.center(target);

    this.moving = true;
    this.moveTo(center, onReach);
  }

  private _selectedEffect = effect(() => {
    const selected = this.entity.isSelected();
    if (selected) {
      this.stop();
    }
  });

  moveTo(
    target: { x: number; y: number },
    onReach?: () => void,
    radius: number = 0,
  ) {
    this.moving = true;
    if (this.moveTimeout) {
      clearTimeout(this.moveTimeout);
      this.moveTimeout = null;
    }

    this.movementLoop(target, radius, onReach);
  }

  stop() {
    this.moving = false;
    this.entity.isMoving.set(false);

    if (this.moveTimeout) {
      clearTimeout(this.moveTimeout);
      this.moveTimeout = null;
    }
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }

  private movementLoop(
    destination: { x: number; y: number },
    radius: number = 0,
    onReach?: () => void,
  ) {
    if (!this.moving) {
      this.entity.isMoving.set(false);
      return;
    }
    this.entity.isMoving.set(true);

    const entityPosition = this.entity.position();
    const entityCenter = BehaviorUtils.center(this.entity);

    const xDiff = entityCenter.x - destination.x;
    const yDiff = entityCenter.y - destination.y;
    const distance = Math.hypot(xDiff, yDiff);

    if (distance <= radius) {
      this.stop();
      onReach?.();
      return;
    }

    const movementDistance = this.speed * (this.movementLoopTime / 1000);

    const xMovement =
      distance > 0
        ? (-xDiff / distance) * Math.min(movementDistance, distance)
        : 0;
    const yMovement =
      distance > 0
        ? (-yDiff / distance) * Math.min(movementDistance, distance)
        : 0;

    if (xMovement <= 0) {
      this.directionCallback(Direction.left);
    } else {
      this.directionCallback(Direction.right);
    }

    this.entity.to({
      x: entityPosition.x + xMovement,
      y: entityPosition.y + yMovement,
      duration: 1 / (1000 / this.movementLoopTime),
    });

    this.moveTimeout = setTimeout(
      () => this.movementLoop(destination),
      this.movementLoopTime,
    );
  }
}

export enum Direction {
  left = "left",
  right = "right",
}
