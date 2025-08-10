"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { ReactFlowProvider } from "reactflow";
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

// Components
import { DependencyGraph, DependencyMatrix } from "@/components/graph";
import {
  ProgressPanel,
  FilterPanel,
  ClusterFilterPanel,
  GoalPanel,
  ClusterBadgesPanel,
  DataPanel,
  ViewPanel,
} from "@/components/panels";
import { KeyboardShortcutsPanel } from "@/components/panels/KeyboardShortcutsPanel";
import { Confetti, ResponsiveSidebar, usePanelControls } from "@/components/ui";

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

  // Add missing state for view level and cluster style controls
  const [viewLevel, setViewLevel] = useState<"overview" | "cluster" | "detail">(
    "cluster"
  );
  const [clusterStyle, setClusterStyle] = useState<string>("background");
  const [layoutDirection, setLayoutDirection] = useState<"TB" | "LR">("TB");

  // Get compact mode from panel controls
  const { compactMode } = usePanelControls();

  // Helper function to get cluster display name
  const getClusterDisplayName = (clusterId: string) => {
    const clusterNames: Record<string, string> = {
      C1: "Architecture & AI Impact",
      C2: "Prompt Engineering",
      C3: "AI Development Tools",
      C4: "Machine Learning Foundations",
      C5: "AI Ethics & Safety",
      C6: "Data Engineering",
      C7: "AI Integration Patterns",
      C8: "Performance & Optimization",
      C9: "AI Testing & Validation",
      C10: "Advanced AI Systems",
    };
    return clusterNames[clusterId] || clusterId;
  };

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

  // Filter nodes for display (used by both graph and matrix views)
  const filteredNodes = useMemo(() => {
    return data.nodes.filter((n) => {
      const status = computeStatus(n.id, n.deps, progress.completed);
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
    clusterFilter,
    hideCompleted,
    showOnlyUnlockable,
    search,
    progress.completed,
  ]);

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
    <div className="h-full min-w-0 flex flex-col overflow-hidden">
      {/* Horizontal Navigation Bar with All Panels */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0 overflow-x-auto">
        {/* Keep the bar scrollable if needed, but the map below must not expand the page */}
        <div className="flex items-center gap-6 p-3 min-w-max overflow-x-auto">
          {/* Progress Panel - Compact Horizontal */}
          <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">
                  {Math.floor((progress.xp || 0) / 100) + 1}
                </span>
              </div>
              <div>
                <div className="text-xs font-semibold text-blue-800">
                  {progress.xp || 0} XP • {completionPct}%
                </div>
                <div className="text-xs text-blue-600">
                  {progress.streakDays || 0} day streak
                </div>
              </div>
            </div>
          </div>

          {/* Search - Compact */}
          <div className="flex items-center gap-2">
            <input
              className="w-48 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters - Compact Toggles */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={hideCompleted}
                onChange={(e) => setHideCompleted(e.target.checked)}
                className="rounded"
              />
              <span className="text-gray-700">Hide completed</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showOnlyUnlockable}
                onChange={(e) => setShowOnlyUnlockable(e.target.checked)}
                className="rounded"
              />
              <span className="text-gray-700">Only unlockable</span>
            </label>
          </div>

          {/* Cluster Filter - Compact Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Cluster:
            </label>
            <select
              value={clusterFilter}
              onChange={(e) => setClusterFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Clusters</option>
              {Array.from(new Set(data.nodes.map((n) => n.cluster)))
                .sort()
                .map((cluster) => (
                  <option key={cluster} value={cluster}>
                    {getClusterDisplayName(cluster)}
                  </option>
                ))}
            </select>
          </div>

          {/* Goal Selector - Compact */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Goal:</label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No Goal</option>
              {data.nodes
                .filter(
                  (n) =>
                    computeStatus(n.id, n.deps, progress.completed) !== "locked"
                )
                .map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.label}
                  </option>
                ))}
            </select>
          </div>

          {/* Cluster Badges - Compact Display */}
          <div className="flex items-center gap-1">
            {Object.entries(byClusterCompletion)
              .sort(([a], [b]) => a.localeCompare(b))
              .slice(0, 5) // Show first 5 clusters
              .map(([clusterId, completion]) => {
                const medal =
                  completion.pct >= 100
                    ? "🥇"
                    : completion.pct >= 50
                      ? "🥈"
                      : "🥉";
                return (
                  <div
                    key={clusterId}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
                    title={`${clusterId}: ${completion.pct}%`}
                  >
                    <span>{medal}</span>
                    <span className="font-medium">
                      {getClusterDisplayName(clusterId)}
                    </span>
                    <span className="text-gray-600">{completion.pct}%</span>
                  </div>
                );
              })}
            {Object.keys(byClusterCompletion).length > 5 && (
              <div className="text-xs text-gray-500 px-2">
                +{Object.keys(byClusterCompletion).length - 5} more
              </div>
            )}
          </div>

          {/* View Controls - Compact */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">View:</label>
            <div className="flex gap-1">
              {[
                { key: "tree", label: "Tree", icon: "🌲" },
                { key: "cluster", label: "Cluster", icon: "🎯" },
                { key: "matrix", label: "Matrix", icon: "📊" },
              ].map((viewOption) => (
                <button
                  key={viewOption.key}
                  onClick={() => setView(viewOption.key as ViewMode)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    view === viewOption.key
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                  title={viewOption.label}
                >
                  {viewOption.icon}
                </button>
              ))}
            </div>
          </div>

          {/* View Level Controls - Added */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Level:</label>
            <div className="flex gap-1">
              {[
                { key: "overview", label: "Overview", icon: "🌐" },
                { key: "cluster", label: "Cluster", icon: "🎯" },
                { key: "detail", label: "Detail", icon: "🔍" },
              ].map((level) => (
                <button
                  key={level.key}
                  onClick={() =>
                    setViewLevel(level.key as "overview" | "cluster" | "detail")
                  }
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    viewLevel === level.key
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                  title={level.label}
                >
                  <span className="mr-1">{level.icon}</span>
                  <span className="hidden lg:inline">{level.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cluster Style Controls - Added */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Style:</label>
            <div className="flex gap-1">
              {[
                { key: "none", label: "None", icon: "⭕" },
                {
                  key: "background",
                  label: "Background",
                  icon: "⬜",
                  primary: true,
                },
                { key: "hull", label: "Hull", icon: "🔷" },
                { key: "bubble", label: "Bubble", icon: "🫧" },
                { key: "labels", label: "Labels", icon: "🏷️" },
              ].map((style) => (
                <button
                  key={style.key}
                  onClick={() => setClusterStyle(style.key)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    clusterStyle === style.key
                      ? style.primary
                        ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                        : "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                  title={style.label}
                >
                  <span>{style.icon}</span>
                  <span className="hidden xl:inline">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Layout Direction Controls - Added back */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Layout:</label>
            <div className="flex gap-1">
              {[
                { key: "TB", label: "↓", title: "Top to Bottom" },
                { key: "LR", label: "→", title: "Left to Right" },
              ].map((dir) => (
                <button
                  key={dir.key}
                  onClick={() => setLayoutDirection(dir.key as "TB" | "LR")}
                  title={dir.title}
                  className={`w-8 h-8 text-sm font-medium rounded-md transition-colors ${
                    layoutDirection === dir.key
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {dir.label}
                </button>
              ))}
            </div>
          </div>

          {/* Data Management - Compact */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(progress, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `ai-learning-progress-${
                  new Date().toISOString().split("T")[0]
                }.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
            >
              Export
            </button>
            <label className="px-3 py-2 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors cursor-pointer">
              Import
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) importProgress(file);
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Main Content Area - Full Height and Width */}
      <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
        {view === "matrix" ? (
          <DependencyMatrix nodes={filteredNodes} topicsById={topicsById} />
        ) : (
          <DependencyGraph
            nodes={filteredNodes}
            view={view}
            clusterFilter={clusterFilter}
            compact={compact}
            goalId={goalId}
            search={search}
            progress={progress}
            onToggleDone={toggleComplete}
            onToggleReviewed={toggleReviewed}
            onSaveNote={saveNote}
            onSetGoal={handleSetGoal}
            topicsById={topicsById}
            viewLevel={viewLevel}
            clusterStyle={clusterStyle}
            layoutDirection={layoutDirection}
          />
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
