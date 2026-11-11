import { clipLine, type ClipBounds } from "./clipLine.ts";
import type {
  CircleObstacle,
  GraphPoint,
  Obstacle,
  RectangleObstacle,
} from "./Types.ts";

function segmentIntersectsCircle(
  start: GraphPoint,
  end: GraphPoint,
  obstacle: CircleObstacle
): boolean {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSq = dx * dx + dy * dy;

  // Closest point on the segment to the circle's center.
  let t = 0;
  if (lengthSq > 0) {
    t = ((obstacle.x - start.x) * dx + (obstacle.y - start.y) * dy) / lengthSq;
    t = Math.max(0, Math.min(1, t));
  }

  const closestX = start.x + t * dx;
  const closestY = start.y + t * dy;
  const distanceSq =
    (closestX - obstacle.x) ** 2 + (closestY - obstacle.y) ** 2;

  return distanceSq <= obstacle.radius ** 2;
}

function segmentIntersectsRect(
  start: GraphPoint,
  end: GraphPoint,
  obstacle: RectangleObstacle
): boolean {
  const left = obstacle.x - obstacle.width / 2;
  const right = obstacle.x + obstacle.width / 2;
  const top = obstacle.y - obstacle.height / 2;
  const bottom = obstacle.y + obstacle.height / 2;

  // Liang-Barsky clip of the segment against the rectangle's four edges.
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const p = [-dx, dx, -dy, dy];
  const q = [
    start.x - left,
    right - start.x,
    start.y - top,
    bottom - start.y,
  ];

  let t0 = 0;
  let t1 = 1;

  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
      continue;
    }

    const t = q[i] / p[i];
    if (p[i] < 0) {
      t0 = Math.max(t0, t);
    } else {
      t1 = Math.min(t1, t);
    }

    if (t0 > t1) return false;
  }

  return true;
}

/**
 * Returns every obstacle the drawn polyline touches or crosses.
 *
 * `points` and `obstacles` use canvas pixels. When `bounds` is supplied, each
 * segment is clipped to that region first, so obstacles outside the visible
 * plot do not count.
 */
export function findCollisions(
  points: readonly GraphPoint[],
  obstacles: readonly Obstacle[],
  bounds?: ClipBounds
): Obstacle[] {
  if (points.length < 2 || obstacles.length === 0) return [];

  const hits = new Set<Obstacle>();

  for (let i = 1; i < points.length; i++) {
    let start = points[i - 1];
    let end = points[i];

    if (bounds) {
      const clipped = clipLine(start, end, bounds);
      if (!clipped) continue;
      [start, end] = clipped;
    }

    for (const obstacle of obstacles) {
      if (hits.has(obstacle)) continue;

      const intersects =
        obstacle.shape === "circle"
          ? segmentIntersectsCircle(start, end, obstacle)
          : segmentIntersectsRect(start, end, obstacle);

      if (intersects) hits.add(obstacle);
    }
  }

  return [...hits];
}
