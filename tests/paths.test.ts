import { describe, it, expect } from "vitest";
import { findPathBFS, computePredecessorSet } from "@/lib/data/paths";

const nodes = [
  { id: "A", label: "A", cluster: "C1", deps: [] },
  { id: "B", label: "B", cluster: "C1", deps: ["A"] },
  { id: "C", label: "C", cluster: "C1", deps: ["B"] },
  { id: "X", label: "X", cluster: "C2", deps: [] },
] as any;

describe("paths", () => {
  it("findPathBFS returns path order from A to C", () => {
    expect(findPathBFS(nodes, "A", "C")).toEqual(["A", "B", "C"]);
  });

  it("findPathBFS returns empty when no path", () => {
    expect(findPathBFS(nodes, "X", "C")).toEqual([]);
  });

  it("computePredecessorSet returns goals and predecessors", () => {
    const set = computePredecessorSet(nodes, "C");
    expect(set.has("C")).toBe(true);
    expect(set.has("B")).toBe(true);
    expect(set.has("A")).toBe(true);
    expect(set.has("X")).toBe(false);
  });
});
