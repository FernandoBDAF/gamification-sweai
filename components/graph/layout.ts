import dagre from "dagre";
import { TopicNode } from "@/lib/types";
import { MAP_CONSTANTS } from "@/lib/map-constants";

export type LayoutDirection = "TB" | "BT" | "LR" | "RL";
export type SizeVariant = "compact" | "standard" | "expanded";

interface LayoutOptions {
  direction: LayoutDirection;
  sizeVariant: SizeVariant;
  clusterSpacing?: boolean;
  expandedSpacing?: boolean; // For detail view
  nodeSpacing?: number; // Multiplier for node spacing
  focusedCluster?: string; // For cluster-focused layouts
}

export interface LayoutedNode {
  id: string;
  position: { x: number; y: number };
  data: TopicNode;
}

// Simplified layout function that works reliably with enhanced spacing options
export function layoutDagre(
  nodes: TopicNode[],
  edges: Array<{ source: string; target: string }>,
  direction: LayoutDirection = "TB",
  sizeVariant: SizeVariant = "standard",
  options: Partial<LayoutOptions> = {}
): {
  nodes: LayoutedNode[];
  edges: Array<{ source: string; target: string }>;
} {
  const g = new dagre.graphlib.Graph();

  // Enhanced spacing based on options
  const baseHorizontalSpacing = MAP_CONSTANTS.NODE.SPACING.HORIZONTAL;
  const baseVerticalSpacing = MAP_CONSTANTS.NODE.SPACING.VERTICAL;

  const horizontalSpacing = baseHorizontalSpacing * (options.nodeSpacing || 1);
  const verticalSpacing = baseVerticalSpacing * (options.nodeSpacing || 1);

  // Enhanced graph settings for different view modes
  g.setGraph({
    rankdir: direction,
    nodesep: horizontalSpacing,
    ranksep: verticalSpacing,
    marginx: options.expandedSpacing ? 80 : 40,
    marginy: options.expandedSpacing ? 80 : 40,
  });

  g.setDefaultEdgeLabel(() => ({}));

  // Get node dimensions based on size variant
  const getNodeDimensions = (variant: SizeVariant) => {
    return {
      width:
        MAP_CONSTANTS.NODE.WIDTH[
          variant.toUpperCase() as keyof typeof MAP_CONSTANTS.NODE.WIDTH
        ],
      height:
        MAP_CONSTANTS.NODE.HEIGHT[
          variant.toUpperCase() as keyof typeof MAP_CONSTANTS.NODE.HEIGHT
        ],
    };
  };

  const { width: nodeWidth, height: nodeHeight } =
    getNodeDimensions(sizeVariant);

  // Add nodes to graph
  nodes.forEach((node) => {
    // Enhanced node size for focused clusters
    let adjustedWidth = nodeWidth;
    let adjustedHeight = nodeHeight;

    if (options.focusedCluster === node.cluster) {
      adjustedWidth *= 1.1;
      adjustedHeight *= 1.1;
    }

    g.setNode(node.id, {
      width: adjustedWidth,
      height: adjustedHeight,
      cluster: node.cluster,
    });
  });

  // Add edges to graph
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // Run layout
  dagre.layout(g);

  // Extract positioned nodes
  const layoutedNodes: LayoutedNode[] = nodes.map((node) => ({
    id: node.id,
    position: {
      x: g.node(node.id).x - g.node(node.id).width / 2,
      y: g.node(node.id).y - g.node(node.id).height / 2,
    },
    data: node,
  }));

  return { nodes: layoutedNodes, edges };
}

// Specialized layout for cluster focus mode
export function layoutClusterFocus(
  nodes: TopicNode[],
  edges: Array<{ source: string; target: string }>,
  focusedCluster: string,
  direction: LayoutDirection = "TB",
  sizeVariant: SizeVariant = "expanded"
): {
  nodes: LayoutedNode[];
  edges: Array<{ source: string; target: string }>;
} {
  // Filter nodes to focus on the specified cluster and its immediate dependencies
  const clusterNodes = nodes.filter((n) => n.cluster === focusedCluster);
  const clusterNodeIds = new Set(clusterNodes.map((n) => n.id));

  // Include nodes that are dependencies of cluster nodes or depend on cluster nodes
  const relatedNodes = nodes.filter((n) => {
    if (clusterNodeIds.has(n.id)) return true;

    // Check if this node is a dependency of any cluster node
    const isDependency = clusterNodes.some((cn) => cn.deps.includes(n.id));

    // Check if this node depends on any cluster node
    const dependsOnCluster = n.deps.some((dep) => clusterNodeIds.has(dep));

    return isDependency || dependsOnCluster;
  });

  // Filter edges to only include relevant connections
  const relevantEdges = edges.filter((edge) => {
    const sourceIncluded = relatedNodes.some((n) => n.id === edge.source);
    const targetIncluded = relatedNodes.some((n) => n.id === edge.target);
    return sourceIncluded && targetIncluded;
  });

  return layoutDagre(relatedNodes, relevantEdges, direction, sizeVariant, {
    focusedCluster,
  });
}

// ENHANCED: Overview layout with better cluster separation
export function layoutOverview(
  nodes: TopicNode[],
  edges: Array<{ source: string; target: string }>,
  direction: LayoutDirection = "TB",
  sizeVariant: SizeVariant = "compact"
): { nodes: LayoutedNode[]; edges: Array<{ source: string; target: string }> } {
  // Use compact size for overview with extra spacing
  return layoutDagre(nodes, edges, direction, sizeVariant, {
    clusterSpacing: true,
    nodeSpacing: 0.8, // Tighter spacing for overview
    expandedSpacing: false,
  });
}
