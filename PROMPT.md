Prompt to Finish the “AI Learning Graph” Project
Role: You are an experienced senior front-end engineer specializing in React, Next.js, and interactive data visualization. You will complete and polish the AI Learning Graph project — a gamified, interactive roadmap for AI-era software engineering skills — according to the detailed plan below.

1. Current Project Context
The repo is a Next.js 14 + App Router + TypeScript + Tailwind CSS project.

The main functionality is an interactive “tech tree” that visualizes clusters (big themes) and atomic topics (smallest skill/concept units) with dependency edges.

Graph data lives in data/graphData.json.

The current implementation renders the tech tree with React Flow but needs a complete, polished UX overhaul and additional views/features.

Gamification logic already exists in lib/gamification.ts but is basic.

The components folder has been refactored into smaller, organized parts:

pgsql
Copy
Edit
components/
  graph/
    CardNode.tsx
    DependencyGraph.tsx
    index.ts
  panels/
    ClusterBadgePanel.tsx
    DataPanel.tsx
    FilterPanel.tsx
    ProgressPanel.tsx
    ViewPanel.tsx
    index.ts
  ui/
    Badge.tsx
    Button.tsx
    Card.tsx
    index.ts
AILearningGraph.tsx
Important: Maintain this folder structure. Add new files to the correct subfolder, keeping related logic together. Do not put large monolithic code in AILearningGraph.tsx — break it into smaller components if needed.

2. Final Feature Requirements
Core Views
Tech Tree View

Interactive graph of all clusters + atomic topics.

Nodes rendered as custom React Flow nodes using CardNode.tsx.

Panning/zooming works seamlessly.

Nodes show:

Cluster badge

XP value

Status: Locked / Available / Completed

Buttons: Mark Done, Mark Reviewed (separate), Details, Goal

Dependencies drawn as arrows between nodes.

Locked nodes are dimmed until prerequisites are complete.

Cluster View

Shows only one cluster at a time.

Faintly render edges to external clusters to keep context.

Drop-down to pick cluster.

Dependency Table View

Matrix with topics as rows, dependencies as columns.

Checkmark or X to indicate relationship.

Scrollable, sticky headers.

Compact Mode

Smaller cards with minimal info.

Toggle in sidebar.

Node “Details” Panel
Expandable inside the node card (CardNode.tsx).

Resources tab:

Reads links array from graphData.json (each { label, url }).

If none, show placeholder text.

Notes tab:

Editable textarea, saved to localStorage (progress.notes[topicId]).

Auto-save on change.

Mark Reviewed toggle (saved in progress.reviewed[topicId]).

Gamification
XP per topic; level up every 100 XP.

Daily streak counter; streak bonus XP.

Cluster completion badges (bronze/silver/gold at 50%/80%/100% completion).

Export/import progress as JSON.

Filtering
Sidebar controls in FilterPanel.tsx:

Cluster filter.

Search by topic label.

Hide completed.

Show only unlockable (deps met, not completed).

Goal highlighting (path from current progress to selected goal node).

Data & Persistence
Progress stored in localStorage under versioned key.

Data structure in graphData.json:

json
Copy
Edit
{
  "nodes": [
    {
      "id": "C1_A1",
      "label": "AI impact on architecture",
      "cluster": "C1",
      "xp": 20,
      "deps": [],
      "links": [
        { "label": "Article: AI in Architecture", "url": "https://..." }
      ]
    }
  ]
}
Clusters have consistent IDs (C1, C2, …) and color mapping.

Styling & UX
Use Tailwind for all styling.

Minimal, modern look: rounded corners, soft shadows, muted background grid.

Nodes change border color by status:

Completed: green border

Available: blue border

Locked: gray border

Hover animation: scale up slightly.

Smooth transitions when toggling view modes.

Architecture
Follow the existing folder structure:

graph/ → graph rendering logic, custom nodes, dependency visualization.

panels/ → all sidebar and control panels.

ui/ → reusable UI components (Badge, Button, Card, etc.).

No absolute overlays for nodes; use nodeTypes in React Flow.

Keep layout responsive and mobile-friendly.

3. Technical Guidance
React Flow Integration

Register CardNode as custom node type in graph/index.ts.

Position nodes via auto-layout (dagre or elkjs) for readability.

Fit view on load and when toggling modes.

Cluster View

Filter nodes by selected cluster.

Still draw edges to other clusters, but fade them.

Dependency Table

Implement in DependencyGraph.tsx or a dedicated table component.

Use CSS grid or table with sticky headers.

Persistence

Wrap all progress mutations in saveProgress.

Version storage key (e.g., ai-learning-graph-progress-v3).

Performance

Memoize heavy calculations (dependencies, node building).

Avoid re-rendering all nodes unnecessarily.

4. Progress Tracking Requirement
Keep a tracker.md file in the root directory.

This file should:

List pending tasks (checkbox format).

Document completed features with dates.

Record key decisions (e.g., library choices, architectural trade-offs).

Log bugs found and fixes applied.

Update tracker.md every time you make a significant change.

Example:

md
Copy
Edit
# Project Tracker

## ✅ Completed
- [x] Added `Mark Reviewed` button to CardNode (2025-08-10)
- [x] Implemented Compact Mode toggle (2025-08-09)

## ⏳ In Progress
- [ ] Implement Dependency Table View
- [ ] Auto-layout for Tech Tree

## 🐛 Bugs
- [ ] Edge overlap in Cluster View when >50 nodes

## 💡 Decisions
- Using dagre for auto-layout to keep graph tidy.
5. Definition of Done
I can run npm install && npm run dev and see the fully working app on localhost:3000.

Switching between Tech Tree, Cluster View, and Dependency Table works without reloads.

Node interactions (Done, Reviewed, Details, Goal) update instantly and persist.

Styling matches the minimal modern spec (rounded, shadows, soft colors).

No ghost overlays, misalignments, or broken edges.

tracker.md is up-to-date and reflects the current state.

Now take this project to completion following all requirements above. Refactor where necessary, but preserve working logic where possible. Add only essential dependencies.

