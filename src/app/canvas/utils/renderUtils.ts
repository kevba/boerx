import Konva from "konva";

export class RenderUtils {
  static findClosest(coords: { x: number; y: number }, nodes: Konva.Node[]) {
    let closestNode: Konva.Node = nodes[0];
    let closestDistance = Infinity;

    nodes.forEach((node) => {
      const nodePos = node.position();
      const distance = RenderUtils.distance(coords, nodePos);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestNode = node;
      }
    });

    return closestNode;
  }

  static nodeDistance(a: Konva.Node, b: Konva.Node) {
    const aCenter = RenderUtils.nodeCenter(a);
    const bCenter = RenderUtils.nodeCenter(b);
    return RenderUtils.distance(aCenter, bCenter);
  }

  // Did you mean to use centerDistance
  static distance(a: { x: number; y: number }, b: { x: number; y: number }) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  static nodeCenter(node: Konva.Node): { x: number; y: number } {
    const centerX = node.x() + node.width() / 2;
    const centerY = node.y() + node.height() / 2;

    return { x: centerX, y: centerY };
  }

  static center(
    a: { x: number; y: number },
    b: { x: number; y: number },
  ): { x: number; y: number } {
    const centerX = (a.x + b.x) / 2;
    const centerY = (a.y + b.y) / 2;

    return { x: centerX, y: centerY };
  }

  static intersect(
    r1: { x: number; y: number; width: number; height: number },
    r2: { x: number; y: number; width: number; height: number },
  ) {
    return !(
      r2.x > r1.x + r1.width ||
      r2.x + r2.width < r1.x ||
      r2.y > r1.y + r1.height ||
      r2.y + r2.height < r1.y
    );
  }
}
