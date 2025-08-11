# Components Restructure Plan

Goal: apply small, testable units to the UI; keep business logic out of components; align with `/lib` scaffold.

## Target structure

components/

- graph/
  - GraphContainer.tsx (wires data from /lib to RF; orchestration only)
  - GraphViewport.tsx (pure ReactFlow element; props only)
  - nodes/
    - CardNode.tsx (presentational)
    - ProgressBadge.tsx, NodeBadges.tsx (atoms)
  - overlays/
    - ClusterLabel.tsx (label pill; %)
    - VisualLegend.tsx (presentational only)
  - panels/
    - DetailPanel.tsx (right drawer; no business logic)
  - hooks/
    - useSelection.ts (maps store → props)
    - useKeyboardShortcuts.ts (encapsulated listeners)
- navbar/
  - TopNav.tsx
  - MoreMenu.tsx (Import/Export)
- panel/
  - FilterChips.tsx
  - FilterMenu.tsx
- dev/
  - DevOverlay.tsx
  - DevRoute.tsx (optional /dev/ui snapshot page)

## Principles

- No business logic in components; components receive prepared data via props.
- Build RF nodes/edges in `/lib/build`; layout in `/lib/layout`.
- Keep props shallow and stable; memoize presentational components.
- Use `/lib/state/store.ts` for shared UI state (selection, focus, filters, view).

## Stepwise refactor plan

1. Extract RF node builder

- Create `/lib/build/build-rf-nodes.ts` that maps domain nodes to RF nodes with `data.progressPct`.
- Use in current `DependencyGraph` (rename GraphContainer.tsx after split).

2. Split `DependencyGraph.tsx`

- GraphContainer.tsx: builds inputs from /lib; renders GraphViewport + overlays + panel.
- GraphViewport.tsx: holds `<ReactFlow>` only.

3. Move panel into components/panels/DetailPanel.tsx

- Accept props: `topic`, `deps`, `dependents`, `onSelectNode`, `onToggleDone`.
- GraphContainer passes computed props.

4. Extract atoms

- Move badge chips, progress badge into `nodes/` atoms.
- Keep CardNode presentational only.

5. Introduce `/lib/state/store.ts`

- Move selection/focus/filters/view to store; adapt GraphContainer and navbar to use selectors.

6. Optional `/dev/ui` route

- Render TopNav + CardNode (4 states) + DetailPanel with mock data.
- Use for screenshots and visual regression checks.

## Acceptance

- No change to UX behavior (zoom locked; free panning; selection and panel behavior unchanged).
- Build green; unit tests pass; rendering performance unchanged or better.
- All business logic lives under `/lib` (build/layout/data/state); components become thin.
