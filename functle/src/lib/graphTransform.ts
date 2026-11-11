import {
  MIN_X,
  MIN_Y,
  PLOT_BOTTOM,
  PLOT_LEFT,
  SCALE_X,
  SCALE_Y,
} from "./graphConstants";

/** Maps graph coordinates to canvas pixels. */
export function toScreen(x: number, y: number) {
  return {
    sx: PLOT_LEFT + (x - MIN_X) * SCALE_X,
    sy: PLOT_BOTTOM - (y - MIN_Y) * SCALE_Y,
  };
}
