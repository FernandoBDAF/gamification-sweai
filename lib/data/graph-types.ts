// Central types and enums used across the app

export type NodeId = string;
export type ClusterId = string;

export type TopicStatus = "locked" | "available" | "completed";
export type ViewMode = "tree" | "cluster" | "matrix"; // extend if needed
export type ViewLevel = "overview" | "cluster" | "detail";
export type LayoutDir = "TB" | "LR";

export interface TopicNode {
  id: NodeId;
  label: string;
  cluster: ClusterId;
  deps: NodeId[];
  xp?: number;
  progressPct?: number; // 0..100, for UI emphasis (always show)
  links?: string[];
}

export interface PositionedNode {
  id: NodeId;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BuiltEdge {
  id: string;
  source: NodeId;
  target: NodeId;
  onGoalPath?: boolean;
  style?: React.CSSProperties;
  markerEnd?: any; // ReactFlow marker type (kept generic)
}

export interface RFNodeData {
  topic: TopicNode;
  status: TopicStatus;
  progressPct: number;
  highlightType?: "primary" | "dependency" | "dependent" | null;
}

export interface RFNodeLike {
  id: string;
  position: { x: number; y: number };
  data: RFNodeData;
  type: "techTree" | "card";
}

export interface LayoutOpts {
  nodeSpacing: number; // multiplier, 1 = base spacing
  clusterSpacing: boolean;
  expanded: boolean;
}

export interface BuildHighlight {
  focus?: NodeId;
  deps?: Set<NodeId>;
  dependents?: Set<NodeId>;
}

export type CompletedMap = Record<NodeId, boolean>;
