// lib/data/io.ts
import type { TopicNode } from "@/lib/types";

export function exportPanel(nodes: TopicNode[]): string {
  const payload = { version: 1, nodes };
  return JSON.stringify(payload, null, 2);
}

export function importPanel(json: string): TopicNode[] {
  const parsed = JSON.parse(json);
  if (!parsed || typeof parsed !== "object") throw new Error("Invalid JSON");
  const nodes = (parsed.nodes || []) as TopicNode[];
  // Basic validation
  nodes.forEach((n) => {
    if (!n.id || !n.label || !n.cluster || !Array.isArray(n.deps)) {
      throw new Error("Invalid TopicNode shape");
    }
  });
  return nodes;
}
