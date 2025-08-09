export type TopicStatus = "locked" | "available" | "completed";
export type ViewMode = "tree" | "cluster" | "matrix";

export interface TopicNode {
  id: string;
  label: string;
  cluster: string;
  xp: number;
  deps: string[];
  links?: { label: string; url: string }[];
}

export interface GraphData {
  nodes: TopicNode[];
}
