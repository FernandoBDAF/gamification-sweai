# PROGRESS — Plan to MVP Completion

This is the sequenced plan with clear acceptance checks and tiny, safe PRs.  
Use feature branches: `feat/m0-stabilize`, `feat/m1-paths`, etc.

---

## Milestone 0 — Stabilization & Ground Rules

**Goal:** Stop regressions; lock the platform constraints.

### Tasks

- [x] Disable wheel/pinch zoom; constrain pan to x/y only.
- [x] Remove cluster multi‑select UI; add **status filters** (Active / Locked / Completed).
  - [x] Keep chips for active filters (status chips).
- [x] Replace cluster “styles” (hull/bubble) with **column containers**.
- [x] Compact top nav (group in “More”, tooltips instant).
- [x] Throttle hover (100–150ms); avoid state changes that remount nodes.
- [x] Add **Dev Overlay** (toggle via `?dev=1` or keyboard `D`):
  - [x] Selected node id, deps/dependents counts, active filters, render counters.

### Acceptance

- [x] No blinking on hover/selection (debounced hover ~120ms).
- [x] Toolbar never overflows at 1280px; items group into “More”.
- [x] Cluster renders as a simple column container.
- [x] Dev Overlay visible and accurate.

### Test Script

- [x] Hover 20+ nodes; watch for flicker.
- [x] Resize 1440→1280→1024→1440; nav remains readable.
- [x] Toggle filters; chips update; list reflects status.

---

## Milestone 1 — Path Semantics (Nodes & Edges)

**Goal:** Make dependencies crystal clear and aligned.

### Tasks

- [x] Implement **level alignment**: nodes with same dependency depth share Y‑position (within clusters).
- [x] Edge styling:
  - [x] Amber arrows for incoming deps → selected node.
  - [x] Green arrows for selected node → dependents.
  - [x] Light neutral for everything else; all directional.
- [x] Keep edges visible even if nodes are locked.
- [x] Selection behavior: single‑click selects; **does not** auto‑center.

### Acceptance

- [x] Selecting a node shows prerequisites (amber) and dependents (green).
- [x] Nodes at same level align horizontally within their cluster.
- [x] No layout thrash while switching selection.

### Test Script

- [ ] Pick nodes in early/mid/late clusters; verify alignment & directionality. (Pending manual QA)
- [ ] Toggle between Overview/Cluster/Detail; no remount flickers. (Pending manual QA)

---

## Milestone 2 — Unlock Logic & Progress Illumination

**Goal:** Make progress meaningful and visible.

### Tasks

- [x] Node unlock rule: unlock when **X%** of prerequisites are complete (100% for MVP via threshold).
- [x] Cluster unlock rule: unlock when **Y%** of prerequisite clusters are complete. (Derived from cross-cluster dependencies, threshold 100%.)
- [x] Color intensity scale:
  - Inactive → Active as progress increases (node border via `progressToColor`).
- [x] Show **%** in node and cluster header; brighten edges on completed paths (cluster % shown in label; node shows 0/100 for MVP).

### Acceptance

- [x] Completing prerequisites visibly unlocks nodes/next clusters.
- [x] Path segments “light up” as completion grows.
- [x] Color scale remains accessible (contrast AA for text).

### Test Script

- [ ] Mark nodes done; confirm downstream unlock & brightening. (Manual)
- [ ] Edge cases: 0%, 99%, 100% thresholds. (Manual)

---

## Milestone 3 — Node Detail Panel (Future‑Proof, Minimal Now)

**Goal:** Clear separation between path and content.

### Tasks

- [x] Right‑side detail panel: title, dependencies & dependents (clickable), progress action + bar.
- [x] Keep layout unchanged behind the panel; no zoom/center changes.
- [x] Keyboard: `Esc` closes panel.

### Acceptance

- [x] Double‑click opens panel; selection preserved.
- [x] Clicking a prerequisite in the panel selects that node in the map.
- [x] No layout/zoom changes when opening/closing the panel.

### Test Script

- [ ] Open/close repeatedly; watch performance; ensure focus trap works. (Manual)

---

## Milestone 4 — Data I/O, State & QA

**Goal:** Durable state + faster iteration loop.

### Tasks

- [x] Import/export current panel as JSON (pure I/O utils).
- [x] Persist progress & filters in localStorage.
- [x] Add basic unit tests:
  - Depth calculation & level alignment
  - Unlock predicate (nodes & clusters)
  - Filter derivations
  - I/O round‑trip
- [ ] Add PR checklist (below).

### Acceptance

- [x] Import/export round‑trips without loss.
- [ ] Tests pass locally and in CI.

### Test Script

- [ ] Export → delete localStorage → Import → verify.

---

## PR Checklist (paste into each PR description)

- [ ] I did not enable zoom; pan is constrained.
- [ ] Toolbar remains compact at 1280px.
- [ ] No hover‑caused remounts; memoization verified.
- [ ] Node selection clearly shows prerequisites (amber) and dependents (green).
- [ ] Level alignment holds for same‑depth nodes.
- [ ] Local tests pass; manual test script executed.

---

## Debug Overlay (dev only)

Shows JSON card with:

- selectedNodeId, dependencyIds count, dependentIds count
- active filters, view level, layout
- render counts for nodes/edges (increment on render)

Toggle with `?dev=1` or press `D`.

---

## Backlog (post‑MVP)

- Multiple panels & panel switcher.
- Alternative connectors (orthogonal/stepped/curved).
- Soft animations for completion.
- Themes/skins.
- Mobile layout.
- Remove `lib/compat.ts` after migrating imports to new lib scaffold.

## Notes

- Always-on cluster labels with % are rendered for clarity.
- Cluster styles simplified to column containers (background lanes) per M0.
- Level alignment added via `alignByClusterDepth` in `components/graph/layout.ts` for per-cluster Y-line alignment.
- Cluster prerequisites are auto‑derived: if node A in cluster X depends on node B in cluster Y, then Y becomes a prerequisite for X.
