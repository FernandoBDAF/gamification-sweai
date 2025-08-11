# Project Technical Documentation

## Overview
This project is a **desktop-first, Civilization-inspired knowledge map platform**.  
It visualizes **nodes** (atomic knowledge units) organized into **clusters** (topic groups), which together form a **panel** (domain).

The **North Star vision**:
- **Vertical paths** inside clusters
- **Horizontal paths** between clusters
- Gamification through **progress tracking** and **unlock mechanics**
- Minimal, clear UI inspired by Civ VI (clean, high-contrast, info-rich)
- **No mobile** for now; focus on stable desktop experience

---

## 1. Core Entities

### Node
- Fixed size for visual consistency
- Always shows progress percentage
- Displays title wrapped, never truncated
- Always shows dependency arrows (prerequisite → dependent)
- Unlocks when dependencies reach completion % threshold

### Cluster
- Groups related nodes vertically
- Shows % completion
- May have dependencies on other clusters (horizontal path)
- Filterable by status (active, completed, locked)

### Panel
- Container for multiple clusters
- Domain-agnostic (SWE AI is just one example)
- Can switch panels in the future

---

## 2. Architecture Overview

### Folder Structure (Target State)
/app/ # Pages & routes
/components/ # Dumb UI components (no business logic)
/map/
/navbar/
/panel/

/lib/ # Pure, testable logic
/data/ # Types, selectors, progress/dependency logic
/layout/ # Layout algorithms (dagre, cluster focus)
/overlays/ # Geometry & visual styles for cluster boundaries
/build/ # Node/edge builders for ReactFlow
/state/ # Zustand or context-based global state
/tests/ # Unit tests for all /lib modules
/public/ # Design assets, reference images


---

## 3. Module Responsibilities

### `/lib/data`
- **graph-types.ts**  
  Central TypeScript interfaces (`TopicNode`, `Cluster`, `Edge`, etc.)
- **graph-selectors.ts**  
  Pure functions to filter/search/sort nodes and clusters
- **graph-progress.ts**  
  Functions to compute node/cluster progress and completion
- **graph-deps.ts**  
  Functions to get dependencies, dependents, and subgraphs

### `/lib/layout`
- **layout-dagre.ts**  
  Wrapper for dagre layout with consistent spacing & direction rules
- **layout-cluster.ts**  
  Cluster-specific layouts (focus mode, vertical alignment)

### `/lib/overlays`
- **cluster-geometry.ts**  
  Hull/path math for cluster boundaries
- **cluster-visual-css.ts**  
  Map cluster state to fill/opacity/stroke CSS

### `/lib/build`
- **build-edges.ts**  
  Transform domain nodes → styled edges for ReactFlow
- **build-rf-nodes.ts**  
  Transform domain nodes → styled RF nodes with position/status

### `/lib/state`
- **store.ts**  
  Global app state: view, filters, selection, goal path

---

## 4. Development Methodology

### Principles
- **Pure logic in `/lib`** — all heavy computation is isolated and testable
- **UI in `/components`** — only renders prepared data
- **One PR = One Module** — small, reviewable, testable changes
- **Diff-first prompting** for LLMs to avoid context loss

### Steps for a New Feature
1. Write or update **pure functions** in `/lib` with unit tests
2. Expose new functionality to `/components` via props
3. Adjust UI without touching business logic
4. Run tests → manual verification → commit

---

## 5. MVP Feature Set

1. **Static map view**
   - Nodes & clusters rendered via ReactFlow
   - Fixed dagre layout (TB for cluster, LR between clusters)
2. **Progress tracking**
   - Node and cluster % calculation
   - Locked/unlocked logic based on thresholds
3. **Dependency visualization**
   - Always-visible edges with directional arrows
4. **Filtering**
   - Filter nodes by status (active, completed, locked)
   - Search by name
5. **Basic navigation**
   - Pan-only (no zoom)
   - Compact navbar
6. **Node detail panel**
   - Basic info, dependencies, progress

---

## 6. Gamification Rules

- Nodes:  
  - Active: dark color (e.g., `blue-700`)  
  - Inactive: light color (`blue-200`)
  - Completed: marked with progress = 100%
- Paths:  
  - Unlocked → colored edges  
  - Locked → muted edges
- Clusters:  
  - Unlock after prerequisite clusters reach % threshold
- Achievements (future):  
  - Badges for completing nodes/clusters

---

## 7. Design References
- **Civ VI UI style**: clean, crisp, parchment accents for context panels
- **Cluster columns**: visually separated vertical strips
- **Progress emphasis**: number-driven, subtle animations
- See `/public/design/` for reference images

---

## 8. Testing Strategy

- **Unit tests** for `/lib` modules (deterministic logic)
- **Manual UI tests** for `/components` (snapshot visual checks)
- **Regression prevention**:  
  Always test the following after changes:
  - Node status updates correctly
  - Dependencies render as intended
  - Filters don’t break selection
  - Layout stays stable between renders

---

## 9. Backlog (Out of Scope for MVP)
- Mobile support
- Alternate cluster styles
- Alternate layouts (Tree, Force-directed)
- Advanced zoom/pan
- Real-time collaboration
- Skins/themes
- Multi-panel view

---

## 10. How to Work With an LLM
When prompting an LLM to implement features:
1. Always provide **this documentation** as context
2. Reference **exact module paths**
3. Ask for **diffs only** for the relevant files
4. Run tests after applying changes
5. Avoid prompts that require large-scale UI + logic changes in one step

---

**Last updated:** YYYY-MM-DD
