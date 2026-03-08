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

  static distance(a: { x: number; y: number }, b: { x: number; y: number }) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }
}
