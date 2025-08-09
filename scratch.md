# 🧱 Next.js Project: AI Learning Graph (Gamified Tech Tree)

Below are **all files** for a ready-to-run **Next.js 14 + TypeScript + Tailwind** app that renders your interactive AI learning graph with gamified progress. Copy the structure as-is, or download from this canvas.

---

```txt
my-ai-learning-graph/
├─ package.json
├─ tsconfig.json
├─ next.config.mjs
├─ postcss.config.js
├─ tailwind.config.ts
├─ public/
│  └─ favicon.ico (optional)
├─ app/
│  ├─ layout.tsx
│  ├─ globals.css
│  └─ page.tsx
├─ components/
│  └─ AILearningGraph.tsx
├─ lib/
│  └─ gamification.ts
└─ data/
   └─ graphData.json
```

> **Run it**
>
> ```bash
> npm install
> npm run dev
> # open http://localhost:3000
> ```

---

## FILE: `package.json`
```json
{
  "name": "my-ai-learning-graph",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "framer-motion": "^11.2.10",
    "lucide-react": "^0.424.0",
    "next": "^14.2.5",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "reactflow": "^11.10.1"
  },
  "devDependencies": {
    "@types/node": "^20.11.30",
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.7",
    "typescript": "^5.4.5"
  }
}
```

---

## FILE: `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": {
      "@/*": ["*"]
    },
    "forceConsistentCasingInFileNames": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", "**/*.json"],
  "exclude": ["node_modules"]
}
```

---

## FILE: `next.config.mjs`
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;
```

---

## FILE: `postcss.config.js`
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

## FILE: `tailwind.config.ts`
```ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config
```

---

## FILE: `app/layout.tsx`
```tsx
export const metadata = {
  title: "AI Learning Graph",
  description: "Interactive, gamified tech tree for your AI-era SWE roadmap",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        {children}
      </body>
    </html>
  );
}
```

---

## FILE: `app/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* simple theming helpers */
.card { @apply rounded-2xl border bg-white shadow-sm; }
.btn { @apply inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium; }
.btn-primary { @apply bg-neutral-900 text-white border-neutral-900 hover:opacity-90; }
.btn-outline { @apply border-neutral-300 text-neutral-800 hover:bg-neutral-50; }
.badge { @apply inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs; }
.input { @apply w-full rounded-md border border-neutral-300 px-3 py-2 text-sm; }
.checkbox { @apply h-4 w-4 rounded border border-neutral-300; }
.select { @apply w-full rounded-md border border-neutral-300 px-3 py-2 text-sm bg-white; }
.progress { @apply h-2 w-full overflow-hidden rounded bg-neutral-200; }
.progress > span { @apply block h-full bg-neutral-900; }
```

---

## FILE: `app/page.tsx`
```tsx
import AILearningGraph from "@/components/AILearningGraph";

export default function Page() {
  return (
    <main className="max-w-[1600px] mx-auto p-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-1">AI Learning Graph</h1>
      <p className="text-neutral-600 mb-6">Interactive, gamified tech tree for your AI-era SWE roadmap</p>
      <AILearningGraph />
    </main>
  );
}
```

---

## FILE: `components/AILearningGraph.tsx`
```tsx
"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import ReactFlow, { Background, Controls, MiniMap, Node, Edge, Position } from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";
import { Trophy, CheckCircle, Target, Download, Upload, Filter, Search } from "lucide-react";

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

