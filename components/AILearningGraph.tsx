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
  const [clusterFilters, setClusterFilters] = useState<string[]>([]);
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

  // Popovers
  const [clusterMenuOpen, setClusterMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

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

  const allClusters = useMemo(
    () => Array.from(new Set(data.nodes.map((n) => n.cluster))).sort(),
    [data.nodes]
  );

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
        } as ProgressState;
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
      const multiActive = clusterFilters && clusterFilters.length > 0;
      const includeByCluster = multiActive
        ? clusterFilters.includes(n.cluster)
        : clusterFilter === "ALL" || n.cluster === clusterFilter;
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
    clusterFilters,
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

  const exportProgress = () => {
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
  };

  const importProgress = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setProgress(JSON.parse(String(reader.result)));
      } catch {}
    };
    reader.readAsText(file);
  };

  function Tip({ label }: { label: string }) {
    return (
      <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 text-white text-xs px-2 py-1 shadow opacity-0 group-hover:opacity-100 transition-opacity duration-100">
        {label}
      </span>
    );
  }

  return (
    <div className="h-full min-w-0 flex flex-col overflow-hidden">
      {/* Sticky, compact top bar with wrapping */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0 sticky top-0 z-30">
        <div className="flex flex-wrap items-center gap-3 px-3 py-2 min-w-0">
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
              className="w-48 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

          {/* Cluster Filter - Popover Checklist */}
          <div className="relative">
            <button
              className="px-2 py-1.5 text-sm border rounded-md bg-white hover:bg-gray-50"
              onClick={() => setClusterMenuOpen((v) => !v)}
              aria-expanded={clusterMenuOpen}
            >
              Clusters{" "}
              {clusterFilters.length ? `(${clusterFilters.length})` : "(All)"}
            </button>

            {clusterMenuOpen && (
              <div
                className="absolute z-20 mt-2 w-64 rounded-md border bg-white shadow-lg p-2 max-h-72 overflow-auto"
                onMouseLeave={() => setClusterMenuOpen(false)}
              >
                {/* All toggle */}
                <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clusterFilters.length === 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setClusterFilters([]);
                        setClusterFilter("ALL");
                      }
                    }}
                  />
                  <span className="text-sm font-medium">All Clusters</span>
                </label>

                <div className="my-1 h-px bg-gray-200" />

                {/* Individual clusters */}
                {allClusters.map((c) => {
                  const checked =
                    clusterFilters.length === 0
                      ? true
                      : clusterFilters.includes(c);
                  return (
                    <label
                      key={c}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setClusterFilter("ALL");
                          setClusterFilters((prev) => {
                            const set = new Set(prev);
                            if (e.target.checked) set.add(c);
                            else set.delete(c);
                            return Array.from(set);
                          });
                        }}
                      />
                      <span className="text-sm">{c}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Grouped View/Level/Style Controls - compact with instant tips */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 border rounded-md flex-wrap">
            {/* View */}
            {[
              { key: "tree", label: "Tree", icon: "🌲" },
              { key: "cluster", label: "Cluster", icon: "🎯" },
              { key: "matrix", label: "Matrix", icon: "📊" },
            ].map((viewOption) => (
              <button
                key={viewOption.key}
                onClick={() => setView(viewOption.key as ViewMode)}
                className={`relative group px-2 py-1 text-xs rounded hover:bg-gray-100 ${
                  view === viewOption.key
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : "text-gray-700"
                }`}
              >
                <span className="md:hidden">{viewOption.icon}</span>
                <span className="hidden md:inline-flex items-center gap-1">
                  {viewOption.icon}
                  <span>{viewOption.label}</span>
                </span>
                <Tip label={viewOption.label} />
              </button>
            ))}

            <span className="w-px h-5 bg-gray-300 mx-1" />

            {/* Level */}
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
                className={`relative group px-2 py-1 text-xs rounded hover:bg-gray-100 ${
                  viewLevel === level.key
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : "text-gray-700"
                }`}
              >
                <span className="md:hidden">{level.icon}</span>
                <span className="hidden md:inline-flex items-center gap-1">
                  {level.icon}
                  <span>{level.label}</span>
                </span>
                <Tip label={level.label} />
              </button>
            ))}

            <span className="w-px h-5 bg-gray-300 mx-1" />

            {/* Style */}
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
                className={`relative group px-2 py-1 text-xs rounded hover:bg-gray-100 ${
                  clusterStyle === style.key
                    ? style.primary
                      ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                      : "bg-blue-100 text-blue-800 border border-blue-200"
                    : "text-gray-700"
                }`}
              >
                <span className="md:hidden">{style.icon}</span>
                <span className="hidden md:inline-flex items-center gap-1">
                  {style.icon}
                  <span>{style.label}</span>
                </span>
                <Tip label={style.label} />
              </button>
            ))}
          </div>

          {/* More menu for rarely used actions */}
          <div className="relative">
            <button
              className="px-2 py-1.5 text-sm border rounded-md bg-white hover:bg-gray-50"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
            >
              + More
            </button>
            {moreOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md border bg-white shadow-lg p-2 z-20">
                <button
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50"
                  onClick={exportProgress}
                >
                  Export Progress
                </button>
                <label className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer block">
                  Import Progress
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) importProgress(file);
                      setMoreOpen(false);
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      <div className="px-3 py-1 bg-white/80 border-b border-gray-200 flex items-center gap-2 text-xs">
        {clusterFilters.length > 0 && (
          <>
            {clusterFilters.map((c) => (
              <span
                key={c}
                className="px-2 py-0.5 bg-gray-100 border rounded flex items-center gap-1"
              >
                <span className="hidden sm:inline">
                  Cluster: {getClusterDisplayName(c)}
                </span>
                <span className="sm:hidden">Cluster</span>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() =>
                    setClusterFilters(clusterFilters.filter((x) => x !== c))
                  }
                >
                  ×
                </button>
              </span>
            ))}
          </>
        )}
        <span className="px-2 py-0.5 bg-gray-100 border rounded flex items-center gap-1">
          <span className="hidden sm:inline">Style: {clusterStyle}</span>
          <span className="sm:hidden">Style</span>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setClusterStyle("none")}
            title="Clear style"
          >
            ×
          </button>
        </span>
        <span className="px-2 py-0.5 bg-gray-100 border rounded flex items-center gap-1">
          <span className="hidden sm:inline">Level: {viewLevel}</span>
          <span className="sm:hidden">Level</span>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setViewLevel("overview")}
            title="Reset to overview"
          >
            ×
          </button>
        </span>
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
            clusterFilters={clusterFilters}
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
