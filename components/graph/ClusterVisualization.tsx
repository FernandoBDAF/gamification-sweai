import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopicNode } from "@/lib/types";
import { getClusterLabel, getClusterStyle } from "@/lib/map-constants";
import {
  ClusterVisualizationStyle,
  ClusterVisualizationData,
  CLUSTER_VIZ_CONSTANTS,
  generateClusterVisualization,
  generateClusterCSS,
  generateConvexHullPath,
  calculateLabelPosition,
} from "@/lib/cluster-visualization";

interface ClusterVisualizationProps {
  nodes: TopicNode[];
  nodePositions: Record<
    string,
    { x: number; y: number; width: number; height: number }
  >;
  completedNodes: Set<string>;
  style: ClusterVisualizationStyle;
  zoomLevel: number;
  onClusterHover?: (clusterId: string | null) => void;
  onClusterClick?: (clusterId: string) => void;
}

export const ClusterVisualization: React.FC<ClusterVisualizationProps> = ({
  nodes,
  nodePositions,
  completedNodes,
  style,
  zoomLevel,
  onClusterHover,
  onClusterClick,
}) => {
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);

  // FIXED: Generate cluster data with proper validation and error handling
  const clusterData = useMemo(() => {
    if (style === "none") return [];

    // Validate inputs
    if (!nodes.length || !Object.keys(nodePositions).length) return [];

    const clusters = new Set(nodes.map((node) => node.cluster));
    const validClusters = Array.from(clusters)
      .map((clusterId) => {
        try {
          return generateClusterVisualization(
            clusterId,
            nodes,
            nodePositions,
            style,
            completedNodes,
            zoomLevel
          );
        } catch (error) {
          console.warn(
            `Failed to generate cluster visualization for ${clusterId}:`,
            error
          );
          return null;
        }
      })
      .filter((data): data is ClusterVisualizationData => data !== null);

    return validClusters;
  }, [nodes, nodePositions, completedNodes, style, zoomLevel]);

  const handleClusterHover = (clusterId: string | null) => {
    setHoveredCluster(clusterId);
    onClusterHover?.(clusterId);
  };

  // FIXED: Always render container for debugging, even when empty
  if (style === "none") return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      data-testid="cluster-visualization"
    >
      <AnimatePresence mode="sync">
        {clusterData.map((cluster) => {
          const { clusterId, bounds, nodes: clusterNodes } = cluster;
          const completionPct = Math.round(
            (clusterNodes.filter((node) => completedNodes.has(node.id)).length /
              clusterNodes.length) *
              100
          );

          return (
            <motion.div
              key={`${clusterId}-${style}`}
              className="absolute pointer-events-auto"
              style={{
                left: bounds.minX,
                top: bounds.minY,
                width: bounds.width,
                height: bounds.height,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: CLUSTER_VIZ_CONSTANTS.ANIMATION.DURATION / 1000,
                ease: "easeOut",
              }}
              onMouseEnter={() => onClusterHover?.(clusterId)}
              onMouseLeave={() => onClusterHover?.(null)}
              onClick={() => onClusterClick?.(clusterId)}
            >
              <div
                className="w-full h-full cursor-pointer"
                style={generateClusterCSS(
                  cluster,
                  hoveredCluster === clusterId,
                  zoomLevel
                )}
              >
                {style === "label-positioning" && (
                  <div
                    className="absolute flex items-center justify-center text-white font-bold text-sm pointer-events-none"
                    style={{
                      left: bounds.width / 2 - 40,
                      top: bounds.height / 2 - 10,
                      width: 80,
                      height: 20,
                      backgroundColor:
                        CLUSTER_VIZ_CONSTANTS.LABEL_POSITIONING
                          .BACKGROUND_COLOR,
                      borderRadius:
                        CLUSTER_VIZ_CONSTANTS.LABEL_POSITIONING.BORDER_RADIUS,
                    }}
                  >
                    {clusterId} ({completionPct}%)
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

interface ClusterShapeProps {
  clusterData: ClusterVisualizationData;
  isHovered: boolean;
  zoomLevel: number;
  onHover: (clusterId: string | null) => void;
  onClick?: (clusterId: string) => void;
}

const ClusterShape: React.FC<ClusterShapeProps> = ({
  clusterData,
  isHovered,
  zoomLevel,
  onHover,
  onClick,
}) => {
  const { clusterId, style, bounds } = clusterData;

  const handleMouseEnter = () => onHover(clusterId);
  const handleMouseLeave = () => onHover(null);
  const handleClick = () => onClick?.(clusterId);

  // FIXED: Generate styles with error handling
  let containerStyle;
  try {
    containerStyle = generateClusterCSS(clusterData, isHovered, zoomLevel);
  } catch (error) {
    console.warn(`Failed to generate CSS for cluster ${clusterId}:`, error);
    containerStyle = {
      position: "absolute" as const,
      left: bounds.minX,
      top: bounds.minY,
      width: bounds.width,
      height: bounds.height,
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      border: "1px solid rgba(0, 0, 0, 0.2)",
      borderRadius: "8px",
    };
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        duration: CLUSTER_VIZ_CONSTANTS.ANIMATION.DURATION / 1000,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="absolute"
      style={containerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      data-testid={`cluster-${clusterId}`}
    >
      {/* FIXED: Render specific cluster shape based on style with error boundaries */}
      {style === "convex-hull-polygon" && (
        <ConvexHullShape clusterData={clusterData} isHovered={isHovered} />
      )}

      {/* FIXED: Enhanced cluster label with better error handling */}
      <EnhancedClusterLabel
        clusterData={clusterData}
        zoomLevel={zoomLevel}
        isHovered={isHovered}
      />

      {/* FIXED: Hover tooltip with conditional rendering */}
      {isHovered &&
        (style === "translucent-background" || style === "blurred-bubble") && (
          <ClusterTooltip clusterData={clusterData} zoomLevel={zoomLevel} />
        )}
    </motion.div>
  );
};

interface ConvexHullShapeProps {
  clusterData: ClusterVisualizationData;
  isHovered: boolean;
}

const ConvexHullShape: React.FC<ConvexHullShapeProps> = ({
  clusterData,
  isHovered,
}) => {
  const { nodes, bounds, clusterId } = clusterData;

  // FIXED: Error handling for cluster style
  let clusterStyle;
  try {
    clusterStyle = getClusterStyle(clusterId);
  } catch (error) {
    console.warn(`Failed to get cluster style for ${clusterId}:`, error);
    clusterStyle = {
      primary: "#6b7280",
      background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
      border: "#6b7280",
      text: "#374151",
      accent: "#9ca3af",
    };
  }

  // FIXED: Generate SVG path with error handling
  let hullPath;
  try {
    hullPath = generateConvexHullPath(nodes);
  } catch (error) {
    console.warn(`Failed to generate convex hull for ${clusterId}:`, error);
    // Fallback to simple rectangle path
    hullPath = `M ${bounds.minX} ${bounds.minY} L ${bounds.maxX} ${bounds.minY} L ${bounds.maxX} ${bounds.maxY} L ${bounds.minX} ${bounds.maxY} Z`;
  }

  const strokeOpacity = isHovered
    ? CLUSTER_VIZ_CONSTANTS.CONVEX_HULL.HOVER_STROKE_OPACITY
    : CLUSTER_VIZ_CONSTANTS.CONVEX_HULL.STROKE_OPACITY;

  const fillOpacity = isHovered
    ? CLUSTER_VIZ_CONSTANTS.CONVEX_HULL.HOVER_FILL_OPACITY
    : CLUSTER_VIZ_CONSTANTS.CONVEX_HULL.FILL_OPACITY;

  if (!hullPath) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id={`cluster-glow-${clusterId}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <motion.path
        d={hullPath}
        fill={`${clusterStyle.primary}${Math.round(fillOpacity * 255)
          .toString(16)
          .padStart(2, "0")}`}
        stroke={clusterStyle.primary}
        strokeWidth={CLUSTER_VIZ_CONSTANTS.CONVEX_HULL.STROKE_WIDTH}
        strokeOpacity={strokeOpacity}
        filter={isHovered ? `url(#cluster-glow-${clusterId})` : undefined}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 0.8, ease: "easeInOut" },
          opacity: { duration: 0.3 },
        }}
      />
    </svg>
  );
};

interface EnhancedClusterLabelProps {
  clusterData: ClusterVisualizationData;
  zoomLevel: number;
  isHovered: boolean;
}

const EnhancedClusterLabel: React.FC<EnhancedClusterLabelProps> = ({
  clusterData,
  zoomLevel,
  isHovered,
}) => {
  const { clusterId, bounds, completionPercentage, nodeCount, style } =
    clusterData;

  // FIXED: Error handling for cluster data
  let clusterLabel, clusterStyle;
  try {
    clusterLabel = getClusterLabel(clusterId);
    clusterStyle = getClusterStyle(clusterId);
  } catch (error) {
    console.warn(`Failed to get cluster info for ${clusterId}:`, error);
    clusterLabel = clusterId;
    clusterStyle = {
      primary: "#6b7280",
      background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
      border: "#6b7280",
      text: "#374151",
      accent: "#9ca3af",
    };
  }

  // FIXED: Calculate label position with bounds checking
  let labelPos;
  try {
    labelPos = calculateLabelPosition(bounds, zoomLevel);
  } catch (error) {
    console.warn(`Failed to calculate label position for ${clusterId}:`, error);
    labelPos = {
      x: bounds.centerX,
      y: bounds.minY - 20,
      position: "top-center" as const,
    };
  }

  // FIXED: Adjust font size based on zoom level with bounds
  const fontSize = Math.max(
    CLUSTER_VIZ_CONSTANTS.ZOOM_SCALING.LABEL_MIN_SIZE,
    Math.min(
      CLUSTER_VIZ_CONSTANTS.ZOOM_SCALING.LABEL_MAX_SIZE,
      parseInt(CLUSTER_VIZ_CONSTANTS.LABEL_POSITIONING.FONT_SIZE) *
        Math.min(Math.max(zoomLevel, 0.5), 1.5)
    )
  );

  // FIXED: Enhanced styling for all visualization types
  const getLabelStyle = () => {
    const baseStyle = {
      fontSize: `${fontSize}px`,
      fontWeight: CLUSTER_VIZ_CONSTANTS.LABEL_POSITIONING.FONT_WEIGHT,
      minHeight: Math.max(
        28,
        CLUSTER_VIZ_CONSTANTS.LABEL_POSITIONING.PILL_HEIGHT * (fontSize / 14)
      ),
      borderRadius: CLUSTER_VIZ_CONSTANTS.LABEL_POSITIONING.BORDER_RADIUS,
      backdropFilter: "blur(8px)",
      transform: isHovered ? "scale(1.02)" : "scale(1)",
      transition: "all 150ms ease-out",
    };

    switch (style) {
      case "translucent-background":
        return {
          ...baseStyle,
          backgroundColor: clusterStyle.primary,
          color: "#ffffff",
          boxShadow: `0 3px 12px ${clusterStyle.primary}30, 0 1px 4px ${clusterStyle.primary}20`,
          border: `1px solid ${clusterStyle.primary}`,
        };
      case "convex-hull-polygon":
        return {
          ...baseStyle,
          backgroundColor: clusterStyle.primary,
          color: "#ffffff",
          boxShadow: `0 3px 12px ${clusterStyle.primary}40, 0 1px 4px ${clusterStyle.primary}30`,
          border: `2px solid ${clusterStyle.primary}`,
        };
      case "blurred-bubble":
        return {
          ...baseStyle,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          color: clusterStyle.primary,
          boxShadow: `0 4px 16px ${clusterStyle.primary}20, 0 2px 6px rgba(0, 0, 0, 0.1)`,
          border: `1px solid ${clusterStyle.primary}50`,
        };
      case "label-positioning":
        return {
          ...baseStyle,
          backgroundColor:
            CLUSTER_VIZ_CONSTANTS.LABEL_POSITIONING.BACKGROUND_COLOR,
          color: CLUSTER_VIZ_CONSTANTS.LABEL_POSITIONING.TEXT_COLOR,
          boxShadow: CLUSTER_VIZ_CONSTANTS.LABEL_POSITIONING.SHADOW,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: clusterStyle.primary,
          color: "#ffffff",
          boxShadow: `0 3px 12px ${clusterStyle.primary}30`,
          border: `1px solid ${clusterStyle.primary}`,
        };
    }
  };

  const labelStyle = getLabelStyle();

  return (
    <motion.div
      className="absolute pointer-events-auto cursor-pointer"
      style={{
        left: labelPos.x - bounds.minX,
        top: labelPos.y - bounds.minY,
        transform: "translate(-50%, -50%)",
        zIndex: CLUSTER_VIZ_CONSTANTS.LABEL_POSITIONING.Z_INDEX,
      }}
      whileHover={{
        scale: CLUSTER_VIZ_CONSTANTS.LABEL_POSITIONING.HOVER_SCALE,
      }}
      transition={{
        duration: CLUSTER_VIZ_CONSTANTS.ANIMATION.HOVER_DURATION / 1000,
      }}
    >
      <div
        className="px-4 py-2 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap font-semibold"
        style={labelStyle}
      >
        <span className="font-bold">{clusterLabel}</span>
        <div className="flex items-center gap-1.5 text-xs opacity-90 font-medium">
          <span>{nodeCount}</span>
          <span>•</span>
          <span>{completionPercentage}%</span>
        </div>
      </div>
    </motion.div>
  );
};

interface ClusterTooltipProps {
  clusterData: ClusterVisualizationData;
  zoomLevel: number;
}

const ClusterTooltip: React.FC<ClusterTooltipProps> = ({
  clusterData,
  zoomLevel,
}) => {
  const { clusterId, completionPercentage, nodeCount } = clusterData;

  let clusterLabel;
  try {
    clusterLabel = getClusterLabel(clusterId);
  } catch (error) {
    console.warn(`Failed to get cluster label for ${clusterId}:`, error);
    clusterLabel = clusterId;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-3 pointer-events-none"
      style={{ zIndex: CLUSTER_VIZ_CONSTANTS.LABEL_POSITIONING.Z_INDEX + 10 }}
    >
      <div className="bg-gray-900 text-white px-4 py-3 rounded-xl text-sm shadow-xl border border-gray-700">
        <div className="font-semibold text-gray-100">{clusterLabel}</div>
        <div className="text-xs text-gray-300 mt-1.5 flex items-center gap-3">
          <span>{nodeCount} topics</span>
          <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
          <span>{completionPercentage}% complete</span>
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </motion.div>
  );
};

// FIXED: Settings component with better visual feedback
interface ClusterVisualizationSettingsProps {
  currentStyle: ClusterVisualizationStyle;
  onStyleChange: (style: ClusterVisualizationStyle) => void;
  className?: string;
}

export const ClusterVisualizationSettings: React.FC<
  ClusterVisualizationSettingsProps
> = ({ currentStyle, onStyleChange, className = "" }) => {
  const styles: Array<{
    key: ClusterVisualizationStyle;
    label: string;
    icon: string;
    primary?: boolean;
  }> = [
    { key: "none", label: "None", icon: "⭕" },
    {
      key: "translucent-background",
      label: "Background",
      icon: "⬜",
      primary: true,
    },
    { key: "convex-hull-polygon", label: "Hull", icon: "🔷" },
    { key: "blurred-bubble", label: "Bubble", icon: "🫧" },
    { key: "label-positioning", label: "Labels", icon: "🏷️" },
  ];

  return (
    <div
      className={`bg-white border-2 border-gray-200 rounded-lg p-2 shadow-lg ${className}`}
    >
      <div className="text-xs font-medium text-gray-600 mb-2">
        Cluster Style
      </div>
      <div className="grid grid-cols-2 gap-1">
        {styles.map((style) => (
          <button
            key={style.key}
            onClick={() => onStyleChange(style.key)}
            className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
              currentStyle === style.key
                ? style.primary
                  ? "bg-indigo-100 text-indigo-800 border border-indigo-200 ring-1 ring-indigo-300"
                  : "bg-blue-100 text-blue-800 border border-blue-200"
                : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            <span>{style.icon}</span>
            <span>{style.label}</span>
            {style.primary && currentStyle === style.key && (
              <span className="text-xs">✨</span>
            )}
          </button>
        ))}
      </div>
      {currentStyle === "translucent-background" && (
        <div className="mt-2 p-2 bg-indigo-50 border border-indigo-200 rounded-md">
          <div className="text-xs text-indigo-700 font-medium">
            ✨ Enhanced Focus Mode
          </div>
          <div className="text-xs text-indigo-600 mt-0.5">
            Optimized for clarity and visual cohesion
          </div>
        </div>
      )}
      {currentStyle !== "none" && currentStyle !== "translucent-background" && (
        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
          <div className="text-xs text-amber-700 font-medium">
            🧪 Experimental Style
          </div>
          <div className="text-xs text-amber-600 mt-0.5">
            Advanced visualization mode
          </div>
        </div>
      )}
    </div>
  );
};
