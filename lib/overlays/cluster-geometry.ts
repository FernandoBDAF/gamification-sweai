// Pure geometry helpers (convex hull, inflate, rounded SVG path)

export interface Pt { x: number; y: number; }

export function convexHull(points: Pt[]): Pt[] {
  if (points.length <= 3) return points.slice();
  const pts = points.slice().sort((a, b) => (a.x - b.x) || (a.y - b.y));

  const cross = (o: Pt, a: Pt, b: Pt) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower: Pt[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }

  const upper: Pt[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }

  upper.pop(); lower.pop();
  return lower.concat(upper);
}

export function inflateHull(hull: Pt[], padding: number): Pt[] {
  if (hull.length === 0) return [];
  if (hull.length <= 2) {
    // Simple bbox inflate
    const xs = hull.map(p => p.x), ys = hull.map(p => p.y);
    return [
      { x: Math.min(...xs) - padding, y: Math.min(...ys) - padding },
      { x: Math.max(...xs) + padding, y: Math.min(...ys) - padding },
      { x: Math.max(...xs) + padding, y: Math.max(...ys) + padding },
      { x: Math.min(...xs) - padding, y: Math.max(...ys) + padding },
    ];
  }
  // Naive radial inflate: move each vertex outward from centroid
  const cx = hull.reduce((s, p) => s + p.x, 0) / hull.length;
  const cy = hull.reduce((s, p) => s + p.y, 0) / hull.length;
  return hull.map(p => {
    const vx = p.x - cx, vy = p.y - cy;
    const len = Math.sqrt(vx * vx + vy * vy) || 1;
    return { x: p.x + (padding * vx) / len, y: p.y + (padding * vy) / len };
  });
}

export function roundedPath(points: Pt[], r: number): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  const pts = points.slice();
  let d = "";
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[(i - 1 + pts.length) % pts.length];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];
    const v1x = p1.x - p0.x, v1y = p1.y - p0.y;
    const v2x = p2.x - p1.x, v2y = p2.y - p1.y;
    const len1 = Math.hypot(v1x, v1y) || 1;
    const len2 = Math.hypot(v2x, v2y) || 1;
    const r1 = Math.min(r, len1 / 2);
    const r2 = Math.min(r, len2 / 2);

    const pA = { x: p1.x - (v1x / len1) * r1, y: p1.y - (v1y / len1) * r1 };
    const pB = { x: p1.x + (v2x / len2) * r2, y: p1.y + (v2y / len2) * r2 };

    if (i === 0) d += `M ${pA.x} ${pA.y} `;
    else d += `L ${pA.x} ${pA.y} `;
    d += `Q ${p1.x} ${p1.y} ${pB.x} ${pB.y} `;
  }
  d += "Z";
  return d;
}
