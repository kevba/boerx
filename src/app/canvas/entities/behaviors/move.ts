import Konva from "konva";

export class MoveBehavior {
  private moving = false;

  constructor(
    private entity: Konva.Node,
    // Speed in pixels
    private speed: number = 24,
    private directionCallback: (direction: Direction) => void = () => {},
  ) {}

  moveTo(target: { x: number; y: number }, onReach?: () => void) {
    this.moving = true;
    this.movementLoop(target, 0, onReach);
  }

  moveToTarget(target: Konva.Node, onReach?: () => void) {
    const targetPos = target.position();

    // Center of the target
    const centerX = targetPos.x + target.width() / 2;
    const centerY = targetPos.y + target.height() / 2;

    const shortestSide = Math.min(target.width(), target.height());

    this.moving = true;
    this.movementLoop({ x: centerX, y: centerY }, shortestSide / 3, onReach);
  }

  stop() {
    this.moving = false;
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
      return;
    }
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

    const xMovement =
      distance > 0 ? (-xDiff / distance) * Math.min(this.speed, distance) : 0;
    const yMovement =
      distance > 0 ? (-yDiff / distance) * Math.min(this.speed, distance) : 0;

    if (xMovement <= 0) {
      this.directionCallback(Direction.left);
    } else {
      this.directionCallback(Direction.right);
    }

    this.entity.to({
      x: entityPosition.x + xMovement,
      y: entityPosition.y + yMovement,
      duration: 1,
    });

    setTimeout(() => this.movementLoop(destination), 1000);
  }
}

export enum Direction {
  left = "left",
  right = "right",
}
