import { describe, it, expect } from "vitest";
import { filterByClusters, filterBySearch, visibleNodes } from "../lib/data/graph-selectors";
import { TopicNode } from "../lib/data/graph-types";

const nodes: TopicNode[] = [
  { id: "a", label: "Alpha", cluster: "C1", deps: [] },
  { id: "b", label: "Beta", cluster: "C1", deps: [] },
  { id: "c", label: "Gamma", cluster: "C2", deps: [] },
];

describe("selectors", () => {
  it("filters by clusters", () => {
    expect(filterByClusters(nodes, ["C1"]).map(n => n.id)).toEqual(["a", "b"]);
  });

  it("filters by search", () => {
    expect(filterBySearch(nodes, "amm").map(n => n.id)).toEqual(["c"]);
  });

  it("visibleNodes combines filters", () => {
    const out = visibleNodes(nodes, {
      selectedClusters: ["C1"],
      search: "a",
      hideCompleted: false,
      completedMap: {},
    });
    expect(out.map(n => n.id)).toEqual(["a"]);
  });
});
