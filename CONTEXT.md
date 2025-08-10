# Knowledge Mapping Platform — CONTEXT

> **North Star:** A desktop‑first, content‑agnostic platform for visualizing knowledge paths.  
> Users advance through **nodes** (atomic skills) arranged in **clusters** (topics) inside **panels** (domains).  
> The experience emphasizes **clear dependency paths**, **progress visibility**, and **calm, readable UI**.

---

## 1) Product Definition (Platform‑First)
- **What it is:** An interactive knowledge path visualizer with progress tracking and dependency logic.
- **What it isn’t (for v1):** A general graph editor, a social tool, or a mobile app.

### Core Entities
- **Node:** atomic knowledge unit.  
  Fields: `id`, `title`, `description`, `deps[]`, `links[]`, `progress{pct,done,reviewed}`, `tags[]`, `clusterId`.
- **Cluster:** logical container of nodes.  
  Fields: `id`, `title`, `description`, `order`, `prereqClusters[]`, `color`, `panelId`.
- **Panel:** domain containing clusters.  
  Fields: `id`, `title`, `description`, `clusters[]`.

---

## 2) North‑Star UX Rules (Path‑First)
- **Layout:**  
  - Clusters render as **columns** (left→right).  
  - Nodes render as **vertical steps** inside clusters (top→bottom).  
  - Nodes at the **same dependency level are horizontally aligned**.
- **Navigation:**  
  - Desktop‑first; **zoom locked** (no wheel/pinch).  
  - Panning allowed only horizontally/vertically (no diagonal drift).  
  - Scroll = vertical cluster traversal; horizontal scroll or arrows = move across clusters.
- **Selection & Content:**  
  - Single‑click selects node (no auto‑center).  
  - Double‑click opens **node detail panel** (right side).  
  - Clear **visual separation** between the **path** (graph) and the **content** (detail).
- **Dependencies:**  
  - Always show directional edges.  
  - **Inside clusters:** top→bottom. **Across clusters:** left→right.  
  - Locked nodes remain visible; edges visible too.  
  - **Unlock rule:** node unlocks after **% threshold** of its prerequisites is met; clusters can also unlock by % of prerequisite clusters.
- **Gamification Tone:**  
  - Focus on **numbers & path brightness** (color intensity).  
  - Minimal animations; no flicker; subtle transitions.

---

## 3) UI Priorities
- **Top Nav:** compact, non‑overflowing, only essentials:
  - Search, View Level (Overview / Cluster / Detail), Layout (Vertical/Horizontal), Status Filters (Active/Locked/Completed), Export/Import (in “More”).
- **Legend Chips:** show active filters (removable chips).
- **Cluster Header:** title + % completion.
- **Node Card:** fixed size; title (wrap), % progress, quick actions (Done/Review/Goal).

---

## 4) Technical Principles
- **Rendering:** React Flow for nodes/edges; **no freeform dragging** in v1.
- **State:** localStorage for progress; import/export JSON.
- **Performance:** memoize nodes/edges; throttle hover; do not remount on hover.
- **Cluster Overlays:** drawn in a transform‑synced layer (follow viewport), not causing relayout.

---

## 5) Acceptance Criteria for MVP
- Layout is stable (clusters as columns, nodes as vertical steps; level alignment works).
- Zoom disabled; panning constrained; resize stable (no jitter).
- Selecting a node highlights **deps (amber)**, **dependents (green)**; edges are directional.
- Node progress visible; completion brightens node and path.
- Cluster shows %; cluster lock/unlock respects prerequisites %.
- Compact top nav, no overflow, “More” groups non‑essentials.
- No flicker on hover/selection; 60 fps pan/scroll on mid laptop.
- Import/export round‑trips without data loss.

---

## 6) Current Status (keep updated)
- **Working:** pan (constrained), layouts, basic dependency highlight, cluster overlays (baseline), notes/resources.  
- **Needs stabilization:** toolbar overflow, multi‑filter → moving to status filters only, hull/bubble styles → replaced by column container.  
- **Bugs to watch:** hover re‑renders causing blinking; inconsistent view‑level differences.

_Last updated: YYYY‑MM‑DD (set on commit)_
