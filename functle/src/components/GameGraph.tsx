"use client";

import { Application, extend } from "@pixi/react";
import { Graphics, Text } from "pixi.js";
import { useCallback } from "react";
import { clipLine } from "@/lib/clipLine";

//our defined types
import type { GraphPoint, Obstacle } from "@/lib/Types";
import {
  GRAPH_HEIGHT,
  GRAPH_WIDTH,
  PLOT_BOUNDS,
  PLOT_BOTTOM,
  PLOT_LEFT,
  PLOT_RIGHT,
  PLOT_TOP,
  X_TICKS,
  Y_TICKS,
} from "@/lib/graphConstants";
import { toScreen } from "@/lib/graphTransform";

extend({ Graphics });

const LABEL_STYLE = { fill: 0x94a3b8, fontSize: 12, fontFamily: "Arial" };

// Draws gridlines, axes, and the tick numbers
function drawGrid(graphics: Graphics) {
  graphics.clear();
  // drop the previous run's labels before rebuilding the grid
  for (const child of graphics.removeChildren()) child.destroy();

  // grid lines
  for (const x of X_TICKS) {
    const { sx } = toScreen(x, 0);
    graphics.moveTo(sx, PLOT_TOP).lineTo(sx, PLOT_BOTTOM);
  }
  for (const y of Y_TICKS) {
    const { sy } = toScreen(0, y);
    graphics.moveTo(PLOT_LEFT, sy).lineTo(PLOT_RIGHT, sy);
  }
  graphics.stroke({ color: 0x334155, width: 1 });

  // coordinate axes (origin sits off-center because x spans -10..50)
  const origin = toScreen(0, 0);
  graphics.moveTo(origin.sx, PLOT_TOP).lineTo(origin.sx, PLOT_BOTTOM);
  graphics.moveTo(PLOT_LEFT, origin.sy).lineTo(PLOT_RIGHT, origin.sy);
  graphics.stroke({ color: 0xffffff, width: 2 });

  const labels: Text[] = [];

  // x-axis numbers, placed just below the horizontal axis
  for (const tick of X_TICKS) {
    const { sx } = toScreen(tick, 0);
    const label = new Text({ text: String(tick), style: LABEL_STYLE });
    label.anchor.set(0.5);
    label.position.set(sx, origin.sy + 16);
    labels.push(label);
  }

  // y-axis numbers, placed just left of the vertical axis
  for (const tick of Y_TICKS) {
    if (tick === 0) continue;
    const { sy } = toScreen(0, tick);
    const label = new Text({ text: String(tick), style: LABEL_STYLE });
    label.anchor.set(1, 0.5);
    label.position.set(origin.sx - 8, sy);
    labels.push(label);
  }

  graphics.addChild(...labels);
}




// draw a line connecting every point in order (points are already canvas pixels)
function drawLine(graphics: Graphics, points: GraphPoint[]) {
  graphics.clear();

  if (points.length < 2) return;

  let hasVisibleSegments = false;

  for (let i = 1; i < points.length; i++) {
    const segment = clipLine(
      points[i - 1],
      points[i],
      PLOT_BOUNDS
    );

    if (!segment) continue;

    const [start, end] = segment;

    // Only draw the visible portion of this segment
    graphics.moveTo(start.x, start.y);
    graphics.lineTo(end.x, end.y);

    hasVisibleSegments = true;
  }

  if (hasVisibleSegments) {
    graphics.stroke({
      color: 0xf8385d,
      width: 2,
      alpha: 0.8,
    });
  }
}




// draw obstacles as circles or rectangles (points are canvas pixels)
function drawObstacles(graphics: Graphics, obstacles: Obstacle[]) {
  graphics.clear();

  for (const obstacle of obstacles) {
    const color = obstacle.color ?? 0xf8385d;

    if (obstacle.shape === "circle") {
      graphics.circle(obstacle.x, obstacle.y, obstacle.radius);
    } else {
      graphics.rect(
        obstacle.x - obstacle.width / 2,
        obstacle.y - obstacle.height / 2,
        obstacle.width,
        obstacle.height
      );
    }

    graphics.fill({ color }).stroke({ color: 0xffffff, width: 1, alpha: 0.7 });
  }
}




// function to draw game grid; `points` and `obstacles` are canvas pixels
export default function GameGraph({
  points = [],
  obstacles = [],
}: {
  points?: GraphPoint[];
  obstacles?: Obstacle[];
}) {
  const drawLineBetweenPoints = useCallback(
    (graphics: Graphics) => drawLine(graphics, points),
    [points]
  );

  const drawObstacleShapes = useCallback(
    (graphics: Graphics) => drawObstacles(graphics, obstacles),
    [obstacles]
  );

  return (
    <div className="game-graph">
      <Application
        width={GRAPH_WIDTH}
        height={GRAPH_HEIGHT}
        background="#000000"
        antialias
      >
        <pixiGraphics draw={drawGrid} />
        <pixiGraphics draw={drawLineBetweenPoints} />
        <pixiGraphics draw={drawObstacleShapes} />
      </Application>
    </div>
  );
}
