import React, {
  useMemo,
  useEffect,
  useCallback,
  useState,
  useRef,
} from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  useStore,
  Position,
  MarkerType,
} from "reactflow";
import { TopicNode, ViewMode } from "@/lib/types";
import { ProgressState, computeStatus } from "@/lib/gamification";
import {
  layoutDagre,
  layoutClusterFocus,
  layoutOverview,
  LayoutDirection,
  SizeVariant,
} from "./layout";
import {
  nodeTypes,
  defaultEdgeOptions,
  goalPathEdgeOptions,
  crossClusterEdgeOptions,
  completedPathEdgeOptions,
} from "./index";
import { TechTreeNodeData } from "./TechTreeNode";
import { VisualLegend } from "./VisualLegend";
import {
  ClusterVisualization,
  ClusterVisualizationSettings,
} from "./ClusterVisualization";
import { ClusterVisualizationStyle } from "@/lib/cluster-visualization";
import { MAP_CONSTANTS } from "@/lib/map-constants";

interface DependencyGraphProps {
  nodes: TopicNode[];
  view: ViewMode;
  clusterFilter: string;
  compact: boolean;
  goalId: string;
  search: string;
  progress: ProgressState;
  onToggleDone: (id: string) => void;
  onToggleReviewed: (id: string) => void;
  onSaveNote: (id: string, text: string) => void;
  onSetGoal: (id: string) => void;
  topicsById: Record<string, TopicNode>;
  viewLevel?: "overview" | "cluster" | "detail";
  clusterStyle?: string;
  layoutDirection?: "TB" | "LR";
}

// Debounced fitView utility
let fitViewTimeout: NodeJS.Timeout;
const debouncedFitView = (fitView: () => void, delay: number = 300) => {
  clearTimeout(fitViewTimeout);
  fitViewTimeout = setTimeout(fitView, delay);
};

