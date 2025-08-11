import {
  TopicNode,
  LayoutDir,
  LayoutOpts,
  PositionedNode,
  NodeId,
} from "../data/graph-types";

/**
 * Placeholder, deterministic layout until we wire real dagre.
 * - TB: stacks nodes by dependency count (y increases), x by cluster index
 * - LR: x increases by dependency count, y by cluster index
 */
export function layoutDagre(
  nodes: TopicNode[],
  edges: { source: NodeId; target: NodeId }[],
  dir: LayoutDir,
  opts: LayoutOpts
): PositionedNode[] {
  const clusters = Array.from(new Set(nodes.map((n) => n.cluster)));
  const clusterIndex = new Map(clusters.map((c, i) => [c, i]));

  const baseW = 260;
  const baseH = 120;
  const gapX = 120 * (opts.nodeSpacing || 1);
  const gapY = 120 * (opts.nodeSpacing || 1);

  return nodes.map((n) => {
    const depDepth = n.deps?.length ?? 0;
    const col = clusterIndex.get(n.cluster) ?? 0;

    const x = dir === "LR" ? depDepth * (baseW + gapX) : col * (baseW + gapX);
    const y = dir === "LR" ? col * (baseH + gapY) : depDepth * (baseH + gapY);

    return { id: n.id, x, y, width: baseW, height: baseH };
  });
}
