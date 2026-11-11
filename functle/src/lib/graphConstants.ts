export const GRAPH_WIDTH = 800;
export const GRAPH_HEIGHT = 800;

// graph domain: -10 < x < 50, -30 < y < 30
export const MIN_X = -10;
export const MAX_X = 50;
export const MIN_Y = -30;
export const MAX_Y = 30;

// padding and border consts
const PADDING_LEFT = 40;
const PADDING_RIGHT = 40;
const PADDING_TOP = 40;
const PADDING_BOTTOM = 40;

export const PLOT_LEFT = PADDING_LEFT;
export const PLOT_RIGHT = GRAPH_WIDTH - PADDING_RIGHT;
export const PLOT_TOP = PADDING_TOP;
export const PLOT_BOTTOM = GRAPH_HEIGHT - PADDING_BOTTOM;

/** Visible drawing area, in canvas pixels. */
export const PLOT_BOUNDS = {
  left: PLOT_LEFT,
  right: PLOT_RIGHT,
  top: PLOT_TOP,
  bottom: PLOT_BOTTOM,
};
const PLOT_WIDTH = PLOT_RIGHT - PLOT_LEFT;
const PLOT_HEIGHT = PLOT_BOTTOM - PLOT_TOP;

export const SCALE_X = PLOT_WIDTH / (MAX_X - MIN_X);
export const SCALE_Y = PLOT_HEIGHT / (MAX_Y - MIN_Y);

export const X_TICKS = [-10, 0, 10, 20, 30, 40, 50];
export const Y_TICKS = [-30, -20, -10, 0, 10, 20, 30];
