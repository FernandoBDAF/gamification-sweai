// lib/cluster-geometry.ts
export type XY = { x: number; y: number };

/** Andrew's monotone chain convex hull: O(n log n) */
export function convexHull(points: XY[]): XY[] {
  const pts = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  if (pts.length <= 1) return pts;

  const cross = (o: XY, a: XY, b: XY) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower: XY[] = [];
  for (const p of pts) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    ) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: XY[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    ) {
      upper.pop();
    }
    upper.push(p);
  }

  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

/** Inflate polygon by naive vertex normals (good enough for our soft padding) */
export function inflateHull(hull: XY[], padding: number): XY[] {
  if (hull.length <= 2 || padding === 0) return hull;
  const n = hull.length;
  const out: XY[] = [];

  const unit = (dx: number, dy: number) => {
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
  };

  for (let i = 0; i < n; i++) {
    const prev = hull[(i - 1 + n) % n];
    const curr = hull[i];
    const next = hull[(i + 1) % n];

    // edge normals (rotate left)
    const e1 = unit(curr.x - prev.x, curr.y - prev.y);
    const n1 = { x: -e1.y, y: e1.x };
    const e2 = unit(next.x - curr.x, next.y - curr.y);
    const n2 = { x: -e2.y, y: e2.x };

    // average normals
    let nx = n1.x + n2.x;
    let ny = n1.y + n2.y;
    const len = Math.hypot(nx, ny) || 1;
    nx /= len;
    ny /= len;

    out.push({ x: curr.x + nx * padding, y: curr.y + ny * padding });
  }
  return out;
}

/** Rounded polygon SVG path using quadratic curves between vertices */
export function roundedPath(hull: XY[], radius: number): string {
  if (hull.length === 0) return "";
  if (hull.length === 1) {
    const p = hull[0];
    return `M ${p.x} ${p.y} m -${radius},0 a ${radius},${radius} 0 1,0 ${
      radius * 2
    },0 a ${radius},${radius} 0 1,0 -${radius * 2},0`;
  }
  const n = hull.length;
  const r = Math.max(0, radius);
  let d = "";

  for (let i = 0; i < n; i++) {
    const p0 = hull[(i - 1 + n) % n];
    const p1 = hull[i];
    const p2 = hull[(i + 1) % n];

    const v1x = p1.x - p0.x,
      v1y = p1.y - p0.y;
    const v2x = p2.x - p1.x,
      v2y = p2.y - p1.y;

    const len1 = Math.hypot(v1x, v1y) || 1;
    const len2 = Math.hypot(v2x, v2y) || 1;

    const inX = v1x / len1,
      inY = v1y / len1;
    const outX = v2x / len2,
      outY = v2y / len2;

    const pA = { x: p1.x - inX * r, y: p1.y - inY * r };
    const pB = { x: p1.x + outX * r, y: p1.y + outY * r };

    if (i === 0) d += `M ${pA.x} ${pA.y}`;
    else d += ` L ${pA.x} ${pA.y}`;
    d += ` Q ${p1.x} ${p1.y} ${pB.x} ${pB.y}`;
  }
  d += " Z";
  return d;
}
