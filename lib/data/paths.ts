import type { TopicNode } from "@/lib/utils/types";

export function findPathBFS(
  nodes: TopicNode[],
  fromId: string,
  toId: string
): string[] {
  if (!fromId || !toId) return [];
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  if (!byId[fromId] || !byId[toId]) return [];

  const queue: string[] = [fromId];
  const visited = new Set<string>([fromId]);
  const parent: Record<string, string | undefined> = {};

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur === toId) break;
    const neighbors = nodes
      .filter((n) => n.deps.includes(cur))
      .map((n) => n.id);
    for (const nxt of neighbors) {
      if (visited.has(nxt)) continue;
      visited.add(nxt);
      parent[nxt] = cur;
      queue.push(nxt);
    }
  }

  if (!visited.has(toId)) return [];

  const path: string[] = [];
  let cur: string | undefined = toId;
  while (cur !== undefined) {
    path.push(cur);
    cur = parent[cur];
  }
  path.reverse();
  return path;
}

export function computePredecessorSet(
  nodes: TopicNode[],
  goalId: string
): Set<string> {
  if (!goalId) return new Set();
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  if (!byId[goalId]) return new Set();

  const predecessors = new Set<string>([goalId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of Array.from(predecessors)) {
      const n = byId[id];
      if (!n) continue;
      for (const dep of n.deps || []) {
        if (!predecessors.has(dep)) {
          predecessors.add(dep);
          changed = true;
        }
      }
    }
  }
  return predecessors;
}
