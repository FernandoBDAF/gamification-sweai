import { describe, it, expect } from "vitest";
import { convexHull, inflateHull, roundedPath } from "../lib/overlays/cluster-geometry";

describe("cluster geometry", () => {
  it("convexHull basic", () => {
    const hull = convexHull([{x:0,y:0},{x:10,y:0},{x:0,y:10},{x:10,y:10},{x:5,y:5}]);
    expect(hull.length).toBeGreaterThanOrEqual(3);
  });

  it("inflateHull returns same count", () => {
    const base = [{x:0,y:0},{x:10,y:0},{x:10,y:10},{x:0,y:10}];
    const inf = inflateHull(base, 5);
    expect(inf.length).toBe(base.length);
  });

  it("roundedPath closes", () => {
    const d = roundedPath([{x:0,y:0},{x:10,y:0},{x:10,y:10},{x:0,y:10}], 4);
    expect(d.endsWith("Z")).toBe(true);
  });
});
