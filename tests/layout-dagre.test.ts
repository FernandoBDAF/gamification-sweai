import { describe, it, expect } from "vitest";
import { layoutDagre } from "@/lib/layout/dagre";

const nodes = [
  { id: "A", label: "A", cluster: "C1", deps: [] },
  { id: "B", label: "B", cluster: "C1", deps: ["A"] },
] as any;
const edges = [{ source: "A", target: "B" }];

describe("layoutDagre", () => {
  it("returns positions for each input node", () => {
    const out = layoutDagre(nodes as any, edges, "TB", "standard");
    expect(out.nodes.length).toBe(nodes.length);
    expect(out.edges.length).toBe(edges.length);
    expect(out.nodes[0]).toHaveProperty("position");
  });
});
