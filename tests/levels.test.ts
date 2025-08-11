// tests/levels.test.ts
import { describe, it, expect } from "vitest";
import { computeClusterDepths } from "@/lib/layout/align";

const nodes = [
  { id: "A", label: "A", cluster: "C1", deps: [], xp: 0 },
  { id: "B", label: "B", cluster: "C1", deps: ["A"], xp: 0 },
  { id: "C", label: "C", cluster: "C1", deps: ["A"], xp: 0 },
  { id: "D", label: "D", cluster: "C1", deps: ["B", "C"], xp: 0 },
  { id: "X", label: "X", cluster: "C2", deps: [], xp: 0 },
  { id: "Y", label: "Y", cluster: "C2", deps: ["X"], xp: 0 },
] as any;

describe("computeClusterDepths", () => {
  it("assigns consistent depths within a cluster", () => {
    const depths = computeClusterDepths(nodes as any);
    // A at depth 0
    expect(depths.C1.A).toBe(0);
    // B and C share the same depth (1)
    expect(depths.C1.B).toBe(1);
    expect(depths.C1.C).toBe(1);
    // D depends on B and C so depth 2
    expect(depths.C1.D).toBe(2);
    // Independent second cluster
    expect(depths.C2.X).toBe(0);
    expect(depths.C2.Y).toBe(1);
  });
});
