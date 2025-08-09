import dagre from "dagre";
import { TopicNode } from "./types";

export interface LayoutNode {
  id: string;
  position: { x: number; y: number };
  data: any;
}

export interface LayoutEdge {
  id: string;
  source: string;
  target: string;
}

const nodeWidth = 300;
const nodeHeight = 160;

export function getLayoutedElements(
  nodes: TopicNode[],
  direction: "TB" | "LR" = "TB"
): { nodes: LayoutNode[]; edges: LayoutEdge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 100,
    ranksep: 150,
    marginx: 50,
    marginy: 50,
  });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges based on dependencies
  const edges: LayoutEdge[] = [];
  nodes.forEach((node) => {
    node.deps.forEach((dep) => {
      const edgeId = `${dep}-${node.id}`;
      dagreGraph.setEdge(dep, node.id);
      edges.push({
        id: edgeId,
        source: dep,
        target: node.id,
      });
    });
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Get positioned nodes
  const layoutedNodes: LayoutNode[] = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      id: node.id,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      data: node,
    };
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
}

export function getClusterLayoutedElements(
  nodes: TopicNode[],
  clusterFilter: string,
  direction: "TB" | "LR" = "TB"
): { nodes: LayoutNode[]; edges: LayoutEdge[] } {
  // For cluster view, layout only nodes from the selected cluster
  const clusterNodes = nodes.filter((n) => n.cluster === clusterFilter);

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 80,
    ranksep: 120,
    marginx: 30,
    marginy: 30,
  });

  // Add cluster nodes to dagre graph
  clusterNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges only within the cluster
  const edges: LayoutEdge[] = [];
  clusterNodes.forEach((node) => {
    node.deps.forEach((dep) => {
      // Only add edge if both nodes are in the same cluster
      if (clusterNodes.find((n) => n.id === dep)) {
        const edgeId = `${dep}-${node.id}`;
        dagreGraph.setEdge(dep, node.id);
        edges.push({
          id: edgeId,
          source: dep,
          target: node.id,
        });
      }
    });
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Get positioned nodes
  const layoutedNodes: LayoutNode[] = clusterNodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      id: node.id,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      data: node,
    };
  });

  // Add cross-cluster edges (faded)
  nodes.forEach((node) => {
    node.deps.forEach((dep) => {
      const depNode = nodes.find((n) => n.id === dep);
      if (
        depNode &&
        (depNode.cluster !== clusterFilter || node.cluster !== clusterFilter)
      ) {
        // This is a cross-cluster edge - add it but mark it as faded
        const edgeId = `${dep}-${node.id}-cross`;
        edges.push({
          id: edgeId,
          source: dep,
          target: node.id,
        });
      }
    });
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
}
