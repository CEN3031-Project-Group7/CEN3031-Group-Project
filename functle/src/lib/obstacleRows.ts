import { SCALE_X, SCALE_Y } from "./graphConstants";
import { toScreen } from "./graphTransform";
import type { Obstacle } from "./Types";

/** One row from public.obstacle_circles (graph coordinates). */
export type CircleRow = {
  x: unknown;
  y: unknown;
  radius: unknown;
};

/** One row from public.obstacle_rects (graph coordinates). */
export type RectRow = {
  x: unknown;
  y: unknown;
  width: unknown;
  height: unknown;
};

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Converts a circle obstacle row into a canvas-pixel obstacle. */
export function circleRowToObstacle(row: CircleRow): Obstacle | null {
  const x = asNumber(row.x);
  const y = asNumber(row.y);
  const radius = asNumber(row.radius);

  if (x === null || y === null || radius === null || radius <= 0) {
    return null;
  }

  const center = toScreen(x, y);
  return {
    shape: "circle",
    x: center.sx,
    y: center.sy,
    // graph units; use the x-axis scale for the circle's width
    radius: radius * SCALE_X,
  };
}

/**
 * Converts a rectangle obstacle row into a canvas-pixel obstacle.
 * The stored x/y is the bottom-left corner in graph coordinates.
 */
export function rectRowToObstacle(row: RectRow): Obstacle | null {
  const x = asNumber(row.x);
  const y = asNumber(row.y);
  const width = asNumber(row.width);
  const height = asNumber(row.height);

  if (
    x === null ||
    y === null ||
    width === null ||
    height === null ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }

  const center = toScreen(x + width / 2, y + height / 2);
  return {
    shape: "rectangle",
    x: center.sx,
    y: center.sy,
    width: width * SCALE_X,
    height: height * SCALE_Y,
  };
}
