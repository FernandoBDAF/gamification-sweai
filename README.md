# Knowledge Mapping Platform — North Star Product Blueprint

> **Vision:** A desktop-first, content-agnostic platform for visualizing knowledge paths.  
> Users progress through **nodes** (atomic skills) arranged in **clusters** (topics) within **panels** (domains).  
> The platform emphasizes **clear dependency paths**, **progress visibility**, and **calm, readable UI**.

---

## 1. Core Concepts

### Node

- **Definition:** Atomic unit of knowledge.
- **Fields:** `id`, `title`, `description`, `deps[]`, `links[]`, `progress{pct,done,reviewed}`, `tags[]`, `clusterId`.
- **Display:**
  - Fixed size.
  - Always show title (wrap text).
  - Always show % progress (no hover delay).
  - Inactive = lighter shade of active color (e.g., `blue-200` vs `blue-700`).
- **Interaction:**
  - Single click → select only (no auto-center).
  - Double click → open detail panel (future-proof).
  - Hover → instant quick info tooltip.
  - Right click → extra actions menu.
- **Dependencies:**
  - Always show incoming (prerequisites) and outgoing (dependents) arrows.
  - Direction: **top-to-bottom** within clusters, **left-to-right** between clusters.
  - Show edges for locked nodes.
  - Unlock when prerequisites reach a % threshold.

### Cluster

- **Definition:** Group of related nodes (topic).
- **Fields:** `id`, `title`, `description`, `order`, `prereqClusters[]`, `color`, `panelId`.
- **Display:**
  - Rendered as vertical columns.
  - Show % completion in header.
  - Contain only their own nodes (no overlaps).
- **Rules:**
  - Cluster selection removed; instead, filter nodes/clusters by status (active/completed/etc).
  - Clusters can have dependency rules between them.

### Panel

- **Definition:** Domain or field containing clusters.
- **Fields:** `id`, `title`, `description`, `clusters[]`.
- **Rules:**
  - Panels are generic — not tied to a single subject.
  - Ability to switch panels is a future feature.

---

## 2. Path-First Layout

- **Vertical path inside clusters** (top→bottom).
- **Horizontal path between clusters** (left→right).
- Nodes at the same dependency depth are **horizontally aligned**.
- Paths remain visible even when nodes are locked.
- Clear visual separation between:
  - **Path view** (graph with dependencies)
  - **Content view** (node detail panel)

---

## 3. Navigation & Map Behavior

- **Desktop-first** (mobile postponed).
- Zoom disabled; no scroll-wheel or pinch zoom.
- Panning allowed only horizontally and vertically (no diagonal drift).
- Scroll moves vertically within a cluster; horizontal scroll or arrows move across clusters.
- Stable layout — no jitter or re-flow on resize.

---

## 4. Gamification & Progress

- **Visual Progress:**
  - Nodes brighten as progress increases.
  - Completed paths appear more vibrant.
  - Color scaling uses a lightened→base interpolation (`progressToColor`) with approximate AA contrast.
- **Unlock Logic:**
  - Nodes unlock when prerequisites are completed above a % threshold.
  - Clusters unlock when prerequisite clusters meet completion %.
- **Achievements:**
  - (Optional) Badges or subtle animations on completion — post-MVP.

---

## 5. UI & UX Priorities

- **Top Nav:**
  - Compact; no overflow at 1280px.
  - Group non-essentials into a “More” menu.
  - Show only essential view/layout/filter controls.
- **Status Filters:**
  - Active, Locked
