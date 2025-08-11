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
  it("node unlocks at 100% deps threshold", () => {
    expect(isNodeUnlockedByThreshold(["A"], { A: false }, 100)).toBe(false);
    expect(isNodeUnlockedByThreshold(["A"], { A: true }, 100)).toBe(true);
  });

  it("cluster unlocks when prerequisite clusters are complete", () => {
    // C1 requires C2 because Y depends on X
    const completed = { X: true } as Record<string, boolean>;
    // Only X complete (C2 not fully complete by count, but threshold is per-cluster completion)
    // With only X in C2, it's 100% complete, so C1 should unlock
    expect(isClusterUnlocked("C1", nodes, completed, 100)).toBe(true);
  });
});
