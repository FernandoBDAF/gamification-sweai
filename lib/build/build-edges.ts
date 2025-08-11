import { MarkerType, Edge } from "reactflow";

export interface BuildEdgeInput {
  source: string;
  target: string;
}

export function buildEdges(
  edges: BuildEdgeInput[],
  statuses: Record<string, "locked" | "available" | "completed">,
  dependencyIds: Set<string>,
  dependentIds: Set<string>,
  activeNodeId?: string
): Edge[] {
  return edges.map((e) => {
    const isCompleted =
      statuses[e.source] === "completed" && statuses[e.target] === "completed";
    const isPartial =
      statuses[e.source] === "completed" || statuses[e.target] === "completed";

    const base: Edge = {
      id: `${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      type: "smoothstep",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 14,
        height: 14,
        color: "#94a3b8",
      },
      style: { stroke: "#94a3b8", strokeWidth: 2, opacity: 0.6 },
      animated: false,
    };

    if (activeNodeId) {
      if (e.target === activeNodeId && dependencyIds.has(e.source)) {
        base.style = {
          ...base.style,
          stroke: "#f59e0b",
          strokeWidth: 3,
          opacity: 0.95,
        };
        base.markerEnd = {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: "#f59e0b",
        };
        base.animated = true;
        return base;
      }
      if (e.source === activeNodeId && dependentIds.has(e.target)) {
        base.style = {
          ...base.style,
          stroke: "#10b981",
          strokeWidth: 3,
          opacity: 0.95,
        };
        base.markerEnd = {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: "#10b981",
        };
        base.animated = true;
        return base;
      }
    }

    if (isCompleted) {
      base.style = {
        ...base.style,
        stroke: "#10b981",
        strokeWidth: 2.5,
        opacity: 0.85,
      };
      base.markerEnd = {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: "#10b981",
      };
      return base;
    }

    if (isPartial) {
      base.style = { ...base.style, stroke: "#6b7280", opacity: 0.75 };
      return base;
    }

    return base;
  });
}