export interface TopicNode { id: string; label: string; cluster: string; xp: number; deps: string[]; links?: string[] }
export interface GraphData { nodes: TopicNode[] }

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

  const topicsById = useMemo(() => Object.fromEntries(data.nodes.map(n => [n.id, n])), [data]);

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
    for (const n of data.nodes) s[n.id] = computeStatus(n.id, n.deps, progress.completed);
    return s;
  }, [data.nodes, progress.completed]);

  const byClusterCompletion = useMemo(() => clusterCompletion(progress.completed, topicsByCluster), [progress.completed, topicsByCluster]);

  // Build nodes/edges with basic layout heuristic
  const { rfNodes, rfEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const colMap: Record<string, number> = {};
    Object.keys(clusterLabels).forEach((c, i) => (colMap[c] = i));

    for (const n of data.nodes) {
      const status = statuses[n.id];
      const includeByCluster = clusterFilter === "ALL" || n.cluster === clusterFilter;
      const includeByStatus = !hideCompleted || status !== "completed";
      const includeUnlockable = !showOnlyUnlockable || status !== "locked";
      const includeSearch = !search || n.label.toLowerCase().includes(search.toLowerCase()) || n.id.toLowerCase().includes(search.toLowerCase());
      if (!(includeByCluster && includeByStatus && includeUnlockable && includeSearch)) continue;

      const col = colMap[n.cluster] ?? 0;
      const row = (n.deps?.length || 0);
      nodes.push({
        id: n.id,
        data: { topic: n, status },
        position: { x: col * 320 + (Math.random() * 40), y: row * 140 + (Math.random() * 30) },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: { borderRadius: 16, borderWidth: 2, background: "transparent", borderColor: "rgba(0,0,0,0)" },
        type: "default",
      });

      for (const d of n.deps || []) {
        edges.push({ id: `${d}->${n.id}` + Math.random(), source: d, target: n.id, animated: true });
      }
    }

    return { rfNodes: nodes, rfEdges: edges };
  }, [data.nodes, statuses, clusterFilter, hideCompleted, showOnlyUnlockable, search]);

  const totalNodes = data.nodes.length;
  const completedCount = Object.values(progress.completed).filter(Boolean).length;
  const completionPct = Math.round((completedCount / Math.max(1, totalNodes)) * 100);

  const toggleComplete = useCallback((id: string) => {
    const topic = topicsById[id];
    const status = computeStatus(id, topic.deps, progress.completed);
    if (status === "locked") return;
    setProgress((prev) => {
      const nowCompleted = !prev.completed[id];
      const xpDelta = nowCompleted ? (topic?.xp || 0) : -(topic?.xp || 0);
      const withXP = awardXP(prev, xpDelta);
      const withStreak = updateDailyStreak(withXP);
      return { ...withStreak, completed: { ...withStreak.completed, [id]: nowCompleted } };
    });
  }, [topicsById, progress.completed]);

  function exportProgress() {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ai-learning-graph-progress.json"; a.click();
  }

  function importProgress(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try { setProgress(JSON.parse(String(reader.result))); } catch {}
    };
    reader.readAsText(file);
  }

  function nodeStyle(topic: TopicNode, status: TopicStatus): string {
    const base = "rounded-2xl border p-3 shadow-sm min-w-[220px] max-w-[320px] bg-white";
    const cluster = clusterColors[topic.cluster] || "bg-white border-neutral-300";
    const states: Record<TopicStatus, string> = {
      locked: "opacity-50 grayscale",
      available: "",
      completed: "ring-2 ring-green-500",
    };
    return `${base} ${cluster} ${states[status]}`;
  }

  const NodeOverlay: React.FC<{ node: Node }> = ({ node }) => {
    const { topic, status } = node.data as { topic: TopicNode; status: TopicStatus };
    const completed = status === "completed";
    const locked = status === "locked";
    return (
      <div className="absolute" style={{ transform: `translate(${node.position.x}px, ${node.position.y}px)` }}>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={nodeStyle(topic, status)}>
          <div className="flex items-start gap-3">
            <span className="badge">{clusterLabels[topic.cluster] || topic.cluster}</span>
            <div className="ml-auto flex items-center gap-2">
              {completed && <Trophy className="w-4 h-4 text-green-600" />}
              <span className="badge">{topic.xp} XP</span>
            </div>
          </div>
          <div className="mt-2 font-medium">{topic.label}</div>
          <div className="mt-2 text-xs text-neutral-500">Deps: {topic.deps.length ? topic.deps.join(", ") : "None"}</div>
          <div className="mt-3 flex items-center gap-2">
            <button className={`btn ${completed ? 'btn-outline' : 'btn-primary'}`} onClick={() => toggleComplete(topic.id)} disabled={locked}>
              <CheckCircle className="w-4 h-4 mr-1 inline" /> {completed ? "Undo" : locked ? "Locked" : "Mark Done"}
            </button>
            {goalId !== topic.id && (
              <button className="btn btn-outline" onClick={() => setGoalId(topic.id)}>
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
          <div className="progress"><span style={{ width: `${completionPct}%` }} /></div>
          <div className="text-xs text-neutral-500">{Object.values(progress.completed).filter(Boolean).length}/{totalNodes} topics • {progress.xp} XP</div>
        </div>

        <div className="card p-4 space-y-3">
          <div className="font-semibold flex items-center gap-2"><Filter className="w-4 h-4"/> Filters</div>
          <select className="select" value={clusterFilter} onChange={(e) => setClusterFilter(e.target.value)}>
            <option value="ALL">All Clusters</option>
            {Object.keys(clusterLabels).map((c) => (
              <option key={c} value={c}>{clusterLabels[c]}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4"/>
            <input className="input" placeholder="Search topic…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="checkbox" checked={hideCompleted} onChange={(e) => setHideCompleted(e.target.checked)} />
            <span className="text-sm">Hide completed</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="checkbox" checked={showOnlyUnlockable} onChange={(e) => setShowOnlyUnlockable(e.target.checked)} />
            <span className="text-sm">Show only unlockable</span>
          </label>
          <div className="pt-2">
            <div className="text-xs text-neutral-500 mb-2">Goal (highlights a path in the tech tree)</div>
            <select className="select" value={goalId} onChange={(e) => setGoalId(e.target.value)}>
              <option value="">None</option>
              {data.nodes.map(n => (
                <option key={n.id} value={n.id}>{n.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card p-4 space-y-3">
          <div className="font-semibold">Cluster Badges</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(byClusterCompletion).map(([cluster, stats]) => (
              <div key={cluster} className="border rounded-xl p-2 text-xs">
                <div className="font-medium">{clusterLabels[cluster] || cluster}</div>
                <div className="text-neutral-500">{stats.done}/{stats.total} • {stats.pct}%</div>
                {stats.pct === 100 && <div className="text-green-700 font-semibold mt-1">Badge earned 🏅</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4 space-y-3">
          <div className="font-semibold">Progress Data</div>
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={exportProgress}><Download className="w-4 h-4 mr-1"/> Export</button>
            <label className="btn btn-outline cursor-pointer">
              <Upload className="w-4 h-4 mr-1"/> Import
              <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files && importProgress(e.target.files[0])} />
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
```

---

## FILE: `lib/gamification.ts`
```ts
export type TopicStatus = "locked" | "available" | "completed";

export interface ProgressState {
  completed: Record<string, boolean>; // topicId -> completed
  xp: number;
  level: number;
  lastActiveISO?: string; // for streaks
  streakDays?: number;
}

export const STORAGE_KEY = "ai-learning-graph-progress-v2";

export const initialProgress: ProgressState = {
  completed: {},
  xp: 0,
  level: 1,
  lastActiveISO: undefined,
  streakDays: 0,
};

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : initialProgress;
  } catch {
    return initialProgress;
  }
}

export function saveProgress(s: ProgressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function computeStatus(id: string, deps: string[], completed: Record<string, boolean>): TopicStatus {
  if (completed[id]) return "completed";
  if (!deps || deps.length === 0) return "available";
  const allDepsMet = deps.every((d) => completed[d]);
  return allDepsMet ? "available" : "locked";
}

export function levelForXP(xp: number): number {
  return 1 + Math.floor(xp / 100); // 100 XP per level
}

export function awardXP(current: ProgressState, amount: number): ProgressState {
  const newXP = Math.max(0, current.xp + amount);
  const newLevel = levelForXP(newXP);
  return { ...current, xp: newXP, level: newLevel };
}

export function updateDailyStreak(state: ProgressState, now = new Date()): ProgressState {
  const today = new Date(now.toDateString());
  const last = state.lastActiveISO ? new Date(state.lastActiveISO) : null;
  if (!last) {
    return { ...state, lastActiveISO: today.toISOString(), streakDays: 1 };
  }
  const lastDay = new Date(last.toDateString());
  const diffDays = Math.round((today.getTime() - lastDay.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return state; // already counted today
  if (diffDays === 1) {
    return { ...state, lastActiveISO: today.toISOString(), streakDays: (state.streakDays || 0) + 1 };
  }
  return { ...state, lastActiveISO: today.toISOString(), streakDays: 1 }; // reset streak
}

export function clusterCompletion(completed: Record<string, boolean>, byCluster: Record<string, string[]>): Record<string, { total: number; done: number; pct: number }> {
  const out: Record<string, { total: number; done: number; pct: number }> = {};
  for (const [cluster, topicIds] of Object.entries(byCluster)) {
    const total = topicIds.length;
    const done = topicIds.filter((id) => completed[id]).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    out[cluster] = { total, done, pct };
  }
  return out;
}
```

---

## FILE: `data/graphData.json`
```json
{
  "nodes": [
    { "id": "C1_A1", "label": "AI impact on architecture", "cluster": "C1", "xp": 20, "deps": [] },
    { "id": "C1_A2", "label": "New developer profile", "cluster": "C1", "xp": 10, "deps": ["C1_A1"] },
    { "id": "C1_A3", "label": "Evolving architect role", "cluster": "C1", "xp": 10, "deps": ["C1_A2"] },
    { "id": "C1_A4", "label": "AI as a software component", "cluster": "C1", "xp": 15, "deps": ["C1_A1", "C1_A2", "C1_A3"] },
    { "id": "C1_A5", "label": "Business & ROI for AI", "cluster": "C1", "xp": 10, "deps": ["C1_A4"] },

    { "id": "C2_A1", "label": "What is an AI Agent", "cluster": "C2", "xp": 20, "deps": ["C1_A1"] },
    { "id": "C2_A2", "label": "Microservices vs AI agents", "cluster": "C2", "xp": 15, "deps": ["C2_A1"] },
    { "id": "C2_A3", "label": "Agent components", "cluster": "C2", "xp": 20, "deps": ["C2_A1", "C1_A4"] },
    { "id": "C2_A4", "label": "Agent orchestration", "cluster": "C2", "xp": 25, "deps": ["C2_A3"] },
    { "id": "C2_A5", "label": "MCP fundamentals", "cluster": "C2", "xp": 15, "deps": ["C2_A3"] },
    { "id": "C2_A6", "label": "ACP fundamentals", "cluster": "C2", "xp": 15, "deps": ["C2_A5"] },
    { "id": "C2_A7", "label": "A2A communication", "cluster": "C2", "xp": 15, "deps": ["C2_A5", "C2_A6"] },
    { "id": "C2_A8", "label": "Agent tool-use patterns", "cluster": "C2", "xp": 20, "deps": ["C2_A4"] },

    { "id": "C3_A1", "label": "12-Factor Agent", "cluster": "C3", "xp": 20, "deps": [] },
    { "id": "C3_A2", "label": "Hand-crafted prompts", "cluster": "C3", "xp": 15, "deps": ["C6_A1"] },
    { "id": "C3_A3", "label": "JSON I/O enforcement", "cluster": "C3", "xp": 15, "deps": ["C3_A2"] },
    { "id": "C3_A4", "label": "Stateless agents & external state", "cluster": "C3", "xp": 20, "deps": ["C3_A3"] },
    { "id": "C3_A5", "label": "Small specialized agents", "cluster": "C3", "xp": 15, "deps": ["C3_A4"] },
    { "id": "C3_A6", "label": "ReAct prompting", "cluster": "C3", "xp": 20, "deps": ["C6_A1"] },
    { "id": "C3_A7", "label": "Chain-of-Thought", "cluster": "C3", "xp": 20, "deps": ["C6_A1"] },
    { "id": "C3_A8", "label": "Guardrail pattern", "cluster": "C3", "xp": 25, "deps": ["C3_A2", "C5_A8"] },
    { "id": "C3_A9", "label": "Tool invocation pattern", "cluster": "C3", "xp": 20, "deps": ["C3_A8"] },
    { "id": "C3_A10", "label": "Human-in-the-loop", "cluster": "C3", "xp": 15, "deps": ["C3_A9"] },

    { "id": "C4_A1", "label": "Caching basics", "cluster": "C4", "xp": 15, "deps": [] },
    { "id": "C4_A2", "label": "Invalidation strategies", "cluster": "C4", "xp": 15, "deps": ["C4_A1"] },
    { "id": "C4_A3", "label": "Eviction policies", "cluster": "C4", "xp": 15, "deps": ["C4_A1"] },
    { "id": "C4_A4", "label": "LLM response caching", "cluster": "C4", "xp": 20, "deps": ["C4_A1"] },
    { "id": "C4_A5", "label": "Embedding caching", "cluster": "C4", "xp": 15, "deps": ["C7_A5", "C4_A4"] },
    { "id": "C4_A6", "label": "Token-level caching", "cluster": "C4", "xp": 20, "deps": ["C4_A4"] },
    { "id": "C4_A7", "label": "Fingerprinting for cache keys", "cluster": "C4", "xp": 15, "deps": ["C4_A5", "C4_A6"] },
    { "id": "C4_A8", "label": "Staleness management", "cluster": "C4", "xp": 15, "deps": ["C4_A7"] },

    { "id": "C5_A1", "label": "Prompt injection", "cluster": "C5", "xp": 20, "deps": ["C1_A5"] },
    { "id": "C5_A2", "label": "Output injection", "cluster": "C5", "xp": 15, "deps": ["C5_A1"] },
    { "id": "C5_A3", "label": "Sensitive data protection", "cluster": "C5", "xp": 20, "deps": ["C5_A1", "C5_A2"] },
    { "id": "C5_A4", "label": "OWASP LLM Top 10", "cluster": "C5", "xp": 15, "deps": ["C5_A3"] },
    { "id": "C5_A5", "label": "Model DoS prevention", "cluster": "C5", "xp": 15, "deps": ["C5_A4"] },
    { "id": "C5_A6", "label": "Supply chain & integrity", "cluster": "C5", "xp": 15, "deps": ["C5_A4"] },
    { "id": "C5_A7", "label": "Excessive agency mitigation", "cluster": "C5", "xp": 15, "deps": ["C5_A4"] },
    { "id": "C5_A8", "label": "Moderation & output filtering", "cluster": "C5", "xp": 20, "deps": ["C5_A5", "C5_A6", "C5_A7"] },
    { "id": "C5_A9", "label": "Allow-list / proxy for tools", "cluster": "C5", "xp": 15, "deps": ["C5_A8"] },
    { "id": "C5_A10", "label": "Sandboxing AI-generated code", "cluster": "C5", "xp": 20, "deps": ["C5_A9"] },
    { "id": "C5_A11", "label": "Continuous red-teaming", "cluster": "C5", "xp": 15, "deps": ["C5_A10"] },

    { "id": "C6_A1", "label": "Effective prompt writing", "cluster": "C6", "xp": 25, "deps": ["C1_A4"] },
    { "id": "C6_A2", "label": "Few-shot prompting", "cluster": "C6", "xp": 15, "deps": ["C6_A1"] },
    { "id": "C6_A3", "label": "Delimiters for disambiguation", "cluster": "C6", "xp": 10, "deps": ["C6_A1"] },
    { "id": "C6_A4", "label": "Output format enforcement", "cluster": "C6", "xp": 15, "deps": ["C6_A1"] },
    { "id": "C6_A5", "label": "Multi-turn context management", "cluster": "C6", "xp": 20, "deps": ["C6_A2", "C6_A3", "C6_A4"] },
    { "id": "C6_A6", "label": "Prompt templates with placeholders", "cluster": "C6", "xp": 15, "deps": ["C6_A5"] },
    { "id": "C6_A7", "label": "Prompt versioning & history", "cluster": "C6", "xp": 15, "deps": ["C6_A6"] },
    { "id": "C6_A8", "label": "Context length strategies", "cluster": "C6", "xp": 15, "deps": ["C6_A5", "C6_A7"] },
    { "id": "C6_A9", "label": "Retrieval of relevant context", "cluster": "C6", "xp": 20, "deps": ["C6_A8"] },
    { "id": "C6_A10", "label": "Dynamic context windowing", "cluster": "C6", "xp": 15, "deps": ["C6_A9"] },
    { "id": "C6_A11", "label": "Summarization for compression", "cluster": "C6", "xp": 15, "deps": ["C6_A10"] },

    { "id": "C7_A1", "label": "AI-aware system design", "cluster": "C7", "xp": 25, "deps": ["C2_A4"] },
    { "id": "C7_A2", "label": "Throughput vs latency", "cluster": "C7", "xp": 20, "deps": ["C7_A1", "C4_A1", "C6_A1"] },
    { "id": "C7_A3", "label": "Model selection (Q/C/L)", "cluster": "C7", "xp": 20, "deps": ["C7_A2", "C10_A2"] },
    { "id": "C7_A4", "label": "RAG architecture", "cluster": "C7", "xp": 30, "deps": ["C7_A3", "C6_A9"] },
    { "id": "C7_A5", "label": "Vector DB fundamentals", "cluster": "C7", "xp": 20, "deps": ["C7_A4"] },
    { "id": "C7_A6", "label": "Embedding version compatibility", "cluster": "C7", "xp": 15, "deps": ["C7_A5"] },
    { "id": "C7_A7", "label": "Chunking strategies", "cluster": "C7", "xp": 15, "deps": ["C7_A6"] },
    { "id": "C7_A8", "label": "Ranking / filtering", "cluster": "C7", "xp": 15, "deps": ["C7_A7"] },
    { "id": "C7_A9", "label": "Async workflows & queues", "cluster": "C7", "xp": 20, "deps": ["C7_A2"] },
    { "id": "C7_A10", "label": "Streaming responses", "cluster": "C7", "xp": 15, "deps": ["C7_A9", "C6_A4"] },
    { "id": "C7_A11", "label": "Failover strategies", "cluster": "C7", "xp": 20, "deps": ["C7_A2", "C7_A3", "C7_A4", "C5_A7"] },
    { "id": "C7_A12", "label": "Cloud AI services", "cluster": "C7", "xp": 15, "deps": ["C7_A1"] },

    { "id": "C8_A1", "label": "AI-specific logging", "cluster": "C8", "xp": 15, "deps": ["C7_A1"] },
    { "id": "C8_A2", "label": "Privacy in logs", "cluster": "C8", "xp": 10, "deps": ["C8_A1"] },
    { "id": "C8_A3", "label": "Distributed tracing", "cluster": "C8", "xp": 15, "deps": ["C8_A1"] },
    { "id": "C8_A4", "label": "Token tracking & dashboards", "cluster": "C8", "xp": 15, "deps": ["C8_A3", "C10_A3"] },
    { "id": "C8_A5", "label": "Cache hit/miss monitoring", "cluster": "C8", "xp": 10, "deps": ["C8_A4", "C4_A1", "C4_A8"] },
    { "id": "C8_A6", "label": "User feedback loop", "cluster": "C8", "xp": 10, "deps": ["C8_A4"] },
    { "id": "C8_A7", "label": "Automatic eval tools", "cluster": "C8", "xp": 15, "deps": ["C8_A6"] },
    { "id": "C8_A8", "label": "Regression testing (prompts)", "cluster": "C8", "xp": 15, "deps": ["C8_A7"] },
    { "id": "C8_A9", "label": "Alerting on anomalies", "cluster": "C8", "xp": 10, "deps": ["C8_A8"] },

    { "id": "C9_A1", "label": "Prompt unit tests", "cluster": "C9", "xp": 15, "deps": ["C6_A6", "C8_A7"] },
    { "id": "C9_A2", "label": "Snapshot testing", "cluster": "C9", "xp": 15, "deps": ["C9_A1", "C8_A7"] },
    { "id": "C9_A3", "label": "Semantic similarity eval", "cluster": "C9", "xp": 15, "deps": ["C9_A1"] },
    { "id": "C9_A4", "label": "Synthetic dataset gen", "cluster": "C9", "xp": 15, "deps": ["C9_A3"] },
    { "id": "C9_A5", "label": "Human-in-the-loop eval", "cluster": "C9", "xp": 15, "deps": ["C9_A4"] },
    { "id": "C9_A6", "label": "Handling non-determinism", "cluster": "C9", "xp": 20, "deps": ["C9_A3", "C9_A4", "C9_A5"] },
    { "id": "C9_A7", "label": "A/B testing prompts & models", "cluster": "C9", "xp": 15, "deps": ["C9_A6"] },
    { "id": "C9_A8", "label": "Quality metrics for outputs", "cluster": "C9", "xp": 15, "deps": ["C9_A7"] },
    { "id": "C9_A9", "label": "Bias & fairness testing", "cluster": "C9", "xp": 15, "deps": ["C9_A8"] },

    { "id": "C10_A1", "label": "Token pricing models", "cluster": "C10", "xp": 15, "deps": [] },
    { "id": "C10_A2", "label": "Estimating AI usage costs", "cluster": "C10", "xp": 15, "deps": ["C10_A1"] },
    { "id": "C10_A3", "label": "Cost dashboards & alerts", "cluster": "C10", "xp": 20, "deps": ["C10_A2"] },
    { "id": "C10_A4", "label": "Caching for cost reduction", "cluster": "C10", "xp": 15, "deps": ["C10_A3", "C4_A4"] },
    { "id": "C10_A5", "label": "Dynamic model routing", "cluster": "C10", "xp": 20, "deps": ["C10_A3"] },
    { "id": "C10_A6", "label": "Prompt optimization (token)", "cluster": "C10", "xp": 15, "deps": ["C10_A5"] },
    { "id": "C10_A7", "label": "Output length control", "cluster": "C10", "xp": 10, "deps": ["C10_A6"] },
    { "id": "C10_A8", "label": "Input truncation & summarization", "cluster": "C10", "xp": 10, "deps": ["C10_A7"] },
    { "id": "C10_A9", "label": "Cost-per-feature/user analysis", "cluster": "C10", "xp": 15, "deps": ["C10_A4", "C10_A5", "C10_A6", "C10_A8"] },
    { "id": "C10_A10", "label": "Open-source model substitution", "cluster": "C10", "xp": 15, "deps": ["C10_A9"] }
  ]
}
```