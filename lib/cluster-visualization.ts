// Cluster Visualization System - Four Distinct Styles
import { TopicNode } from "@/lib/utils/types";
import { MAP_CONSTANTS, getClusterStyle } from "@/lib/ui/map-tokens";

export type ClusterVisualizationStyle =
  | "translucent-background"
  | "convex-hull-polygon"
  | "blurred-bubble"
  | "label-positioning"
  | "none";

export type LabelPosition =
  | "top-center"
  | "top-left"
  | "floating"
  | "pinned-side";

export interface ClusterBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export interface ClusterVisualizationData {
  clusterId: string;
  nodes: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  bounds: ClusterBounds;
  style: ClusterVisualizationStyle;
  labelPosition: LabelPosition;
  completionPercentage: number;
  nodeCount: number;
}

// Constants for cluster visualization styling
export const CLUSTER_VIZ_CONSTANTS = {
  // Translucent Background Style - DRAMATICALLY enhanced for visibility
  TRANSLUCENT: {
    BACKGROUND_OPACITY: 0.45, // DOUBLED from 0.25 for much better visibility
    BORDER_OPACITY: 0.75, // Nearly doubled from 0.40 for strong definition
    BORDER_WIDTH: 3, // Increased from 2 for much clearer boundaries
    BORDER_RADIUS: 16, // Increased for more modern look
    PADDING: 32, // Increased padding for better visual separation
    HOVER_OPACITY: 0.65, // Much more pronounced hover effect
    HOVER_BORDER_OPACITY: 0.9, // Very strong hover border
    LABEL_OFFSET: 24, // Increased distance for better label positioning
    Z_INDEX: 0, // Behind nodes but above background
  },

  // Convex Hull Polygon Style - DRAMATICALLY enhanced
  CONVEX_HULL: {
    CURVE_SMOOTHING: 0.3, // Increased for more organic curves
    PADDING: 36, // Much larger padding for better visibility
    STROKE_WIDTH: 4, // Increased from 3 for much better visibility
    STROKE_OPACITY: 0.85, // Very high visibility
    FILL_OPACITY: 0.25, // More than doubled from 0.12 for strong fill
    HOVER_STROKE_OPACITY: 0.95, // Nearly opaque on hover
    HOVER_FILL_OPACITY: 0.4, // Much stronger hover fill
  },

  // Blurred Bubble Style - DRAMATICALLY enhanced
  BLURRED_BUBBLE: {
    BLUR_RADIUS: 16, // Reduced for better definition but still soft
    OPACITY: 0.35, // Nearly doubled from 0.18 for much better visibility
    PADDING: 48, // Much larger padding for dramatic effect
    HOVER_OPACITY: 0.55, // Nearly doubled hover visibility
    GLOW_INTENSITY: 1.5, // Increased glow for dramatic effect
  },

  // Label Positioning Style - Enhanced for better readability
  LABEL_POSITIONING: {
    PILL_HEIGHT: 38, // Increased from 34 for better visibility
    PILL_PADDING: 20, // Increased padding
    FONT_SIZE: "16px", // Increased from 15px for better readability
    FONT_WEIGHT: "700", // Bolder font weight
    BACKGROUND_COLOR: "#6366f1", // Indigo for better contrast
    TEXT_COLOR: "#ffffff",
    BORDER_RADIUS: 19, // Proportional to height
    SHADOW: "0 6px 20px rgba(99, 102, 241, 0.4)", // Much stronger shadow
    HOVER_SCALE: 1.08, // More pronounced hover effect
    Z_INDEX: 20, // Higher z-index for better layering
  },

  // General settings - Faster for more responsive feel
  ANIMATION: {
    DURATION: 150, // Faster transitions for immediate feedback
    EASING: "cubic-bezier(0.4, 0, 0.2, 1)",
    HOVER_DURATION: 100, // Very fast hover response
  },

  // Zoom-based adjustments - Better scaling across all zoom levels
  ZOOM_SCALING: {
    MIN_ZOOM: 0.1,
    MAX_ZOOM: 3.0,
    LABEL_MIN_SIZE: 14, // Larger minimum size
    LABEL_MAX_SIZE: 24, // Larger maximum size
    PADDING_SCALE_FACTOR: 0.6, // More aggressive scaling for better visibility
  },
} as const;

// Calculate cluster bounds from node positions
export function calculateClusterBounds(
  nodes: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>,
  padding: number = 32
): ClusterBounds {
  if (nodes.length === 0) {
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      centerX: 0,
      centerY: 0,
      width: 0,
      height: 0,
    };
  }

  const minX = Math.min(...nodes.map((n) => n.x)) - padding;
  const maxX = Math.max(...nodes.map((n) => n.x + n.width)) + padding;
  const minY = Math.min(...nodes.map((n) => n.y)) - padding;
  const maxY = Math.max(...nodes.map((n) => n.y + n.height)) + padding;

  return {
    minX,
    maxX,
    minY,
    maxY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    width: maxX - minX,
    height: maxY - minY,
  };
}

