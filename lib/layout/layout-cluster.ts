import {
  TopicNode,
  LayoutDir,
  LayoutOpts,
  PositionedNode,
} from "../data/graph-types";

/** Focus a cluster: compress its nodes; place others dimly to the side (placeholder). */
export function layoutClusterFocus(
  nodes: TopicNode[],
  clusterId: string,
  dir: LayoutDir,
  opts: LayoutOpts
): PositionedNode[] {
  const focused = nodes.filter((n) => n.cluster === clusterId);
  const others = nodes.filter((n) => n.cluster !== clusterId);

  const baseW = 260;
  const baseH = 120;
  const gapX = 100 * (opts.nodeSpacing || 1);
  const gapY = 100 * (opts.nodeSpacing || 1);

  const out: PositionedNode[] = [];

  // Focused cluster: centered band
  focused.forEach((n, i) => {
    out.push({
      id: n.id,
      x: dir === "LR" ? 400 : 100,
      y: dir === "LR" ? 100 + i * (baseH + gapY) : 100 + i * (baseH + gapY),
      width: baseW,
      height: baseH,
    });
  });

  // Others: off to the side
  others.forEach((n, i) => {
    out.push({
      id: n.id,
      x: dir === "LR" ? 100 : 500,
      y: dir === "LR" ? 100 + i * (baseH * 0.7) : 100 + i * (baseH * 0.7),
      width: baseW,
      height: baseH,
    });
  });

  return out;
}
