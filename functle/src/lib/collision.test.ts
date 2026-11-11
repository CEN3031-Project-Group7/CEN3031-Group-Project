import test from "node:test";
import assert from "node:assert/strict";

import { findCollisions } from "./collision.ts";
import type { Obstacle } from "./Types.ts";

const circle: Obstacle = { shape: "circle", x: 5, y: 5, radius: 2 };
// spans x: 3..7, y: 3..7
const rect: Obstacle = {
  shape: "rectangle",
  x: 5,
  y: 5,
  width: 4,
  height: 4,
};

test("detects a segment crossing a circle", () => {
  assert.deepEqual(
    findCollisions(
      [{ x: 0, y: 5 }, { x: 10, y: 5 }],
      [circle]
    ),
    [circle]
  );
});

test("detects a segment starting inside a circle", () => {
  assert.deepEqual(
    findCollisions(
      [{ x: 5, y: 5 }, { x: 10, y: 5 }],
      [circle]
    ),
    [circle]
  );
});

test("treats a tangent as a circle collision", () => {
  assert.deepEqual(
    findCollisions(
      [{ x: 0, y: 3 }, { x: 10, y: 3 }],
      [circle]
    ),
    [circle]
  );
});

test("misses a segment that clears the circle", () => {
  assert.deepEqual(
    findCollisions(
      [{ x: 0, y: 2 }, { x: 10, y: 2 }],
      [circle]
    ),
    []
  );
});

test("detects a vertical segment through a circle", () => {
  assert.deepEqual(
    findCollisions(
      [{ x: 5, y: 0 }, { x: 5, y: 10 }],
      [circle]
    ),
    [circle]
  );
});

test("handles a zero-length segment against a circle", () => {
  assert.deepEqual(findCollisions([{ x: 5, y: 5 }, { x: 5, y: 5 }], [circle]), [
    circle,
  ]);
  assert.deepEqual(
    findCollisions([{ x: 20, y: 20 }, { x: 20, y: 20 }], [circle]),
    []
  );
});

test("detects a segment crossing a rectangle", () => {
  assert.deepEqual(
    findCollisions(
      [{ x: 0, y: 5 }, { x: 10, y: 5 }],
      [rect]
    ),
    [rect]
  );
});

test("detects a segment fully inside a rectangle", () => {
  assert.deepEqual(
    findCollisions(
      [{ x: 4, y: 4 }, { x: 6, y: 6 }],
      [rect]
    ),
    [rect]
  );
});

test("treats touching a rectangle edge or corner as a collision", () => {
  assert.deepEqual(
    findCollisions(
      [{ x: 0, y: 3 }, { x: 10, y: 3 }],
      [rect]
    ),
    [rect]
  );
  assert.deepEqual(
    findCollisions(
      [{ x: 0, y: 0 }, { x: 3, y: 3 }],
      [rect]
    ),
    [rect]
  );
});

test("misses a segment that clears the rectangle", () => {
  assert.deepEqual(
    findCollisions(
      [{ x: 0, y: 2 }, { x: 10, y: 2 }],
      [rect]
    ),
    []
  );
});

test("handles a zero-length segment against a rectangle", () => {
  assert.deepEqual(findCollisions([{ x: 5, y: 5 }, { x: 5, y: 5 }], [rect]), [
    rect,
  ]);
  assert.deepEqual(
    findCollisions([{ x: 20, y: 20 }, { x: 20, y: 20 }], [rect]),
    []
  );
});

test("returns each hit obstacle once across a polyline", () => {
  const other: Obstacle = {
    shape: "rectangle",
    x: 10,
    y: 15,
    width: 2,
    height: 2,
  };

  assert.deepEqual(
    findCollisions(
      [{ x: 0, y: 5 }, { x: 10, y: 5 }, { x: 10, y: 20 }],
      [circle, other]
    ),
    [circle, other]
  );

  assert.deepEqual(
    findCollisions(
      [{ x: 0, y: 5 }, { x: 10, y: 5 }, { x: 0, y: 5 }],
      [circle]
    ),
    [circle]
  );
});

test("ignores collision outside the supplied drawing bounds", () => {
  const nearEdge: Obstacle = { shape: "circle", x: 2, y: 5, radius: 1 };
  const points = [{ x: 0, y: 5 }, { x: 10, y: 5 }];
  const bounds = { left: 4, right: 6, top: 0, bottom: 10 };

  assert.deepEqual(findCollisions(points, [nearEdge]), [nearEdge]);
  assert.deepEqual(findCollisions(points, [nearEdge], bounds), []);
});

test("returns no collisions without a drawable segment", () => {
  assert.deepEqual(findCollisions([], [circle]), []);
  assert.deepEqual(findCollisions([{ x: 5, y: 5 }], [circle]), []);
  assert.deepEqual(
    findCollisions([{ x: 0, y: 5 }, { x: 10, y: 5 }], []),
    []
  );
});
