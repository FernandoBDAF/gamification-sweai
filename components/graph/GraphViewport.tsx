import React from "react";
import ReactFlow, { Edge, Node, NodeTypes, Controls, Background, MiniMap } from "reactflow";

export type GraphViewportProps = {
  nodes: Node<any>[];
  edges: Edge<any>[];
  nodeTypes: NodeTypes;
  defaultEdgeOptions: any;
  onNodeMouseEnter?: (e: any, node: any) => void;
  onNodeMouseLeave?: () => void;
  onPaneClick?: () => void;
  onMoveStart?: () => void;
  onMoveEnd?: () => void;
  onNodeClick?: (e: any, node: any) => void;
  onNodeDoubleClick?: (e: any, node: any) => void;
  showMiniMap?: boolean;
  children?: React.ReactNode;
};

export const GraphViewport: React.FC<GraphViewportProps> = ({
  nodes,
  edges,
  nodeTypes,
  defaultEdgeOptions,
  onNodeMouseEnter,
  onNodeMouseLeave,
  onPaneClick,
  onMoveStart,
  onMoveEnd,
  onNodeClick,
  onNodeDoubleClick,
  showMiniMap = true,
  children,
}) => {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      className="!w-full !h-full"
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      fitView
      fitViewOptions={{ padding: 0.1 }}
      minZoom={1}
      maxZoom={1}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      proOptions={{ hideAttribution: true }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={true}
      onNodeMouseEnter={onNodeMouseEnter}
      onNodeMouseLeave={onNodeMouseLeave}
      onPaneClick={onPaneClick}
      onMoveStart={onMoveStart}
      onMoveEnd={onMoveEnd}
      onNodeClick={onNodeClick}
      onNodeDoubleClick={onNodeDoubleClick}
    >
      {showMiniMap && (
        <MiniMap zoomable={false} pannable={false} position="bottom-right" />
      )}
      <Controls position="top-right" showZoom={false} showFitView={true} showInteractive={false} />
      <Background gap={24} size={1} color="#e5e7eb" style={{ backgroundColor: "#fafafa" }} />
      {children}
    </ReactFlow>
  );
}; 