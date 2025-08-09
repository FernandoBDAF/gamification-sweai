"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";
import {
  Trophy,
  CheckCircle,
  Target,
  Download,
  Upload,
  Filter,
  Search,
} from "lucide-react";

import graphData from "@/data/graphData.json";
import {
  initialProgress,
  ProgressState,
  TopicStatus,
  loadProgress,
  saveProgress,
  computeStatus,
  awardXP,
  updateDailyStreak,
  clusterCompletion,
} from "@/lib/gamification";

export interface TopicNode {
  id: string;
  label: string;
  cluster: string;
  xp: number;
  deps: string[];
  links?: string[];
}
export interface GraphData {
  nodes: TopicNode[];
}

const clusterLabels: Record<string, string> = {
  C1: "AI Era & Roles",
  C2: "Agents & Protocols",
  C3: "Design Patterns",
  C4: "Caching",
  C5: "Security",
  C6: "Prompt & Context",
  C7: "System Design",
  C8: "Observability",
  C9: "Testing & QA",
  C10: "Cost Control",
};

const clusterColors: Record<string, string> = {
  C1: "bg-sky-50 border-sky-400",
  C2: "bg-emerald-50 border-emerald-400",
  C3: "bg-amber-50 border-amber-400",
  C4: "bg-indigo-50 border-indigo-400",
  C5: "bg-rose-50 border-rose-400",
  C6: "bg-teal-50 border-teal-400",
  C7: "bg-fuchsia-50 border-fuchsia-400",
  C8: "bg-slate-50 border-slate-400",
  C9: "bg-lime-50 border-lime-400",
  C10: "bg-purple-50 border-purple-400",
};

