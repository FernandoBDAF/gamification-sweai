import { MarkerType, NodeTypes } from "reactflow";
import { CardNode } from "./CardNode";
import { TechTreeNode } from "./TechTreeNode";
import { MAP_CONSTANTS } from "@/lib/map-constants";

export { CardNode } from "./CardNode";
export type { CardNodeData } from "./CardNode";
export { TechTreeNode } from "./TechTreeNode";
export type { TechTreeNodeData } from "./TechTreeNode";
export { DependencyMatrix } from "./DependencyMatrix";
export { DependencyGraph } from "./DependencyGraph";
export { VisualLegend } from "./VisualLegend";
export {
  ClusterVisualization,
  ClusterVisualizationSettings,
} from "./ClusterVisualization";

// Enhanced node types for React Flow with Civilization-inspired design
export const nodeTypes: NodeTypes = {
  card: CardNode as any,
  techTree: TechTreeNode as any,
};

// Enhanced edge options with Civilization-inspired styling
export const defaultEdgeOptions = {
  type: "smoothstep" as const,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color: MAP_CONSTANTS.EDGES.DEFAULT.stroke,
  },
  style: {
    stroke: MAP_CONSTANTS.EDGES.DEFAULT.stroke,
    strokeWidth: MAP_CONSTANTS.EDGES.DEFAULT.strokeWidth,
    opacity: MAP_CONSTANTS.EDGES.DEFAULT.opacity,
  },
};

// Goal path edge options
export const goalPathEdgeOptions = {
  type: "smoothstep" as const,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 18,
    height: 18,
    color: MAP_CONSTANTS.EDGES.ACTIVE_PATH.stroke,
  },
  style: {
    stroke: MAP_CONSTANTS.EDGES.ACTIVE_PATH.stroke,
    strokeWidth: MAP_CONSTANTS.EDGES.ACTIVE_PATH.strokeWidth,
    opacity: MAP_CONSTANTS.EDGES.ACTIVE_PATH.opacity,
    filter: `drop-shadow(${MAP_CONSTANTS.EDGES.ACTIVE_PATH.glow})`,
  },
  animated: MAP_CONSTANTS.EDGES.ACTIVE_PATH.animated,
};

// Cross-cluster edge options
export const crossClusterEdgeOptions = {
  type: "smoothstep" as const,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 14,
    height: 14,
    color: MAP_CONSTANTS.EDGES.CROSS_CLUSTER.stroke,
  },
  style: {
    stroke: MAP_CONSTANTS.EDGES.CROSS_CLUSTER.stroke,
    strokeWidth: MAP_CONSTANTS.EDGES.CROSS_CLUSTER.strokeWidth,
    opacity: MAP_CONSTANTS.EDGES.CROSS_CLUSTER.opacity,
    strokeDasharray: MAP_CONSTANTS.EDGES.CROSS_CLUSTER.strokeDasharray,
  },
};

// Completed path edge options
export const completedPathEdgeOptions = {
  type: "smoothstep" as const,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color: MAP_CONSTANTS.EDGES.COMPLETED_PATH.stroke,
  },
  style: {
    stroke: MAP_CONSTANTS.EDGES.COMPLETED_PATH.stroke,
    strokeWidth: MAP_CONSTANTS.EDGES.COMPLETED_PATH.strokeWidth,
    opacity: MAP_CONSTANTS.EDGES.COMPLETED_PATH.opacity,
  },
};
