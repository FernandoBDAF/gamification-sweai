import {
  RFNodeLike,
  RFNodeData,
  TopicNode,
  TopicStatus,
  PositionedNode,
  BuildHighlight,
} from "../data/graph-types";
import { bucketProgressPct } from "../data/graph-progress";

/** Map domain nodes + positions + statuses → RF nodes (view-only) */
export function buildRFNodes(
  nodes: TopicNode[],
  positions: Record<string, PositionedNode>,
  statuses: Record<string, TopicStatus>,
  highlights: BuildHighlight = {},
  type: "techTree" | "card" = "techTree",
  completed?: Record<string, boolean>
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

    // Compute bucketed progress: completed → 100; else percent of deps satisfied
    let progressPct = 0;
    if (completed && completed[n.id]) {
      progressPct = 100;
    } else if (completed) {
      const total = (n.deps || []).length;
      const met = (n.deps || []).filter((d) => completed[d]).length;
      const pct = total === 0 ? 100 : Math.round((met / total) * 100);
      progressPct = bucketProgressPct(pct);
    } else if (typeof n.progressPct === "number") {
      progressPct = bucketProgressPct(n.progressPct);
    }

    return {
      id: n.id,
      position: { x: pos.x, y: pos.y },
      type,
      data: {
        topic: n,
        status: statuses[n.id] || "available",
        progressPct,
        highlightType,
      },
    };
  });
}
