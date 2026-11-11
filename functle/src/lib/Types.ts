import { toScreen } from "./graphTransform";

/** A function sample on the game graph, in canvas pixels; drawn as a line. */
export type GraphPoint = {
  x: number;
  y: number;
};

type ObstacleBase = {
  /** Center x in canvas pixels. */
  x: number;
  /** Center y in canvas pixels. */
  y: number;
  color?: number;
};

export type CircleObstacle = ObstacleBase & {
  shape: "circle";
  radius: number;
};

export type RectangleObstacle = ObstacleBase & {
  shape: "rectangle";
  width: number;
  height: number;
};

/** An obstacle on the game graph, drawn as a circle or rectangle. */
export type Obstacle = CircleObstacle | RectangleObstacle;

/**
 * Converts an array of function values into canvas pixel points on the game
 * graph.
 *
 * Points use the same transform that draws the axes and ticks, so a point
 * with x = 0 sits exactly on the vertical axis and a point with y = 0 sits
 * exactly on the horizontal axis. The first value is plotted at x = 0, and
 * each subsequent value is spaced `xDelta` graph units further along the
 * x-axis. Y values map directly with no vertical shift, so the curve keeps
 * its proportions; the first point coincides with the graph origin only when
 * the first value is 0.
 *
 * @param values Function values, in left-to-right order.
 * @param xDelta Change in x between consecutive values, in graph units.
 * @returns One canvas pixel point per value.
 */
export function valuesToPoints(
  values: readonly number[],
  xDelta: number
): GraphPoint[] {
  // Multiply rather than accumulate so floating-point error does not drift.
  // Force the first point to x = 0 (avoids -0 when xDelta is negative).
  return values.map((y, index) => {
    const { sx, sy } = toScreen(index === 0 ? 0 : index * xDelta, y);
    return { x: sx, y: sy };
  });
}
