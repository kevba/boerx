import Konva from "konva";

export class BehaviorUtils {
  static findClosest(coords: { x: number; y: number }, nodes: Konva.Node[]) {
    let closestNode: Konva.Node = nodes[0];
    let closestDistance = Infinity;

    nodes.forEach((node) => {
      const nodePos = node.position();
      const dx = nodePos.x - coords.x;
      const dy = nodePos.y - coords.y;
      const distance = Math.hypot(dx, dy);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestNode = node;
      }
    });

    return closestNode;
  }
}
