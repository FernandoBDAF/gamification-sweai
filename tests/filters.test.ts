// tests/filters.test.ts
import { describe, it, expect } from "vitest";
import { deriveFilteredNodes } from "@/lib/data/filters";

const nodes = [
  { id: "A", label: "Alpha", cluster: "C1", deps: [], xp: 10 },
  { id: "B", label: "Beta", cluster: "C1", deps: ["A"], xp: 10 },
  { id: "C", label: "Gamma", cluster: "C2", deps: [], xp: 10 },
] as any;

describe("deriveFilteredNodes", () => {
  it("respects hideCompleted and showOnlyUnlockable", () => {
    const completed = { A: true } as Record<string, boolean>;
    const out = deriveFilteredNodes(nodes as any, {
      clusterFilter: "ALL",
      completed,
      hideCompleted: true,
      showOnlyUnlockable: true,
    });
    // A is completed (hidden), B is unlocked (not shown when only unlockable=false)
    expect(out.find((n) => n.id === "A")).toBeUndefined();
    expect(out.find((n) => n.id === "B")).toBeDefined();
  });

  it("filters by cluster and search", () => {
    const out = deriveFilteredNodes(nodes as any, {
      clusterFilter: "C1",
      completed: {},
      search: "alp",
    });
    expect(out.length).toBe(1);
    expect(out[0].id).toBe("A");
  });
});
