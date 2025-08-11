// lib/data/filters.ts
import type { TopicNode } from "@/lib/types";
import { computeStatus } from "@/lib/gamification";

export interface FilterOptions {
  clusterFilter?: string;
  clusterFilters?: string[];
  hideCompleted?: boolean;
  showOnlyUnlockable?: boolean;
  search?: string;
  completed: Record<string, boolean>;
}

export function deriveFilteredNodes(
  nodes: TopicNode[],
  opts: FilterOptions
): TopicNode[] {
  const {
    clusterFilter = "ALL",
    clusterFilters = [],
    hideCompleted = false,
    showOnlyUnlockable = false,
    search = "",
    completed,
  } = opts;

  return nodes.filter((n) => {
    const status = computeStatus(n.id, n.deps, completed);
    const multiActive = clusterFilters && clusterFilters.length > 0;
    const includeByCluster = multiActive
      ? clusterFilters.includes(n.cluster)
      : clusterFilter === "ALL" || n.cluster === clusterFilter;
    const includeByStatus = !hideCompleted || status !== "completed";
    const includeUnlockable = !showOnlyUnlockable || status !== "locked";
    const includeSearch =
      !search ||
      n.label.toLowerCase().includes(search.toLowerCase()) ||
      n.id.toLowerCase().includes(search.toLowerCase());

    return (
      includeByCluster && includeByStatus && includeUnlockable && includeSearch
    );
  });
}
