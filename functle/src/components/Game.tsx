"use client";

import { useState } from "react";

import FunctionInput from "@/components/FunctionInput";
import GameGraphLoader from "@/components/GameGraphLoader";

import type { GraphPoint, Obstacle } from "@/lib/Types";
import { generateGraphPoints } from "@/lib/functionEval";

interface GameProps {
  obstacles: Obstacle[];
}

export default function Game({ obstacles }: GameProps) {
  const [points, setPoints] = useState<GraphPoint[]>([]);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<
    { expression: string; valid: boolean }[]
  >([]);

  function handleFunctionSubmit(expression: string) {
    const trimmedExpression = expression.trim();
    let valid = false;

    try {
      const newPoints = generateGraphPoints(expression);

      if (newPoints.length < 2) {
        throw new Error("Function has insufficient valid points");
      }

      setPoints(newPoints);
      setError("");
      valid = true;
    } catch {
      setError("Invalid or ungraphable mathematical expression");
    }

    if (trimmedExpression) {
      setHistory((previous) => [
        { expression: trimmedExpression, valid },
        ...previous,
      ]);
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

      <div className="min-h-0 w-full max-w-sm space-y-6 justify-self-center lg:max-h-full lg:overflow-y-auto lg:p-1 lg:justify-self-end">
        <FunctionInput onSubmit={handleFunctionSubmit} />

        {error && (
          <p role="alert" className="mt-3 text-red-400">
            {error}
          </p>
        )}

        {history.length > 0 && (
          <section aria-label="Function history" className="rounded border border-zinc-700 bg-zinc-900 p-4">
            <ol className="max-h-48 space-y-2 overflow-y-auto" tabIndex={0} aria-label="Submitted functions">
              {history.map((entry, index) => (
                <li key={index} className="rounded border border-zinc-700 p-2">
                  <p className="break-all font-mono text-sm">f(x) = {entry.expression}</p>
                  {!entry.valid && (
                    <span className="text-xs text-red-400">Invalid expression</span>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>

    </div>
  );
}
