import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";

import Game from "@/components/Game";
import { toScreen } from "@/lib/graphTransform";
import type { GraphPoint } from "@/lib/Types";

// Mock the PixiJS loader, keeping the actual
// FunctionInput and functionEval implementations.
jest.mock("@/components/GameGraphLoader", () => ({
  __esModule: true,
  default: ({
    points,
    obstacles,
  }: {
    points: GraphPoint[];
    obstacles: unknown[];
  }) => (
    <div
      data-testid="mock-game-graph"
      data-points={JSON.stringify(points)}
      data-obstacles={JSON.stringify(obstacles)}
    />
  ),
}));

function getGraphPoints(): GraphPoint[] {
  const graph = screen.getByTestId("mock-game-graph");

  return JSON.parse(
    graph.getAttribute("data-points") ?? "[]"
  ) as GraphPoint[];
}

function submitExpression(expression: string) {
  const input = screen.getByRole("textbox", {
    name: "Function",
  });

  fireEvent.change(input, {
    target: { value: expression },
  });

  fireEvent.click(
    screen.getByRole("button", { name: "Enter" })
  );
}

describe("Game Integration Tests", () => {
  beforeEach(() => {
    jest.spyOn(window, "requestAnimationFrame")
      .mockImplementation(() => 1);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders the function input and graph", () => {
    render(<Game obstacles={[]} />);

    expect(
      screen.getByRole("textbox", { name: "Function" })
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("mock-game-graph")
    ).toBeInTheDocument();
  });

  test("initializes the graph with no points", () => {
    render(<Game obstacles={[]} />);

    expect(getGraphPoints()).toEqual([]);
  });

  test("shows an empty history until a non-empty function is submitted", () => {
    render(<Game obstacles={[]} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Function" }), {
      target: { value: "x^2" },
    });
    expect(screen.queryByRole("list", { name: "Submitted functions" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Function history" })).not.toBeInTheDocument();

    submitExpression("   ");

    expect(screen.queryByRole("list", { name: "Submitted functions" })).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  test("keeps repeated and invalid submissions in history, newest first", () => {
    render(<Game obstacles={[]} />);

    submitExpression("x^2");
    const validPoints = getGraphPoints();
    submitExpression("x +");
    expect(getGraphPoints()).toEqual(validPoints);
    submitExpression("  x^2  ");

    const history = screen.getByRole("list", { name: "Submitted functions" });
    const entries = within(history).getAllByRole("listitem");
    expect(entries).toHaveLength(3);
    expect(entries[0]).toHaveTextContent("f(x) = x^2");
    expect(entries[1]).toHaveTextContent("f(x) = x +");
    expect(entries[1]).toHaveTextContent("Invalid expression");
    expect(entries[2]).toHaveTextContent("f(x) = x^2");
    expect(within(history).getAllByText("Invalid expression")).toHaveLength(1);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("submitting x^2 generates graph points", () => {
    render(<Game obstacles={[]} />);

    submitExpression("x^2");

    const points = getGraphPoints();

    expect(points.length).toBeGreaterThan(0);

    const expected = toScreen(2, 4);

    const point = points.find(
      (p) => Math.abs(p.x - expected.sx) < 0.001
    );

    expect(point).toBeDefined();
    expect(point!.y).toBeCloseTo(expected.sy);
  });

  test("submitting a linear expression updates the graph", () => {
    render(<Game obstacles={[]} />);

    submitExpression("2*x + 1");

    const points = getGraphPoints();
    const expected = toScreen(1, 3);

    const point = points.find(
      (p) => Math.abs(p.x - expected.sx) < 0.001
    );

    expect(point).toBeDefined();
    expect(point!.y).toBeCloseTo(expected.sy);
  });

  test("keyboard Enter submits the expression", () => {
    render(<Game obstacles={[]} />);

    const input = screen.getByRole("textbox", {
      name: "Function",
    });

    fireEvent.change(input, {
      target: { value: "x^3" },
    });

    // Graph remains empty before submitting
    expect(getGraphPoints()).toEqual([]);

    fireEvent.keyDown(input, {
      key: "Enter",
      code: "Enter",
    });

    const points = getGraphPoints();
    const expected = toScreen(2, 8);

    const point = points.find(
      (p) => Math.abs(p.x - expected.sx) < 0.001
    );

    expect(point).toBeDefined();
    expect(point!.y).toBeCloseTo(expected.sy);
  });

  test("submitting another expression changes the graph", () => {
    render(<Game obstacles={[]} />);

    submitExpression("x^2");

    const firstPoints = getGraphPoints();

    submitExpression("x^3");

    const secondPoints = getGraphPoints();

    const expected = toScreen(2, 4);

    const first = firstPoints.find(
      (p) => Math.abs(p.x - expected.sx) < 0.001
    );

    const second = secondPoints.find(
      (p) => Math.abs(p.x - expected.sx) < 0.001
    );

    expect(first).toBeDefined();
    expect(second).toBeDefined();

    expect(first!.y).toBeCloseTo(expected.sy);
    expect(second!.y).toBeCloseTo(toScreen(2, 8).sy);
  });

  test("invalid expressions display an error", () => {
    render(<Game obstacles={[]} />);

    submitExpression("x +");

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent(
      "Invalid or ungraphable mathematical expression"
    );
  });

  test("an empty expression displays an error", () => {
    render(<Game obstacles={[]} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Enter" })
    );

    expect(
      screen.getByRole("alert")
    ).toBeInTheDocument();
  });

  test("valid submission clears a previous error", () => {
    render(<Game obstacles={[]} />);

    submitExpression("x +");

    expect(
      screen.getByRole("alert")
    ).toBeInTheDocument();

    submitExpression("x^2");

    expect(
      screen.queryByRole("alert")
    ).not.toBeInTheDocument();

    expect(getGraphPoints().length).toBeGreaterThan(0);
  });

  test("typing without submission does not update graph", () => {
    render(<Game obstacles={[]} />);

    fireEvent.change(
      screen.getByRole("textbox", { name: "Function" }),
      { target: { value: "x^2" } }
    );

    expect(getGraphPoints()).toEqual([]);
  });

  test("passes obstacles to the graph", () => {
    const obstacles = [
      {
        shape: "circle" as const,
        x: 100,
        y: 150,
        radius: 20,
      },
    ];

    render(<Game obstacles={obstacles} />);

    const graph = screen.getByTestId("mock-game-graph");

    expect(
      JSON.parse(graph.getAttribute("data-obstacles") ?? "[]")
    ).toEqual(obstacles);
  });
});
