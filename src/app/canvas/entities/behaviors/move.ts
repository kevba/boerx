import { effect } from "@angular/core";
import Konva from "konva";
import { EntityRender } from "../Entity";

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
    const targetPos = target.position();

    // Center of the target
    const centerX = targetPos.x + target.width() / 2;
    const centerY = targetPos.y + target.height() / 2;

    const shortestSide = Math.min(target.width(), target.height());

    this.moving = true;
    this.moveTo({ x: centerX, y: centerY }, onReach, shortestSide / 3);
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

    let entityX = entityPosition.x;
    let entityY = entityPosition.y;

    // Centering
    entityX += this.entity.width() / 2;
    entityY += this.entity.height() / 2;

    const xDiff = entityX - destination.x;
    const yDiff = entityY - destination.y;
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