// Generate convex hull points with organic curves
export function generateConvexHullPath(
  nodes: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>,
  smoothing: number = CLUSTER_VIZ_CONSTANTS.CONVEX_HULL.CURVE_SMOOTHING,
  zoomLevel: number = 1
): string {
  if (nodes.length === 0) return "";
  if (nodes.length === 1) {
    const node = nodes[0];
    const cx = node.x + node.width / 2;
    const cy = node.y + node.height / 2;
    // Dynamic padding based on zoom level
    const basePadding = CLUSTER_VIZ_CONSTANTS.CONVEX_HULL.PADDING;
    const dynamicPadding =
      basePadding * Math.max(0.5, Math.min(2.0, zoomLevel));
    const r = Math.max(node.width, node.height) / 2 + dynamicPadding;
    return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${
      cx + r
    } ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
  }

  // Get node centers with dynamic padding based on zoom
  const points = nodes.map((node) => ({
    x: node.x + node.width / 2,
    y: node.y + node.height / 2,
  }));

  // Calculate convex hull using Graham scan algorithm
  const hull = convexHull(points);

  // Add dynamic padding to hull points based on zoom level
  const basePadding = CLUSTER_VIZ_CONSTANTS.CONVEX_HULL.PADDING;
  const dynamicPadding = basePadding * Math.max(0.5, Math.min(2.0, zoomLevel));

  const centroid = hull.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  );
  centroid.x /= hull.length;
  centroid.y /= hull.length;

  const paddedHull = hull.map((point) => {
    const dx = point.x - centroid.x;
    const dy = point.y - centroid.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const factor = (distance + dynamicPadding) / distance;
    return {
      x: centroid.x + dx * factor,
      y: centroid.y + dy * factor,
    };
  });

  // Generate smooth curved path with enhanced smoothing
  return generateSmoothPath(paddedHull, smoothing);
}

// Graham scan convex hull algorithm
function convexHull(
  points: Array<{ x: number; y: number }>
): Array<{ x: number; y: number }> {
  if (points.length <= 3) return points;

  // Sort points by x-coordinate (and y-coordinate if x is equal)
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);

  // Build lower hull
  const lower = [];
  for (const point of sorted) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0
    ) {
      lower.pop();
    }
    lower.push(point);
  }

  // Build upper hull
  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const point = sorted[i];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0
    ) {
      upper.pop();
    }
    upper.push(point);
  }

  // Remove last point of each half because it's repeated
  upper.pop();
  lower.pop();

  return lower.concat(upper);
}

// Cross product for convex hull calculation
function cross(
  o: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

// Generate smooth curved path with enhanced curves
function generateSmoothPath(
  points: Array<{ x: number; y: number }>,
  smoothing: number
): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  // Enhanced smoothing with better bezier curve control
  const path = [`M ${points[0].x} ${points[0].y}`];

  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    const prev = points[(i - 1 + points.length) % points.length];

    // Calculate control points for smooth curves
    const dx1 = current.x - prev.x;
    const dy1 = current.y - prev.y;
    const dx2 = next.x - current.x;
    const dy2 = next.y - current.y;

    // Normalize vectors
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    if (len1 > 0 && len2 > 0) {
      // Create smooth control points
      const controlDist1 = len1 * smoothing * 0.5;
      const controlDist2 = len2 * smoothing * 0.5;

      const cp1x = current.x - (dx1 / len1) * controlDist1;
      const cp1y = current.y - (dy1 / len1) * controlDist1;
      const cp2x = current.x + (dx2 / len2) * controlDist2;
      const cp2y = current.y + (dy2 / len2) * controlDist2;

      path.push(
        `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(
          2
        )} ${cp2y.toFixed(2)}, ${next.x} ${next.y}`
      );
    } else {
      // Fallback to line if vectors are too small
      path.push(`L ${next.x} ${next.y}`);
    }
  }

  path.push("Z"); // Close the path
  return path.join(" ");
}

// Determine optimal label position based on cluster bounds and zoom level
export function calculateLabelPosition(
  bounds: ClusterBounds,
  zoomLevel: number,
  preferredPosition: LabelPosition = "top-center"
): { x: number; y: number; position: LabelPosition } {
  const { centerX, centerY, minX, maxX, minY, width, height } = bounds;

  // Adjust for zoom level with minimum offset
  const labelOffset = Math.max(
    CLUSTER_VIZ_CONSTANTS.TRANSLUCENT.LABEL_OFFSET,
    20 / Math.max(zoomLevel, 0.5)
  );

  switch (preferredPosition) {
    case "top-center":
      return {
        x: centerX,
        y: minY - labelOffset,
        position: "top-center",
      };

    case "top-left":
      return {
        x: minX + 24, // Fixed offset from left edge
        y: minY - labelOffset,
        position: "top-left",
      };

    case "floating":
      return {
        x: centerX,
        y: centerY - height / 4,
        position: "floating",
      };

    case "pinned-side":
      return {
        x: maxX + labelOffset,
        y: centerY,
        position: "pinned-side",
      };

    default:
      return {
        x: centerX,
        y: minY - labelOffset,
        position: "top-center",
      };
  }
}

