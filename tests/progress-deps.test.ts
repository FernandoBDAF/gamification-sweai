import { describe, it, expect } from "vitest";
import { computeStatus, isNodeUnlockedByThresholdForNode } from "../lib/data/graph-progress";
import { dependenciesOf, dependentsOf } from "../lib/data/graph-deps";
import { TopicNode } from "../lib/data/graph-types";

const nodes: TopicNode[] = [
  { id: "A", label: "A", cluster: "C1", deps: [] },
  { id: "B", label: "B", cluster: "C1", deps: ["A"] },
  { id: "C", label: "C", cluster: "C2", deps: ["B"] },
];

describe("progress & deps", () => {
  it("computeStatus basic", () => {
    expect(computeStatus("A", [], {})).toBe("available");
    expect(computeStatus("B", ["A"], { A: true })).toBe("available");
    expect(computeStatus("B", ["A"], {})).toBe("locked");
  });

  it("unlock threshold", () => {
    const n: TopicNode = { id: "X", label: "X", cluster: "C1", deps: ["A", "B"] };
    expect(isNodeUnlockedByThresholdForNode(n, { A: true, B: false }, 50)).toBe(true);
    expect(isNodeUnlockedByThresholdForNode(n, { A: false, B: false }, 50)).toBe(false);
  });

  it("deps graph", () => {
    expect(dependenciesOf(nodes, "C")).toEqual(["B"]);
    expect(dependentsOf(nodes, "B")).toEqual(["C"]);
  });
});
