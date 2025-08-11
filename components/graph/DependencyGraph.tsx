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
import { ProgressState, computeStatus } from "@/lib/data/graph-progress";
import {
  layoutDagre,
  layoutClusterFocus,
  layoutOverview,
  LayoutDirection,
  SizeVariant,
} from "@/lib/layout/dagre";
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
import {
  clusterCompletion,
  isClusterUnlocked,
} from "@/lib/data/graph-progress";
import { buildEdges as buildStyledEdges } from "@/lib/build/build-edges";

interface DependencyGraphProps {
  nodes: TopicNode[];
  view: ViewMode;
  clusterFilter: string;
  clusterFilters?: string[]; // optional multi-select support
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
  selectedNodeId?: string | null;
  onSelectNode?: (id: string | null) => void;
  onOpenPanel?: (id: string) => void;
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
  clusterFilters,
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
  selectedNodeId: selectedNodeIdProp,
  onSelectNode,
  onOpenPanel,
}) => {
  const { fitView, zoomTo, getZoom, setViewport } = useReactFlow();
  const [focusedCluster, setFocusedCluster] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(1);
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);
  const [isZooming, setIsZooming] = useState(false);
  const zoomTimeoutRef = useRef<NodeJS.Timeout>();
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [internalSelectedNodeId, setInternalSelectedNodeId] = useState<
    string | null
  >(null);

  // Track user interaction to suppress auto fitView during manual pan/zoom
  const isUserInteractingRef = useRef(false);

  // Debounce hover to avoid flicker
  const hoverTimerRef = useRef<NodeJS.Timeout>();
  const handleNodeMouseEnter = useCallback((_: any, node: any) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setHoveredNodeId(node.id);
    }, 120);
  }, []);
  const handleNodeMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoveredNodeId(null);
  }, []);

  // Dev overlay toggle
  const [devOpen, setDevOpen] = useState<boolean>(false);
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("dev") === "1") setDevOpen(true);
    } catch {}
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "d") setDevOpen((v) => !v);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Render counters
  const renderCountsRef = useRef<{ nodes: number; edges: number }>({
    nodes: 0,
    edges: 0,
  });

  // Get current viewport transform so overlays follow pan/zoom
  const [tx, ty, k] = useStore((s) => s.transform);

  // Axis-constrained panning support
  const handleMoveStart = useCallback(() => {
    isUserInteractingRef.current = true;
  }, []);
  const handleMoveEnd = useCallback(() => {
    setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 150);
  }, []);

  // Convert clusterStyle to proper ClusterVisualizationStyle
  const clusterVisualizationStyle: ClusterVisualizationStyle = useMemo(() => {
    // MVP: use a simple column-like translucent background for all options
    if (clusterStyle === "none") return "none";
    return "translucent-background";
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
    // Derive cluster prerequisites from cross-cluster dependencies
    const allClusters = Array.from(new Set(nodes.map((n) => n.cluster)));
    const prereqMap: Record<string, string[]> = {};
    nodes.forEach((n) => {
      (n.deps || []).forEach((depId) => {
        const depNode = nodes.find((x) => x.id === depId);
        if (depNode && depNode.cluster !== n.cluster) {
          const set = new Set(prereqMap[n.cluster] || []);
          set.add(depNode.cluster);
          prereqMap[n.cluster] = Array.from(set);
        }
      });
    });

    // Build byCluster index and completion pct
    const byCluster: Record<string, string[]> = {};
    nodes.forEach((n) => {
      (byCluster[n.cluster] ||= []).push(n.id);
    });
    const completionByCluster = clusterCompletion(
      progress.completed,
      byCluster
    );
    const unlockedClusters = new Set<string>(
      allClusters.filter((cid) =>
        isClusterUnlocked(
          cid,
          nodes.map((n) => ({ id: n.id, cluster: n.cluster, deps: n.deps })),
          progress.completed,
          100
        )
      )
    );

    const statusMap: Record<string, any> = {};
    for (const node of nodes) {
      statusMap[node.id] = computeStatus(
        node.id,
        node.deps,
        progress.completed,
        1.0, // 100% deps threshold for MVP
        !unlockedClusters.has(node.cluster)
      );
    }
    return statusMap;
  }, [nodes, progress.completed]);

  // Filter nodes based on current settings and cluster focus
  const filteredNodes = useMemo(() => {
    let filtered = nodes.filter((node) => {
      const status = statuses[node.id];
      const multiActive = clusterFilters && clusterFilters.length > 0;
      const includeByCluster = multiActive
        ? clusterFilters!.includes(node.cluster)
        : clusterFilter === "ALL" || node.cluster === clusterFilter;
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
  }, [nodes, clusterFilter, clusterFilters, search, statuses, focusedCluster]);

  // Compute direct dependencies/dependents for active focus node (hovered or selected)
  const selectedNodeId = selectedNodeIdProp ?? internalSelectedNodeId;
  const setSelectedNode = useCallback(
    (id: string | null) => {
      if (onSelectNode) onSelectNode(id);
      if (selectedNodeIdProp === undefined) setInternalSelectedNodeId(id);
    },
    [onSelectNode, selectedNodeIdProp]
  );
  const activeNodeId = selectedNodeId || hoveredNodeId;
  const dependencyIds = useMemo(() => {
    if (!activeNodeId) return new Set<string>();
    const n = filteredNodes.find((n) => n.id === activeNodeId);
    if (!n) return new Set<string>();
    return new Set<string>(n.deps);
  }, [activeNodeId, filteredNodes]);
  const dependentIds = useMemo(() => {
    if (!activeNodeId) return new Set<string>();
    const dependents = filteredNodes.filter((n) =>
      n.deps.includes(activeNodeId)
    );
    return new Set<string>(dependents.map((n) => n.id));
  }, [activeNodeId, filteredNodes]);

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

  // ENHANCED: Get size variant based on view level for more dramatic differences
  const getSizeVariant = useCallback(() => {
    switch (viewLevel) {
      case "overview":
        return "compact"; // Much smaller nodes for overview
      case "detail":
        return "expanded"; // Larger nodes for detail view
      case "cluster":
      default:
        return "standard"; // Standard size for cluster view
    }
  }, [viewLevel]);

  // ENHANCED: Get layout spacing based on view level
  const getLayoutSpacing = useCallback(() => {
    switch (viewLevel) {
      case "overview":
        return {
          nodeSpacing: 0.4, // Very compact spacing
          clusterSpacing: 0.6, // Tighter cluster separation
          padding: 0.15, // Minimal padding
        };
      case "detail":
        return {
          nodeSpacing: 2.5, // Much more expanded spacing
          clusterSpacing: 1.8, // Generous cluster separation
          padding: 0.05, // Minimal padding for detail focus
        };
      case "cluster":
      default:
        return {
          nodeSpacing: 1.0, // Standard balanced spacing
          clusterSpacing: 1.0, // Standard cluster separation
          padding: 0.1, // Standard padding
        };
    }
  }, [viewLevel]);

  // FIXED: Layout nodes using view-level aware algorithm
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const edges = buildEdges(filteredNodes);
    const sizeVariant = getSizeVariant();
    const { nodeSpacing, clusterSpacing, padding } = getLayoutSpacing();

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
        nodeSpacing: nodeSpacing, // Much tighter spacing
        expandedSpacing: false,
      });
    } else if (viewLevel === "detail") {
      // Detail mode - much more expanded layout with larger spacing
      return layoutDagre(filteredNodes, edges, layoutDir, sizeVariant, {
        clusterSpacing: true,
        expandedSpacing: true,
        nodeSpacing: nodeSpacing, // Much more spacing between nodes
      });
    } else {
      // Cluster mode - standard balanced layout
      return layoutDagre(filteredNodes, edges, layoutDir, sizeVariant, {
        clusterSpacing: true,
        nodeSpacing: nodeSpacing, // Standard spacing
      });
    }
  }, [
    filteredNodes,
    buildEdges,
    focusedCluster,
    layoutDir,
    viewLevel,
    getSizeVariant,
    getLayoutSpacing,
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
            targetZoom = MAP_CONSTANTS.ZOOM.LEVELS.OVERVIEW * 0.5; // 50% more zoomed out
            fitViewPadding = 0.25; // More padding for overview
            break;
          case "cluster":
            // Standard zoom for balanced work
            targetZoom = MAP_CONSTANTS.ZOOM.LEVELS.CLUSTER;
            fitViewPadding = 0.15; // Standard padding
            break;
          case "detail":
            // Much more zoomed in for detailed examination
            targetZoom = MAP_CONSTANTS.ZOOM.LEVELS.DETAIL * 1.8; // 80% more zoomed in
            fitViewPadding = 0.03; // Minimal padding for detail view
            break;
          default:
            targetZoom = MAP_CONSTANTS.ZOOM.LEVELS.CLUSTER;
            fitViewPadding = 0.15;
        }

        // Apply zoom first, then fit view with appropriate padding
        zoomTo(targetZoom);

        // Delay fit view to allow zoom to complete
        setTimeout(() => {
          fitView({
            padding: fitViewPadding,
            duration: 600,
            includeHiddenNodes: false,
          });

          // Reset zooming flag after operation completes
          setTimeout(() => {
            setIsZooming(false);
          }, 700);
        }, 300);
      }, 100);
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
    renderCountsRef.current.nodes++;
    return layoutedNodes.map((node) => {
      const status = statuses[node.id];
      const isOnGoalPath = nodesOnGoalPath.has(node.id);
      let highlightType: "primary" | "dependency" | "dependent" | null = null;
      if (activeNodeId) {
        if (node.id === activeNodeId) highlightType = "primary";
        else if (dependencyIds.has(node.id)) highlightType = "dependency";
        else if (dependentIds.has(node.id)) highlightType = "dependent";
      }
      const progressPct = status === "completed" ? 100 : 0;

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
          highlightType,
          progressPct,
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
    activeNodeId,
    dependencyIds,
    dependentIds,
  ]);

  // Convert edges to ReactFlow format with enhanced styling
  const rfEdges: Edge[] = useMemo(() => {
    renderCountsRef.current.edges++;
    const inputs = layoutedEdges.map((e) => ({
      source: e.source,
      target: e.target,
    }));
    const baseEdges = buildStyledEdges(
      inputs,
      statuses as any,
      dependencyIds,
      dependentIds,
      activeNodeId || undefined
    );
    // Optionally dim by cluster focus/hover
    return baseEdges.map((edge) => {
      const sourceNode = filteredNodes.find((n) => n.id === edge.source);
      const targetNode = filteredNodes.find((n) => n.id === edge.target);
      if (
        focusedCluster &&
        (!sourceNode ||
          !targetNode ||
          (sourceNode.cluster !== focusedCluster &&
            targetNode.cluster !== focusedCluster))
      ) {
        edge.style = { ...(edge.style || {}), opacity: 0.2 } as any;
      }
      if (
        hoveredCluster &&
        (!sourceNode ||
          !targetNode ||
          (sourceNode.cluster !== hoveredCluster &&
            targetNode.cluster !== hoveredCluster))
      ) {
        const currentOpacity =
          typeof edge.style?.opacity === "number"
            ? (edge.style!.opacity as number)
            : 1;
        edge.style = {
          ...(edge.style || {}),
          opacity: currentOpacity * 0.3,
        } as any;
      }
      return edge;
    });
  }, [
    layoutedEdges,
    nodesOnGoalPath,
    filteredNodes,
    statuses,
    focusedCluster,
    hoveredCluster,
    activeNodeId,
    dependencyIds,
    dependentIds,
  ]);

  // Handle cluster interactions
  const handleClusterHover = useCallback((clusterId: string | null) => {
    setHoveredCluster(clusterId);
  }, []);

  // ENHANCED: Handle cluster click with zoom and centering
  const handleClusterClick = useCallback(
    (clusterId: string) => {
      if (isUserInteractingRef.current) return;

      // Find all nodes in the clicked cluster
      const clusterNodes = filteredNodes.filter(
        (node) => node.cluster === clusterId
      );

      if (clusterNodes.length > 0) {
        // Fit view to the cluster with appropriate padding
        fitView({
          nodes: clusterNodes.map((n) => ({ id: n.id })),
          padding: 0.15,
          duration: 400,
          includeHiddenNodes: false,
        });

        // Show cluster selection feedback
        console.log(
          `Selected cluster: ${clusterId} with ${clusterNodes.length} nodes`
        );

        // TODO: Add cluster selection highlight and side panel details
      }
    },
    [filteredNodes, fitView]
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
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  return (
    <div className="relative h-full w-full min-w-0 overflow-hidden">
      {/* Main Map Container - Full Screen */}
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        className="!w-full !h-full"
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        // Lock zoom completely
        minZoom={1}
        maxZoom={1}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        onPaneClick={() => setSelectedNode(null)}
        onMoveStart={handleMoveStart}
        onMoveEnd={handleMoveEnd}
        // Selection only: no auto-center or fit
        onNodeClick={(e, node) => {
          e.preventDefault();
          setSelectedNode(selectedNodeId === node.id ? null : node.id);
        }}
        onNodeDoubleClick={(e, node) => {
          e.preventDefault();
          if (onOpenPanel) onOpenPanel(node.id);
        }}
      >
        {/* Enhanced MiniMap with cluster colors */}
        <MiniMap
          zoomable={false}
          pannable={false}
          position="bottom-right"
          nodeColor={(node) => {
            const nodeData = rfNodes.find((n) => n.id === node.id)?.data;
            if (!nodeData) return "#94a3b8";
            const status = nodeData.status;
            if (status === "completed") return "#10b981";
            if (status === "available") return "#3b82f6";
            if (status === "locked") return "#6b7280";
            return "#94a3b8";
          }}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            border: "2px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        />

        {/* Controls without zoom */}
        <Controls
          position="top-right"
          showZoom={false}
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
        {clusterVisualizationStyle !== "none" && (
          <div
            className="absolute top-0 left-0 pointer-events-none"
            style={{
              width: "100%",
              height: "100%",
              transform: `translate(${tx}px, ${ty}px) scale(${k})`,
              transformOrigin: "0 0",
              zIndex: 0,
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
        )}
      </ReactFlow>

      {/* Visual Legend */}
      <VisualLegend
        isOpen={showLegend}
        onToggle={() => setShowLegend(!showLegend)}
        compact={compact}
      />

      {/* Dev Overlay */}
      {devOpen && (
        <div className="absolute bottom-4 left-4 z-40 bg-black/80 text-white rounded-lg p-3 text-xs shadow-lg">
          <div className="font-semibold mb-1">Dev Overlay</div>
          <div>selectedNodeId: {selectedNodeId || "none"}</div>
          <div>dependencyIds: {Array.from(dependencyIds).length}</div>
          <div>dependentIds: {Array.from(dependentIds).length}</div>
          <div>
            filters:{" "}
            {clusterFilters && clusterFilters.length
              ? `clusters:${clusterFilters.length}`
              : "all clusters"}
          </div>
          <div>viewLevel: {viewLevel}</div>
          <div>layout: {layoutDir}</div>
          <div>renders.nodes: {renderCountsRef.current.nodes}</div>
          <div>renders.edges: {renderCountsRef.current.edges}</div>
        </div>
      )}

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
