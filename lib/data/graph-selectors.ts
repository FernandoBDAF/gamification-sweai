import { TopicNode, NodeId } from "./graph-types";

// Basic, pure filters. Start simple and extend as needed.

export function filterByClusters(
  nodes: TopicNode[],
  selected: string[]
): TopicNode[] {
  if (!selected || selected.length === 0) return nodes;
  const set = new Set(selected);
  return nodes.filter((n) => set.has(n.cluster));
}

export function filterBySearch(nodes: TopicNode[], q: string): TopicNode[] {
  if (!q) return nodes;
  const term = q.toLowerCase();
  // Prefer exact ID match when present (case-insensitive)
  const exactId = nodes.find((n) => n.id.toLowerCase() === term);
  if (exactId) return [exactId];
  return nodes.filter(
    (n) =>
      n.id.toLowerCase().includes(term) || n.label.toLowerCase().includes(term)
  );
}

export function filterHideCompleted(
  nodes: TopicNode[],
  completed: Record<NodeId, boolean>
): TopicNode[] {
  return nodes.filter((n) => !completed[n.id]);
}

export function visibleNodes(
  nodes: TopicNode[],
  opts: {
    selectedClusters: string[];
    search: string;
    hideCompleted: boolean;
    completedMap: Record<NodeId, boolean>;
  }
): TopicNode[] {
  let out = nodes.slice();
  out = filterByClusters(out, opts.selectedClusters);
  out = filterBySearch(out, opts.search);
  if (opts.hideCompleted) out = filterHideCompleted(out, opts.completedMap);
  return out;
}
