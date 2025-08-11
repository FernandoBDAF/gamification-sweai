import { Pt } from "./cluster-geometry";

export interface ClusterStyle {
  primary: string;     // hex
  background: string;  // CSS color
  text: string;        // CSS color
}

export function styleForCluster(
  clusterId: string
): ClusterStyle {
  // TODO: hook into your theme map; placeholders for now
  const palette: Record<string, ClusterStyle> = {
    C1: { primary: "#0284c7", background: "rgba(2,132,199,0.10)", text: "#0f172a" },
    C2: { primary: "#059669", background: "rgba(5,150,105,0.10)", text: "#0f172a" },
  };
  return palette[clusterId] || { primary: "#64748b", background: "rgba(100,116,139,0.10)", text: "#0f172a" };
}

export function overlayFill(primary: string, alpha = 0.18): string {
  return hexToRgba(primary, alpha) || primary;
}

export function hexToRgba(hex: string, alpha: number): string | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return null;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