// Generate cluster visualization data with FIXED geometry calculation
export function generateClusterVisualization(
  clusterId: string,
  nodes: TopicNode[],
  nodePositions: Record<
    string,
    { x: number; y: number; width: number; height: number }
  >,
  style: ClusterVisualizationStyle,
  completedNodes: Set<string>,
  zoomLevel: number = 1
): ClusterVisualizationData | null {
  if (style === "none" || nodes.length === 0) return null;

  // FIXED: Filter cluster nodes and validate positions exist
  const clusterNodes = nodes
    .filter((node) => node.cluster === clusterId)
    .map((node) => {
      const pos = nodePositions[node.id];
      if (!pos || pos.x === undefined || pos.y === undefined) {
        console.warn(`Missing position data for node ${node.id}`);
        return null;
      }
      return {
        id: node.id,
        x: pos.x,
        y: pos.y,
        width: pos.width,
        height: pos.height,
      };
    })
    .filter((node): node is NonNullable<typeof node> => node !== null);

  if (clusterNodes.length === 0) {
    console.warn(`No valid positioned nodes found for cluster ${clusterId}`);
    return null;
  }

  // FIXED: Ensure we have valid numeric positions
  const validNodes = clusterNodes.filter(
    (node) =>
      typeof node.x === "number" &&
      typeof node.y === "number" &&
      !isNaN(node.x) &&
      !isNaN(node.y)
  );

  if (validNodes.length === 0) {
    console.warn(`No nodes with valid positions for cluster ${clusterId}`);
    return null;
  }

  const completionCount = validNodes.filter((node) =>
    completedNodes.has(node.id)
  ).length;
  const completionPercentage = Math.round(
    (completionCount / validNodes.length) * 100
  );

  // FIXED: Calculate padding based on style with proper scaling
  let padding: number = CLUSTER_VIZ_CONSTANTS.TRANSLUCENT.PADDING;
  switch (style) {
    case "translucent-background":
      padding = CLUSTER_VIZ_CONSTANTS.TRANSLUCENT.PADDING;
      break;
    case "convex-hull-polygon":
      padding = CLUSTER_VIZ_CONSTANTS.CONVEX_HULL.PADDING;
      break;
    case "blurred-bubble":
      padding = CLUSTER_VIZ_CONSTANTS.BLURRED_BUBBLE.PADDING;
      break;
    case "label-positioning":
      padding = 16; // Minimal padding for label-only style
      break;
  }

  // FIXED: Better zoom-aware scaling that prevents invisible results
  const minZoom = 0.3;
  const maxZoom = 2.0;
  const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel));
  const scaleFactor = Math.max(0.7, Math.min(1.3, 1 / clampedZoom));
  padding *= scaleFactor;

  // FIXED: Calculate bounds with proper validation
  const bounds = calculateClusterBounds(validNodes, padding);

  // FIXED: Validate bounds are reasonable
  if (
    bounds.width <= 0 ||
    bounds.height <= 0 ||
    !isFinite(bounds.minX) ||
    !isFinite(bounds.minY)
  ) {
    console.warn(`Invalid bounds calculated for cluster ${clusterId}:`, bounds);
    return null;
  }

  const labelPos = calculateLabelPosition(bounds, clampedZoom);

  return {
    clusterId,
    nodes: validNodes,
    bounds,
    style,
    labelPosition: labelPos.position,
    completionPercentage,
    nodeCount: validNodes.length,
  };
}

