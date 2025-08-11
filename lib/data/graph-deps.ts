import { TopicNode, NodeId } from "./graph-types";

export function dependenciesOf(nodes: TopicNode[], id: NodeId): NodeId[] {
  const n = nodes.find(n => n.id === id);
  return n?.deps ? [...n.deps] : [];
}

export function dependentsOf(nodes: TopicNode[], id: NodeId): NodeId[] {
  return nodes.filter(n => n.deps.includes(id)).map(n => n.id);
}

/** Direct deps & direct dependents. Extend later for transitive if needed. */
export function subgraphForNode(nodes: TopicNode[], id: NodeId): {
  deps: NodeId[];
  dependents: NodeId[];
} {
  return {
    deps: dependenciesOf(nodes, id),
    dependents: dependentsOf(nodes, id),
  };
}