export const DependencyGraph: React.FC<DependencyGraphProps> = ({
  nodes,
  view,
  clusterFilter,
  compact,
  goalId,
  search,
  progress,
  onToggleDone,
  onToggleReviewed,
  onSaveNote,
  onSetGoal,
  topicsById,
  viewLevel = "cluster",
  clusterStyle = "background",
  layoutDirection = "TB",
}) => {
  const { fitView, zoomTo, getZoom } = useReactFlow();
  const [focusedCluster, setFocusedCluster] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(1);
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);
  const [isZooming, setIsZooming] = useState(false);
  const zoomTimeoutRef = useRef<NodeJS.Timeout>();

  // Track user interaction to suppress auto fitView during manual pan/zoom
  const isUserInteractingRef = useRef(false);

  // Get current viewport transform so overlays follow pan/zoom
  const [tx, ty, k] = useStore((s) => s.transform);

  // Convert clusterStyle to proper ClusterVisualizationStyle
  const clusterVisualizationStyle: ClusterVisualizationStyle = useMemo(() => {
    const styleMap: Record<string, ClusterVisualizationStyle> = {
      none: "none",
      background: "translucent-background",
      hull: "convex-hull-polygon",
      bubble: "blurred-bubble",
      labels: "label-positioning",
    };
    return styleMap[clusterStyle] || "translucent-background";
  }, [clusterStyle]);

  // Convert layoutDirection to proper LayoutDirection
  const layoutDir: LayoutDirection = layoutDirection as LayoutDirection;

  // Track zoom changes for cluster visualization - with debouncing to prevent conflicts
  useEffect(() => {
    const updateZoom = () => {
      if (!isZooming) {
        const newZoom = getZoom();
        setCurrentZoom(newZoom);
      }
    };

    // Update zoom immediately
    updateZoom();

    // Set up interval for ongoing updates
    const interval = setInterval(updateZoom, 200);
    return () => clearInterval(interval);
  }, [getZoom, isZooming]);

  // Memoize statuses computation
  const statuses = useMemo(() => {
    const statusMap: Record<string, any> = {};
    for (const node of nodes) {
      statusMap[node.id] = computeStatus(
        node.id,
        node.deps,
        progress.completed
      );
    }
    return statusMap;
  }, [nodes, progress.completed]);

  // Filter nodes based on current settings and cluster focus
  const filteredNodes = useMemo(() => {
    let filtered = nodes.filter((node) => {
      const status = statuses[node.id];
      const includeByCluster =
        clusterFilter === "ALL" || node.cluster === clusterFilter;
      const includeSearch =
        !search ||
        node.label.toLowerCase().includes(search.toLowerCase()) ||
        node.id.toLowerCase().includes(search.toLowerCase());

      return includeByCluster && includeSearch;
    });

    // Apply cluster focus if active
    if (focusedCluster) {
      const clusterNodes = filtered.filter((n) => n.cluster === focusedCluster);
      const clusterNodeIds = new Set(clusterNodes.map((n) => n.id));

      // Include dependencies and dependents
      filtered = filtered.filter((n) => {
        if (clusterNodeIds.has(n.id)) return true;

        // Include if it's a dependency of any cluster node
        const isDependency = clusterNodes.some((cn) => cn.deps.includes(n.id));

        // Include if it depends on any cluster node
        const dependsOnCluster = n.deps.some((dep) => clusterNodeIds.has(dep));

        return isDependency || dependsOnCluster;
      });
    }

    return filtered;
  }, [nodes, clusterFilter, search, statuses, focusedCluster]);

  // Build edges from dependencies
  const buildEdges = useCallback(
    (filteredNodes: TopicNode[]) => {
      const edges: Array<{
        source: string;
        target: string;
        isCrossCluster?: boolean;
        isCompleted?: boolean;
        isOnGoalPath?: boolean;
      }> = [];

      filteredNodes.forEach((node) => {
        node.deps.forEach((dep) => {
          // Only add edge if dependency node exists in filtered set
          if (filteredNodes.find((n) => n.id === dep)) {
            const sourceNode = filteredNodes.find((n) => n.id === dep);
            const targetNode = node;

            // Determine edge properties
            const isCrossCluster =
              sourceNode && sourceNode.cluster !== targetNode.cluster;
            const isCompleted =
              statuses[dep] === "completed" &&
              statuses[node.id] === "completed";

            edges.push({
              source: dep,
              target: node.id,
              isCrossCluster,
              isCompleted,
            });
          }
        });
      });

      return edges;
    },
    [statuses]
  );

  // BFS to find shortest path for goal highlighting
  const findPathToGoal = useCallback(
    (targetId: string, filteredNodes: TopicNode[]): Set<string> => {
      if (!targetId) return new Set();

      const visited = new Set<string>();
      const queue: string[] = [];
      const parent: Record<string, string> = {};

      // Find all nodes that can reach the target (reverse BFS)
      const reverseEdges: Record<string, string[]> = {};
      filteredNodes.forEach((node) => {
        node.deps.forEach((dep) => {
          if (!reverseEdges[dep]) reverseEdges[dep] = [];
          reverseEdges[dep].push(node.id);
        });
      });

      // BFS from target backwards to find all paths
      queue.push(targetId);
      visited.add(targetId);

      while (queue.length > 0) {
        const current = queue.shift()!;

        // Get all nodes that lead to this node
        const predecessors = filteredNodes
          .filter((node) => node.deps.includes(current))
          .map((node) => node.id);

        predecessors.forEach((pred) => {
          if (!visited.has(pred)) {
            visited.add(pred);
            parent[pred] = current;
            queue.push(pred);
          }
        });
      }

      return visited;
    },
    []
  );

  // ENHANCED: Determine size variant with more dramatic differences
  const getSizeVariant = useCallback((): SizeVariant => {
    if (compact) return "compact";

    // More dramatic size differences based on view level
    if (viewLevel === "overview") return "compact"; // Always compact in overview for density
    if (viewLevel === "detail") return "expanded"; // Always expanded in detail for clarity
    if (focusedCluster) return "expanded"; // Expanded when cluster focused

    return "standard"; // Standard for cluster view
  }, [compact, viewLevel, focusedCluster]);

  // FIXED: Layout nodes using view-level aware algorithm
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const edges = buildEdges(filteredNodes);
    const sizeVariant = getSizeVariant();

    // FIXED: Use zoomLevel to determine layout strategy with dramatic differences
    if (viewLevel === "cluster" && focusedCluster) {
      // Cluster focus mode - tight layout around specific cluster
      return layoutClusterFocus(
        filteredNodes,
        edges,
        focusedCluster,
        layoutDir,
        sizeVariant
      );
    } else if (viewLevel === "overview") {
      // Overview mode - much more compact layout showing all clusters
      return layoutDagre(filteredNodes, edges, layoutDir, sizeVariant, {
        clusterSpacing: true,
        nodeSpacing: 0.6, // Much tighter spacing
        expandedSpacing: false,
      });
    } else if (viewLevel === "detail") {
      // Detail mode - much more expanded layout with larger spacing
      return layoutDagre(filteredNodes, edges, layoutDir, sizeVariant, {
        clusterSpacing: true,
        expandedSpacing: true,
        nodeSpacing: 2.0, // Much more spacing between nodes
      });
    } else {
      // Cluster mode - standard balanced layout
      return layoutDagre(filteredNodes, edges, layoutDir, sizeVariant, {
        clusterSpacing: true,
        nodeSpacing: 1.0, // Standard spacing
      });
    }
  }, [
    filteredNodes,
    buildEdges,
    focusedCluster,
    layoutDir,
    viewLevel,
    getSizeVariant,
  ]);

  // ENHANCED: Add mode change feedback with HUD toast
  const [modeChangeToast, setModeChangeToast] = useState<string | null>(null);

  // Show toast when view level changes
  useEffect(() => {
    const modeNames = {
      overview: "🌐 Overview Mode - All clusters visible",
      cluster: "🎯 Cluster Mode - Balanced view",
      detail: "🔍 Detail Mode - Expanded nodes",
    };

    setModeChangeToast(modeNames[viewLevel]);
    const timer = setTimeout(() => setModeChangeToast(null), 2000);
    return () => clearTimeout(timer);
  }, [viewLevel]);

  // Handle zoom level changes - ENHANCED: More dramatic differences between view levels
  const handleZoomLevelChange = useCallback(
    (level: "overview" | "cluster" | "detail") => {
      // Prevent multiple simultaneous zoom operations
      if (isZooming) return;

      setIsZooming(true);

      // Clear any existing timeout
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }

      // Apply zoom changes with more dramatic differences
      zoomTimeoutRef.current = setTimeout(() => {
        let targetZoom: number;
        let fitViewPadding: number;

        switch (level) {
          case "overview":
            // Much more zoomed out for true overview
            targetZoom = MAP_CONSTANTS.ZOOM.LEVELS.OVERVIEW * 0.6; // 40% more zoomed out
            fitViewPadding = 0.2; // More padding for overview
            break;
          case "cluster":
            // Standard zoom for balanced work
            targetZoom = MAP_CONSTANTS.ZOOM.LEVELS.CLUSTER;
            fitViewPadding = 0.1; // Standard padding
            break;
          case "detail":
            // Much more zoomed in for detailed examination
            targetZoom = MAP_CONSTANTS.ZOOM.LEVELS.DETAIL * 1.5; // 50% more zoomed in
            fitViewPadding = 0.05; // Minimal padding for detail view
            break;
          default:
            targetZoom = MAP_CONSTANTS.ZOOM.LEVELS.CLUSTER;
            fitViewPadding = 0.1;
        }

        // Apply zoom first, then fit view with appropriate padding
        zoomTo(targetZoom);

        // Delay fit view to allow zoom to complete
        setTimeout(() => {
          fitView({ padding: fitViewPadding, duration: 400 });

          // Reset zooming flag after operation completes
          setTimeout(() => {
            setIsZooming(false);
          }, 500);
        }, 200);
      }, 50);
    },
    [fitView, zoomTo, isZooming]
  );

  // ENHANCED: Auto-adjust view when cluster focus changes with proper recentering
  useEffect(() => {
    if (isUserInteractingRef.current) return;

    if (focusedCluster && !isZooming) {
      // When focusing on a cluster, automatically adjust to cluster view if in overview
      if (viewLevel === "overview") {
        handleZoomLevelChange("cluster");
      }

      // Fit view to focused cluster with appropriate delay and better centering
      setTimeout(() => {
        fitView({
          padding: 0.15,
          duration: 600,
          includeHiddenNodes: false, // Only fit visible nodes
        });
      }, 300);
    } else if (!focusedCluster && !isZooming) {
      // When clearing cluster focus, ensure proper recentering
      setTimeout(() => {
        fitView({
          padding: viewLevel === "overview" ? 0.2 : 0.1,
          duration: 400,
          includeHiddenNodes: false,
        });
      }, 200);
    }
  }, [focusedCluster, viewLevel, handleZoomLevelChange, fitView, isZooming]);

  // ENHANCED: Force re-render and reposition when view level changes
  useEffect(() => {
    if (isUserInteractingRef.current) return;

    if (!isZooming && layoutedNodes.length > 0) {
      // Immediate fit view when layout changes due to view level
      const delay = viewLevel === "overview" ? 300 : 200;
      setTimeout(() => {
        const padding =
          viewLevel === "overview" ? 0.2 : viewLevel === "detail" ? 0.05 : 0.1;
        fitView({
          padding,
          duration: 400,
          includeHiddenNodes: false,
        });
      }, delay);
    }
  }, [viewLevel, layoutedNodes, fitView, isZooming]);

  // Find nodes on path to goal
  const nodesOnGoalPath = useMemo(() => {
    return findPathToGoal(goalId, filteredNodes);
  }, [goalId, filteredNodes, findPathToGoal]);

  // Generate node positions for cluster visualization
  const nodePositions = useMemo(() => {
    const positions: Record<
      string,
      { x: number; y: number; width: number; height: number }
    > = {};

    layoutedNodes.forEach((node) => {
      const sizeVariant = getSizeVariant();
      positions[node.id] = {
        x: node.position.x,
        y: node.position.y,
        width:
          sizeVariant === "compact"
            ? MAP_CONSTANTS.NODE.WIDTH.COMPACT
            : sizeVariant === "expanded"
              ? MAP_CONSTANTS.NODE.WIDTH.EXPANDED
              : MAP_CONSTANTS.NODE.WIDTH.STANDARD,
        height:
          sizeVariant === "compact"
            ? MAP_CONSTANTS.NODE.HEIGHT.COMPACT
            : sizeVariant === "expanded"
              ? MAP_CONSTANTS.NODE.HEIGHT.EXPANDED
              : MAP_CONSTANTS.NODE.HEIGHT.STANDARD,
      };
    });

    return positions;
  }, [layoutedNodes, getSizeVariant]);

  // Get completed nodes set
  const completedNodes = useMemo(() => {
    return new Set(
      Object.keys(progress.completed).filter((id) => progress.completed[id])
    );
  }, [progress.completed]);

  // Convert to ReactFlow format
  const rfNodes: Node<any>[] = useMemo(() => {
    return layoutedNodes.map((node) => {
      const status = statuses[node.id];
      const isOnGoalPath = nodesOnGoalPath.has(node.id);

      return {
        id: node.id,
        type: "card", // Temporarily use simpler card node instead of techTree
        position: node.position,
        data: {
          topic: node.data,
          status,
          compact: getSizeVariant() === "compact",
          reviewed: progress.reviewed?.[node.id] || false,
          note: progress.notes?.[node.id] || "",
          goalId,
          isOnGoalPath,
          clusterFocused: focusedCluster === node.data.cluster,
          onToggleDone,
          onToggleReviewed,
          onSaveNote,
          onSetGoal,
          onClusterFocus: setFocusedCluster,
        },
      };
    });
  }, [
    layoutedNodes,
    statuses,
    nodesOnGoalPath,
    progress,
    goalId,
    focusedCluster,
    getSizeVariant,
    onToggleDone,
    onToggleReviewed,
    onSaveNote,
    onSetGoal,
  ]);

  // Convert edges to ReactFlow format with enhanced styling
  const rfEdges: Edge[] = useMemo(() => {
    return layoutedEdges.map((edge) => {
      const isOnGoalPath =
        nodesOnGoalPath.has(edge.source) && nodesOnGoalPath.has(edge.target);
      const sourceNode = filteredNodes.find((n) => n.id === edge.source);
      const targetNode = filteredNodes.find((n) => n.id === edge.target);
      const isCrossCluster =
        sourceNode && targetNode && sourceNode.cluster !== targetNode.cluster;
      const isCompleted =
        statuses[edge.source] === "completed" &&
        statuses[edge.target] === "completed";

      // Base edge object
      const baseEdge: Edge = {
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        type: "smoothstep",
        animated: false,
        markerEnd: defaultEdgeOptions.markerEnd,
        style: defaultEdgeOptions.style,
      };

      // Apply styling based on edge type
      if (isOnGoalPath) {
        baseEdge.animated = true;
        baseEdge.style = {
          stroke: "#eab308",
          strokeWidth: 3,
          opacity: 1,
          filter: "drop-shadow(0 0 10px rgba(234, 179, 8, 0.5))",
        };
        baseEdge.markerEnd = {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: "#eab308",
        };
      } else if (isCrossCluster) {
        baseEdge.style = {
          stroke: "#6b7280",
          strokeWidth: 1.5,
          opacity: 0.3,
          strokeDasharray: "5,5",
        };
        baseEdge.markerEnd = {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: "#6b7280",
        };
      } else if (isCompleted) {
        baseEdge.style = {
          stroke: "#10b981",
          strokeWidth: 2.5,
          opacity: 0.8,
        };
        baseEdge.markerEnd = {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: "#10b981",
        };
      }

      // Apply cluster focus dimming
      if (
        focusedCluster &&
        (!sourceNode ||
          !targetNode ||
          (sourceNode.cluster !== focusedCluster &&
            targetNode.cluster !== focusedCluster))
      ) {
        baseEdge.style = {
          ...baseEdge.style,
          opacity: 0.2,
        };
      }

      // Apply cluster hover dimming
      if (
        hoveredCluster &&
        (!sourceNode ||
          !targetNode ||
          (sourceNode.cluster !== hoveredCluster &&
            targetNode.cluster !== hoveredCluster))
      ) {
        const currentOpacity =
          typeof baseEdge.style?.opacity === "number"
            ? baseEdge.style.opacity
            : 1;
        baseEdge.style = {
          ...baseEdge.style,
          opacity: currentOpacity * 0.3,
        };
      }

      return baseEdge;
    });
  }, [
    layoutedEdges,
    nodesOnGoalPath,
    filteredNodes,
    statuses,
    focusedCluster,
    hoveredCluster,
  ]);

  // Handle cluster interactions
  const handleClusterHover = useCallback((clusterId: string | null) => {
    setHoveredCluster(clusterId);
  }, []);

  const handleClusterClick = useCallback(
    (clusterId: string) => {
      setFocusedCluster(focusedCluster === clusterId ? null : clusterId);
    },
    [focusedCluster]
  );

  // Auto-fit view when nodes change - FIXED: Only when not zooming
  useEffect(() => {
    if (isUserInteractingRef.current) return;

    if (rfNodes.length > 0 && !isZooming) {
      debouncedFitView(fitView, 500);
    }
  }, [rfNodes, rfEdges, fitView, isZooming]);

  // Cleanup zoom timeout on unmount
  useEffect(() => {
    return () => {
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0">
      {/* Main Map Container - Full Screen */}
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={MAP_CONSTANTS.ZOOM.MIN}
        maxZoom={MAP_CONSTANTS.ZOOM.MAX}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false} // Disable dragging for consistent layout
        nodesConnectable={false} // Disable connection creation
        elementsSelectable={true} // Allow selection for better UX
        onMoveStart={() => {
          isUserInteractingRef.current = true;
        }}
        onMoveEnd={() => {
          setTimeout(() => {
            isUserInteractingRef.current = false;
          }, 150);
        }}
        onNodeClick={(e, node) => {
          fitView({
            nodes: [{ id: node.id }],
            padding: viewLevel === "detail" ? 0.05 : 0.15,
            duration: 400,
            includeHiddenNodes: false,
          });
        }}
      >
        {/* Enhanced MiniMap with cluster colors */}
        <MiniMap
          zoomable
          pannable
          position="bottom-right"
          nodeColor={(node) => {
            const nodeData = rfNodes.find((n) => n.id === node.id)?.data;
            if (!nodeData) return "#94a3b8"; // Default gray

            const status = nodeData.status;
            if (status === "completed") return "#10b981"; // Green
            if (status === "available") return "#3b82f6"; // Blue
            if (status === "locked") return "#6b7280"; // Gray

            return "#94a3b8";
          }}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            border: "2px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        />

        {/* Enhanced Controls */}
        <Controls
          position="top-right"
          showZoom={true}
          showFitView={true}
          showInteractive={false}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            border: "2px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        />

        {/* Civilization-inspired background */}
        <Background
          gap={24}
          size={1}
          color="#e5e7eb"
          style={{
            backgroundColor: "#fafafa",
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.03) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(245, 158, 11, 0.03) 0%, transparent 50%)
            `,
          }}
        />

        {/* FIXED: Cluster Visualization Layer - Ensure proper rendering */}
        {/* Cluster overlays should live in a layer that follows the viewport transform */}
        <div
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${k})`,
            transformOrigin: "0 0",
            zIndex: 0, // below nodes, above background
          }}
        >
          <ClusterVisualization
            nodes={filteredNodes}
            nodePositions={nodePositions}
            completedNodes={completedNodes}
            style={clusterVisualizationStyle}
            zoomLevel={k}
            onClusterHover={handleClusterHover}
            onClusterClick={handleClusterClick}
          />
        </div>
      </ReactFlow>

      {/* Visual Legend */}
      <VisualLegend
        isOpen={showLegend}
        onToggle={() => setShowLegend(!showLegend)}
        compact={compact}
      />

      {/* ENHANCED: Mode Change HUD Toast */}
      {modeChangeToast && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm">
            <div className="text-sm font-medium">{modeChangeToast}</div>
          </div>
        </div>
      )}
    </div>
  );
};
