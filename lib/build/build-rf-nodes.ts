import {
  RFNodeLike,
  RFNodeData,
  TopicNode,
  TopicStatus,
  PositionedNode,
  BuildHighlight,
} from "../data/graph-types";

/** Map domain nodes + positions + statuses → RF nodes (view-only) */
export function buildRFNodes(
  nodes: TopicNode[],
  positions: Record<string, PositionedNode>,
  statuses: Record<string, TopicStatus>,
  highlights: BuildHighlight = {},
  type: "techTree" | "card" = "techTree"
): RFNodeLike[] {
  return nodes.map((n) => {
    const pos = positions[n.id] || {
      id: n.id,
      x: 0,
      y: 0,
      width: 240,
      height: 120,
    };

    let highlightType: RFNodeData["highlightType"] = null;
    if (highlights.focus) {
      if (highlights.focus === n.id) highlightType = "primary";
      else if (highlights.deps?.has(n.id)) highlightType = "dependency";
      else if (highlights.dependents?.has(n.id)) highlightType = "dependent";
    }

    return {
      id: n.id,
      position: { x: pos.x, y: pos.y },
      type,
      data: {
        topic: n,
        status: statuses[n.id] || "available",
        progressPct: typeof n.progressPct === "number" ? n.progressPct : 0,
        highlightType,
      },
    };
  });
}