export default function AILearningGraph() {
  const data = graphData as GraphData;
  const [progress, setProgress] = useState<ProgressState>(initialProgress);
  const [clusterFilter, setClusterFilter] = useState<string>("ALL");
  const [hideCompleted, setHideCompleted] = useState<boolean>(false);
  const [showOnlyUnlockable, setShowOnlyUnlockable] = useState<boolean>(false);
  const [goalId, setGoalId] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // Load & persist progress, update daily streak
  useEffect(() => setProgress((_) => updateDailyStreak(loadProgress())), []);
  useEffect(() => saveProgress(progress), [progress]);

  const topicsById = useMemo(
    () => Object.fromEntries(data.nodes.map((n) => [n.id, n])),
    [data]
  );

  // Cluster index for completion badges
  const topicsByCluster = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const n of data.nodes) {
      (map[n.cluster] ||= []).push(n.id);
    }
    return map;
  }, [data]);

  const statuses = useMemo(() => {
    const s: Record<string, TopicStatus> = {};
    for (const n of data.nodes)
      s[n.id] = computeStatus(n.id, n.deps, progress.completed);
    return s;
  }, [data.nodes, progress.completed]);

  const byClusterCompletion = useMemo(
    () => clusterCompletion(progress.completed, topicsByCluster),
    [progress.completed, topicsByCluster]
  );

  // Build nodes/edges with basic layout heuristic
  const { rfNodes, rfEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const colMap: Record<string, number> = {};
    Object.keys(clusterLabels).forEach((c, i) => (colMap[c] = i));

    for (const n of data.nodes) {
      const status = statuses[n.id];
      const includeByCluster =
        clusterFilter === "ALL" || n.cluster === clusterFilter;
      const includeByStatus = !hideCompleted || status !== "completed";
      const includeUnlockable = !showOnlyUnlockable || status !== "locked";
      const includeSearch =
        !search ||
        n.label.toLowerCase().includes(search.toLowerCase()) ||
        n.id.toLowerCase().includes(search.toLowerCase());
      if (
        !(
          includeByCluster &&
          includeByStatus &&
          includeUnlockable &&
          includeSearch
        )
      )
        continue;

      const col = colMap[n.cluster] ?? 0;
      const row = n.deps?.length || 0;
      nodes.push({
        id: n.id,
        data: { topic: n, status },
        position: {
          x: col * 320 + Math.random() * 40,
          y: row * 140 + Math.random() * 30,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: {
          borderRadius: 16,
          borderWidth: 2,
          background: "transparent",
          borderColor: "rgba(0,0,0,0)",
        },
        type: "default",
      });

      for (const d of n.deps || []) {
        edges.push({
          id: `${d}->${n.id}` + Math.random(),
          source: d,
          target: n.id,
          animated: true,
        });
      }
    }

    return { rfNodes: nodes, rfEdges: edges };
  }, [
    data.nodes,
    statuses,
    clusterFilter,
    hideCompleted,
    showOnlyUnlockable,
    search,
  ]);

  const totalNodes = data.nodes.length;
  const completedCount = Object.values(progress.completed).filter(
    Boolean
  ).length;
  const completionPct = Math.round(
    (completedCount / Math.max(1, totalNodes)) * 100
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
        return {
          ...withStreak,
          completed: { ...withStreak.completed, [id]: nowCompleted },
        };
      });
    },
    [topicsById, progress.completed]
  );

  function exportProgress() {
    const blob = new Blob([JSON.stringify(progress, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-learning-graph-progress.json";
    a.click();
  }

  function importProgress(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setProgress(JSON.parse(String(reader.result)));
      } catch {}
    };
    reader.readAsText(file);
  }

  function nodeStyle(topic: TopicNode, status: TopicStatus): string {
    const base =
      "rounded-2xl border p-3 shadow-sm min-w-[220px] max-w-[320px] bg-white";
    const cluster =
      clusterColors[topic.cluster] || "bg-white border-neutral-300";
    const states: Record<TopicStatus, string> = {
      locked: "opacity-50 grayscale",
      available: "",
      completed: "ring-2 ring-green-500",
    };
    return `${base} ${cluster} ${states[status]}`;
  }

  const NodeOverlay: React.FC<{ node: Node }> = ({ node }) => {
    const { topic, status } = node.data as {
      topic: TopicNode;
      status: TopicStatus;
    };
    const completed = status === "completed";
    const locked = status === "locked";
    return (
      <div
        className="absolute"
        style={{
          transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={nodeStyle(topic, status)}
        >
          <div className="flex items-start gap-3">
            <span className="badge">
              {clusterLabels[topic.cluster] || topic.cluster}
            </span>
            <div className="ml-auto flex items-center gap-2">
              {completed && <Trophy className="w-4 h-4 text-green-600" />}
              <span className="badge">{topic.xp} XP</span>
            </div>
          </div>
          <div className="mt-2 font-medium">{topic.label}</div>
          <div className="mt-2 text-xs text-neutral-500">
            Deps: {topic.deps.length ? topic.deps.join(", ") : "None"}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              className={`btn ${completed ? "btn-outline" : "btn-primary"}`}
              onClick={() => toggleComplete(topic.id)}
              disabled={locked}
            >
              <CheckCircle className="w-4 h-4 mr-1 inline" />{" "}
              {completed ? "Undo" : locked ? "Locked" : "Mark Done"}
            </button>
            {goalId !== topic.id && (
              <button
                className="btn btn-outline"
                onClick={() => setGoalId(topic.id)}
              >
                <Target className="w-4 h-4 mr-1 inline" /> Set Goal
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Left Panel */}
      <div className="col-span-12 lg:col-span-3 space-y-3">
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Progress</div>
            <div className="flex items-center gap-2">
              <span className="badge">Lvl {progress.level}</span>
              <span className="badge">Streak {progress.streakDays || 0}🔥</span>
            </div>
          </div>
          <div className="progress">
            <span style={{ width: `${completionPct}%` }} />
          </div>
          <div className="text-xs text-neutral-500">
            {Object.values(progress.completed).filter(Boolean).length}/
            {totalNodes} topics • {progress.xp} XP
          </div>
        </div>

        <div className="card p-4 space-y-3">
          <div className="font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
          </div>
          <select
            className="select"
            value={clusterFilter}
            onChange={(e) => setClusterFilter(e.target.value)}
          >
            <option value="ALL">All Clusters</option>
            {Object.keys(clusterLabels).map((c) => (
              <option key={c} value={c}>
                {clusterLabels[c]}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <input
              className="input"
              placeholder="Search topic…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox"
              checked={hideCompleted}
              onChange={(e) => setHideCompleted(e.target.checked)}
            />
            <span className="text-sm">Hide completed</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox"
              checked={showOnlyUnlockable}
              onChange={(e) => setShowOnlyUnlockable(e.target.checked)}
            />
            <span className="text-sm">Show only unlockable</span>
          </label>
          <div className="pt-2">
            <div className="text-xs text-neutral-500 mb-2">
              Goal (highlights a path in the tech tree)
            </div>
            <select
              className="select"
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
            >
              <option value="">None</option>
              {data.nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card p-4 space-y-3">
          <div className="font-semibold">Cluster Badges</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(byClusterCompletion).map(([cluster, stats]) => (
              <div key={cluster} className="border rounded-xl p-2 text-xs">
                <div className="font-medium">
                  {clusterLabels[cluster] || cluster}
                </div>
                <div className="text-neutral-500">
                  {stats.done}/{stats.total} • {stats.pct}%
                </div>
                {stats.pct === 100 && (
                  <div className="text-green-700 font-semibold mt-1">
                    Badge earned 🏅
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4 space-y-3">
          <div className="font-semibold">Progress Data</div>
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={exportProgress}>
              <Download className="w-4 h-4 mr-1" /> Export
            </button>
            <label className="btn btn-outline cursor-pointer">
              <Upload className="w-4 h-4 mr-1" /> Import
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) =>
                  e.target.files && importProgress(e.target.files[0])
                }
              />
            </label>
          </div>
        </div>
      </div>

      {/* Graph Area */}
      <div className="col-span-12 lg:col-span-9 relative rounded-2xl border overflow-hidden">
        <ReactFlow nodes={rfNodes} edges={rfEdges} fitView>
          <MiniMap zoomable pannable />
          <Controls />
          <Background gap={24} />
        </ReactFlow>
        <div className="pointer-events-none absolute inset-0">
          {rfNodes.map((n) => (
            <div key={n.id} className="pointer-events-auto">
              <NodeOverlay node={n} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
