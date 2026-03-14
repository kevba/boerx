import Konva from "konva";

export class BehaviorUtils {
  static findClosest(coords: { x: number; y: number }, nodes: Konva.Node[]) {
    let closestNode: Konva.Node = nodes[0];
    let closestDistance = Infinity;

    nodes.forEach((node) => {
      const nodePos = node.position();
      const distance = BehaviorUtils.distance(coords, nodePos);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestNode = node;
      }
    });

    return closestNode;
  }

  // Did you mean to use centerDistance
  static distance(a: { x: number; y: number }, b: { x: number; y: number }) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  static centerDistance(a: Konva.Node, b: Konva.Node) {
    const aCenter = BehaviorUtils.center(a);
    const bCenter = BehaviorUtils.center(b);
    const dx = aCenter.x - bCenter.x;
    const dy = aCenter.y - bCenter.y;
    return Math.hypot(dx, dy);
  }

  static center(node: Konva.Node): { x: number; y: number } {
    const centerX = node.x() + node.width() / 2;
    const centerY = node.y() + node.height() / 2;

    return { x: centerX, y: centerY };
  }
}
