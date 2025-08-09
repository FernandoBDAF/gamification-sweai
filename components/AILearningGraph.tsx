"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Position,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

import graphData from "@/data/graphData.json";
import {
  initialProgress,
  ProgressState,
  loadProgress,
  saveProgress,
  computeStatus,
  awardXP,
  updateDailyStreak,
  clusterCompletion,
} from "@/lib/gamification";
import { TopicNode, GraphData, ViewMode } from "@/lib/types";
import {
  getLayoutedElements,
  getClusterLayoutedElements,
} from "@/lib/graphLayout";

// Components
import { CardNode, CardNodeData, DependencyMatrix } from "@/components/graph";
import {
  ProgressPanel,
  FilterPanel,
  ClusterBadgesPanel,
  DataPanel,
  ViewPanel,
} from "@/components/panels";
import { KeyboardShortcutsPanel } from "@/components/panels/KeyboardShortcutsPanel";
import { Confetti } from "@/components/ui";

const nodeTypes = { card: CardNode };

function AILearningGraphFlow() {
  const data = graphData as GraphData;
  const [progress, setProgress] = useState<ProgressState>(initialProgress);
  const [clusterFilter, setClusterFilter] = useState<string>("ALL");
  const [hideCompleted, setHideCompleted] = useState<boolean>(false);
  const [showOnlyUnlockable, setShowOnlyUnlockable] = useState<boolean>(false);
  const [goalId, setGoalId] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [view, setView] = useState<ViewMode>("tree");
  const [compact, setCompact] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Load & persist progress, update daily streak
  useEffect(() => setProgress((_) => updateDailyStreak(loadProgress())), []);
  useEffect(() => saveProgress(progress), [progress]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "f":
          // Focus search input
          event.preventDefault();
          const searchInput = document.querySelector(
            'input[placeholder*="Search"]'
          ) as HTMLInputElement;
          if (searchInput) searchInput.focus();
          break;
        case "1":
          event.preventDefault();
          setView("tree");
          break;
        case "2":
          event.preventDefault();
          setView("cluster");
          break;
        case "3":
          event.preventDefault();
          setView("matrix");
          break;
        case "c":
          event.preventDefault();
          setCompact(!compact);
          break;
        case "h":
          event.preventDefault();
          setHideCompleted(!hideCompleted);
          break;
        case "escape":
          event.preventDefault();
          setGoalId("");
          setSearch("");
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [
    compact,
    hideCompleted,
    setView,
    setCompact,
    setHideCompleted,
    setGoalId,
    setSearch,
  ]);

  const topicsById = useMemo(
    () => Object.fromEntries(data.nodes.map((n) => [n.id, n])),
    [data]
  );

  // Cluster index for completion badges
  const topicsByCluster = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const n of data.nodes) (map[n.cluster] ||= []).push(n.id);
    return map;
  }, [data]);

  const statuses = useMemo(() => {
    const s: Record<string, any> = {};
    for (const n of data.nodes)
      s[n.id] = computeStatus(n.id, n.deps, progress.completed);
    return s;
  }, [data.nodes, progress.completed]);

  const byClusterCompletion = useMemo(
    () => clusterCompletion(progress.completed, topicsByCluster),
    [progress.completed, topicsByCluster]
  );

  const toggleComplete = useCallback(
    (id: string) => {
      const topic = topicsById[id];
      const status = computeStatus(id, topic.deps, progress.completed);
      if (status === "locked") return;
      setProgress((prev) => {
        const nowCompleted = !prev.completed[id];
        const xpDelta = nowCompleted ? topic?.xp || 0 : -(topic?.xp || 0);
        const withXP = awardXP(prev, xpDelta);
        const withStreak = updateDailyStreak(withXP);

        // Trigger confetti for completion (not for undo)
        if (nowCompleted) {
          setShowConfetti(true);
        }

        return {
          ...withStreak,
          completed: { ...withStreak.completed, [id]: nowCompleted },
        };
      });
    },
    [topicsById, progress.completed]
  );

  const toggleReviewed = useCallback((id: string) => {
    setProgress(
      (prev) =>
        ({
          ...prev,
          reviewed: { ...(prev.reviewed || {}), [id]: !prev.reviewed?.[id] },
        }) as ProgressState
    );
  }, []);

  const saveNote = useCallback((id: string, text: string) => {
    setProgress(
      (prev) =>
        ({
          ...prev,
          notes: { ...(prev.notes || {}), [id]: text },
        }) as ProgressState
    );
  }, []);

  const handleSetGoal = useCallback((id: string) => {
    setGoalId(id);
  }, []);

  // Filter nodes based on current settings
  const filteredNodes = useMemo(() => {
    return data.nodes.filter((n) => {
      const status = statuses[n.id];
      const includeByCluster =
        clusterFilter === "ALL" || n.cluster === clusterFilter;
      const includeByStatus = !hideCompleted || status !== "completed";
      const includeUnlockable = !showOnlyUnlockable || status !== "locked";
      const includeSearch =
        !search ||
        n.label.toLowerCase().includes(search.toLowerCase()) ||
        n.id.toLowerCase().includes(search.toLowerCase());

      return (
        includeByCluster &&
        includeByStatus &&
        includeUnlockable &&
        includeSearch
      );
    });
  }, [
    data.nodes,
    statuses,
    clusterFilter,
    hideCompleted,
    showOnlyUnlockable,
    search,
  ]);

  // Build nodes/edges with auto-layout
  const { rfNodes, rfEdges } = useMemo(() => {
    if (view === "matrix") return { rfNodes: [], rfEdges: [] };

    // Get layout based on view mode
    const layoutResult =
      view === "cluster" && clusterFilter !== "ALL"
        ? getClusterLayoutedElements(filteredNodes, clusterFilter)
        : getLayoutedElements(filteredNodes);

    const nodes: Node[] = layoutResult.nodes.map((layoutNode) => {
      const topic = layoutNode.data as TopicNode;
      const status = statuses[topic.id];

      return {
        id: topic.id,
        type: "card",
        data: {
          topic,
          status,
          compact,
          reviewed: progress.reviewed?.[topic.id],
          note: progress.notes?.[topic.id],
          goalId,
          onToggleDone: toggleComplete,
          onToggleReviewed: toggleReviewed,
          onSaveNote: saveNote,
          onSetGoal: handleSetGoal,
        } as CardNodeData,
        position: layoutNode.position,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: { background: "transparent", border: "none" },
      };
    });

    const edges: Edge[] = [];

    // Create edges
    filteredNodes.forEach((node) => {
      node.deps.forEach((dep) => {
        const depExists = filteredNodes.find((n) => n.id === dep);
        if (depExists) {
          const isGoalPath =
            goalId &&
            (node.id === goalId ||
              isOnPathToGoal(node.id, goalId, topicsById) ||
              dep === goalId ||
              isOnPathToGoal(dep, goalId, topicsById));

          const isCrossCluster =
            view === "cluster" &&
            clusterFilter !== "ALL" &&
            (topicsById[dep]?.cluster !== clusterFilter ||
              node.cluster !== clusterFilter);

          edges.push({
            id: `${dep}-${node.id}`,
            source: dep,
            target: node.id,
            animated: isGoalPath ? true : false,
            style: {
              stroke: isGoalPath
                ? "#fbbf24"
                : isCrossCluster
                  ? "#d1d5db"
                  : "#6b7280",
              strokeWidth: isGoalPath ? 3 : 2,
              opacity: isCrossCluster ? 0.3 : 1,
            },
          });
        }
      });
    });

    return { rfNodes: nodes, rfEdges: edges };
  }, [
    view,
    filteredNodes,
    clusterFilter,
    statuses,
    compact,
    progress,
    goalId,
    toggleComplete,
    toggleReviewed,
    saveNote,
    handleSetGoal,
    topicsById,
  ]);

  // Helper function to check if a node is on the path to goal
  const isOnPathToGoal = useCallback(
    (
      nodeId: string,
      goalNodeId: string,
      topicsMap: Record<string, TopicNode>
    ): boolean => {
      if (nodeId === goalNodeId) return true;

      const visited = new Set<string>();
      const queue = [goalNodeId];

      while (queue.length > 0) {
        const current = queue.shift()!;
        if (visited.has(current)) continue;
        visited.add(current);

        const currentNode = topicsMap[current];
        if (!currentNode) continue;

        for (const dep of currentNode.deps) {
          if (dep === nodeId) return true;
          if (!visited.has(dep)) queue.push(dep);
        }
      }

      return false;
    },
    []
  );

  const totalNodes = data.nodes.length;
  const completedCount = Object.values(progress.completed).filter(
    Boolean
  ).length;
  const completionPct = Math.round(
    (completedCount / Math.max(1, totalNodes)) * 100
  );

  const importProgress = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setProgress(JSON.parse(String(reader.result)));
      } catch {}
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Left Panel */}
      <div className="col-span-12 lg:col-span-3 space-y-3">
        <ProgressPanel
          progress={progress}
          completionPct={completionPct}
          totalNodes={totalNodes}
        />

        <FilterPanel
          clusterFilter={clusterFilter}
          setClusterFilter={setClusterFilter}
          search={search}
          setSearch={setSearch}
          hideCompleted={hideCompleted}
          setHideCompleted={setHideCompleted}
          showOnlyUnlockable={showOnlyUnlockable}
          setShowOnlyUnlockable={setShowOnlyUnlockable}
          goalId={goalId}
          setGoalId={setGoalId}
          nodes={data.nodes}
        />

        <ClusterBadgesPanel byClusterCompletion={byClusterCompletion} />

        <DataPanel progress={progress} onImportProgress={importProgress} />

        <ViewPanel
          view={view}
          setView={setView}
          compact={compact}
          setCompact={setCompact}
        />
      </div>

      {/* Right Panel: Graph or Matrix */}
      <div className="col-span-12 lg:col-span-9 relative rounded-2xl border overflow-hidden h-[60vh] sm:h-[70vh] lg:h-[80vh]">
        {view === "matrix" ? (
          <DependencyMatrix nodes={data.nodes} topicsById={topicsById} />
        ) : (
          <div style={{ width: "100%", height: "100%" }}>
            <ReactFlow
              nodes={rfNodes}
              edges={rfEdges}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.1 }}
              minZoom={0.05}
              maxZoom={1.5}
              defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
              attributionPosition="bottom-left"
            >
              <MiniMap
                zoomable
                pannable
                nodeColor={(node) => {
                  const status = statuses[node.id];
                  if (status === "completed") return "#10b981";
                  if (status === "available") return "#3b82f6";
                  return "#6b7280";
                }}
                className="!w-32 !h-24 sm:!w-48 sm:!h-36"
              />
              <Controls
                showZoom={true}
                showFitView={true}
                showInteractive={false}
                className="!bottom-4 !left-4"
              />
              <Background gap={24} />
            </ReactFlow>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsPanel />

      {/* Celebration Confetti */}
      <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
    </div>
  );
}

export default function AILearningGraph() {
  return (
    <ReactFlowProvider>
      <AILearningGraphFlow />
    </ReactFlowProvider>
  );
}
