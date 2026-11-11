"use client";

import { useState } from "react";

import FunctionInput from "@/components/FunctionInput";
import GameGraphLoader from "@/components/GameGraphLoader";

import type { GraphPoint, Obstacle } from "@/lib/Types";
import { findCollisions } from "@/lib/collision";
import { generateGraphPoints } from "@/lib/functionEval";
import { PLOT_BOUNDS } from "@/lib/graphConstants";

interface GameProps {
  obstacles: Obstacle[];
}

export default function Game({ obstacles }: GameProps) {
  const [points, setPoints] = useState<GraphPoint[]>([]);
  const [error, setError] = useState("");

  const collisions = findCollisions(points, obstacles, PLOT_BOUNDS);

  function handleFunctionSubmit(expression: string) {
    try {
      const newPoints = generateGraphPoints(expression);

      if (newPoints.length < 2) {
        throw new Error("Function has insufficient valid points");
      }

      setPoints(newPoints);
      setError("");
    } catch {
      setError("Invalid or ungraphable mathematical expression");
    }
  }

  return (
    <div className="grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-6 self-center py-4 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_20rem]">

      <section
        aria-label="Game graph"
        className="flex min-h-0 min-w-0 items-center justify-center lg:h-full"
      >
        <GameGraphLoader
          points={points}
          obstacles={obstacles}
        />
      </section>

      <div>
        <FunctionInput onSubmit={handleFunctionSubmit} />

        {error && (
          <p role="alert" className="mt-3 text-red-400">
            {error}
          </p>
        )}

        {!error && collisions.length > 0 && (
          <p role="status" className="mt-3 text-amber-300">
            Collision: the function hits{" "}
            {collisions.length === 1
              ? "an obstacle"
              : `${collisions.length} obstacles`}.
          </p>
        )}
      </div>

    </div>
  );
}