import React, { useMemo, useRef, useCallback } from "react";
import { Node, Edge, useStore } from "reactflow";
import { GraphViewport } from "./GraphViewport";
import { nodeTypes, defaultEdgeOptions } from "./index";
import type { TopicNode } from "@/lib/utils/types";
import { buildEdges as buildStyledEdges } from "@/lib/build/build-edges";

export type GraphContainerProps = {
  rfNodes: Node<any>[];
  layoutedEdges: Array<{ source: string; target: string }>;
  statuses: Record<string, "locked" | "available" | "completed">;
  filteredNodes: TopicNode[];
  activeNodeId?: string | null;
  dependencyIds: Set<string>;
  dependentIds: Set<string>;
  onNodeMouseEnter?: (e: any, node: any) => void;
  onNodeMouseLeave?: () => void;
  onPaneClick?: () => void;
  onMoveStart?: () => void;
  onMoveEnd?: () => void;
  onNodeClick?: (e: any, node: any) => void;
  onNodeDoubleClick?: (e: any, node: any) => void;
  overlays?: React.ReactNode;
};

export const GraphContainer: React.FC<GraphContainerProps> = ({
  rfNodes,
  layoutedEdges,
  statuses,
  filteredNodes,
  activeNodeId,
  dependencyIds,
  dependentIds,
  onNodeMouseEnter,
  onNodeMouseLeave,
  onPaneClick,
  onMoveStart,
  onMoveEnd,
  onNodeClick,
  onNodeDoubleClick,
  overlays,
}) => {
  const renderCountsRef = useRef<{ nodes: number; edges: number }>({ nodes: 0, edges: 0 });
  const [tx, ty, k] = useStore((s) => s.transform);

  const rfEdges: Edge[] = useMemo(() => {
    renderCountsRef.current.edges++;
    const inputs = layoutedEdges.map((e) => ({ source: e.source, target: e.target }));
    return buildStyledEdges(
      inputs,
      statuses as any,
      dependencyIds,
      dependentIds,
      activeNodeId || undefined
    );
  }, [layoutedEdges, statuses, dependencyIds, dependentIds, activeNodeId]);

  return (
    <div className="relative h-full w-full min-w-0 overflow-hidden">
      <GraphViewport
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onPaneClick={onPaneClick}
        onMoveStart={onMoveStart}
        onMoveEnd={onMoveEnd}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
      >
        {overlays}
      </GraphViewport>
    </div>
  );
}; 