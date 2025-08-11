// tests/unlock.test.ts
import { describe, it, expect } from "vitest";
import {
  isNodeUnlockedByThreshold,
  isClusterUnlocked,
} from "@/lib/data/graph-progress";

const nodes = [
  { id: "A", cluster: "C1", deps: [] },
  { id: "B", cluster: "C1", deps: ["A"] },
  { id: "X", cluster: "C2", deps: [] },
  { id: "Y", cluster: "C1", deps: ["X"] }, // cross-cluster prereq C2 -> C1
] as any;

describe("unlock predicates", () => {
  it("node unlocks at 75% deps threshold", () => {
    expect(
      isNodeUnlockedByThreshold(
        ["A", "B", "C", "D"],
        { A: true, B: true, C: false, D: false },
        75
      )
    ).toBe(false);
    expect(
      isNodeUnlockedByThreshold(
        ["A", "B", "C", "D"],
        { A: true, B: true, C: true, D: false },
        75
      )
    ).toBe(true);
  });

  it("cluster unlocks when prerequisite clusters are ≥75% complete", () => {
    // C1 requires C2 because Y depends on X
    const completed = { X: true } as Record<string, boolean>;
    // With only X in C2, that cluster is 100% by count for this dataset → C1 unlocks at 75%
    expect(isClusterUnlocked("C1", nodes, completed, 0.75)).toBe(true);
  });
});