// Enhanced CSS styles generator with much better visibility and positioning
export function generateClusterCSS(
  clusterData: ClusterVisualizationData,
  isHovered: boolean = false,
  zoomLevel: number = 1
): React.CSSProperties {
  const { style, bounds } = clusterData;
  const clusterStyle = getClusterStyle(clusterData.clusterId);

  // Enhanced zoom-aware scaling
  const scaleMultiplier = Math.max(
    0.8,
    Math.min(1.4, 1 / Math.max(zoomLevel, 0.5))
  );

  const baseStyles: React.CSSProperties = {
    position: "absolute",
    left: bounds.minX,
    top: bounds.minY,
    width: bounds.width,
    height: bounds.height,
    pointerEvents: "auto", // Enable interactions
    transition: `all ${CLUSTER_VIZ_CONSTANTS.ANIMATION.DURATION}ms ${CLUSTER_VIZ_CONSTANTS.ANIMATION.EASING}`,
    zIndex: CLUSTER_VIZ_CONSTANTS.TRANSLUCENT.Z_INDEX,
    // ENHANCED: Better transform origin for scaling
    transformOrigin: "center",
  };

  switch (style) {
    case "translucent-background": {
      // DRAMATICALLY enhanced translucent background
      const backgroundOpacity = isHovered
        ? CLUSTER_VIZ_CONSTANTS.TRANSLUCENT.HOVER_OPACITY
        : CLUSTER_VIZ_CONSTANTS.TRANSLUCENT.BACKGROUND_OPACITY;

      const borderOpacity = isHovered
        ? CLUSTER_VIZ_CONSTANTS.TRANSLUCENT.HOVER_BORDER_OPACITY
        : CLUSTER_VIZ_CONSTANTS.TRANSLUCENT.BORDER_OPACITY;

      // Convert cluster primary color to rgba for better control
      const rgb = hexToRgb(clusterStyle.primary);
      const backgroundRgba = rgb
        ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${backgroundOpacity})`
        : `${clusterStyle.primary}${Math.round(backgroundOpacity * 255)
            .toString(16)
            .padStart(2, "0")}`;

      const borderRgba = rgb
        ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${borderOpacity})`
        : `${clusterStyle.primary}${Math.round(borderOpacity * 255)
            .toString(16)
            .padStart(2, "0")}`;

      return {
        ...baseStyles,
        backgroundColor: backgroundRgba,
        border: `${CLUSTER_VIZ_CONSTANTS.TRANSLUCENT.BORDER_WIDTH}px solid ${borderRgba}`,
        borderRadius: CLUSTER_VIZ_CONSTANTS.TRANSLUCENT.BORDER_RADIUS,
        // ENHANCED: Much stronger shadows and effects
        boxShadow: isHovered
          ? `0 8px 32px rgba(${rgb?.r || 0}, ${rgb?.g || 0}, ${
              rgb?.b || 0
            }, 0.25), 0 4px 16px rgba(${rgb?.r || 0}, ${rgb?.g || 0}, ${
              rgb?.b || 0
            }, 0.15)`
          : `0 4px 20px rgba(${rgb?.r || 0}, ${rgb?.g || 0}, ${
              rgb?.b || 0
            }, 0.12), 0 2px 8px rgba(${rgb?.r || 0}, ${rgb?.g || 0}, ${
              rgb?.b || 0
            }, 0.08)`,
        transform: isHovered
          ? `scale(${1.02 * scaleMultiplier})`
          : `scale(${scaleMultiplier})`,
        // ENHANCED: Backdrop filter for modern glass effect
        backdropFilter: "blur(8px) saturate(180%)",
        WebkitBackdropFilter: "blur(8px) saturate(180%)",
      };
    }

    case "blurred-bubble": {
      const opacity = isHovered
        ? CLUSTER_VIZ_CONSTANTS.BLURRED_BUBBLE.HOVER_OPACITY
        : CLUSTER_VIZ_CONSTANTS.BLURRED_BUBBLE.OPACITY;

      const rgb = hexToRgb(clusterStyle.primary);

      return {
        ...baseStyles,
        // ENHANCED: Much more visible bubble effect
        background: rgb
          ? `radial-gradient(ellipse at center, rgba(${rgb.r}, ${rgb.g}, ${
              rgb.b
            }, ${opacity}) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${
              opacity * 0.6
            }) 60%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) 100%)`
          : `${clusterStyle.primary}${Math.round(opacity * 255)
              .toString(16)
              .padStart(2, "0")}`,
        borderRadius: "50%",
        filter: `blur(${CLUSTER_VIZ_CONSTANTS.BLURRED_BUBBLE.BLUR_RADIUS}px) brightness(${CLUSTER_VIZ_CONSTANTS.BLURRED_BUBBLE.GLOW_INTENSITY})`,
        transform: isHovered
          ? `scale(${1.08 * scaleMultiplier})`
          : `scale(${scaleMultiplier})`,
        // ENHANCED: Additional glow effect
        boxShadow: isHovered
          ? `0 0 40px rgba(${rgb?.r || 0}, ${rgb?.g || 0}, ${rgb?.b || 0}, ${
              opacity * 0.8
            })`
          : `0 0 20px rgba(${rgb?.r || 0}, ${rgb?.g || 0}, ${rgb?.b || 0}, ${
              opacity * 0.4
            })`,
      };
    }

    case "label-positioning":
      return {
        ...baseStyles,
        backgroundColor: "transparent", // No background, just positioning
        transform: `scale(${scaleMultiplier})`,
      };

    default:
      return {
        ...baseStyles,
        transform: `scale(${scaleMultiplier})`,
      };
  }
}

// Helper function to convert hex to rgb
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
