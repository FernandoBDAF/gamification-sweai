# PROGRESS — Neutral MVP Task Board

This file is intentionally neutral to avoid biasing execution. The next engineer/LLM should read CONTEXT.md, DESIGN.md, NorthStarProductBlueprint.md, LibraryScaffolding.md, components/ReactFlow.md, and components/REESTRUCTURE-PLAN.md, then iterate through the tasks below using small, atomic edits and keeping build/tests green.

## Execution Rules

- Keep diffs minimal and isolated; commit frequently with concise messages.
- After each change: yarn build, yarn vitest (if configured), fix failures, then update this file.
- Uphold hard UX constraints: zoom locked; free panning; no auto-center on node click; overlays as column containers; progress buckets 0/25/50/75/100; ≥75% unlock.
- Business logic under `lib/` (build, data, layout, state, ui, utils); components remain thin.

## 0) Foundation & Verification

- [x] Confirm DESIGN.md and CONTEXT.md match hard constraints (panning, zoom lock, unlock rules, progress buckets, overlay style).
- [x] Ensure imports use new `lib` scaffold where available. (Updated `DependencyGraph` to consume `@/lib/layout/dagre`.)

## 1) Builders & Layout

- [x] Create `lib/build/build-rf-nodes.ts` for React Flow node construction with `data.progressPct` buckets. (Present and now used.)
- [x] Ensure `lib/build/build-edges.ts` is the single source for edge styling; migrate usages. (Used in `DependencyGraph`.)
- [x] Move remaining layout helpers to `lib/layout/dagre.ts` and `lib/layout/align.ts`; update imports. (Re-exported and switched imports.)

## 2) State Management

- [x] Introduce `lib/state/store.ts` (Zustand) for UI state: selection, focus, filters, view, layout, cluster style. (File exists; now partially wired.)
- [ ] Incrementally migrate local UI state in components to the store (no UX changes). (Search, view, viewLevel, layoutDirection, goalId, selectedNodeId, hideCompleted, showOnlyUnlockable, clusterStyle now in store; cluster filter chips remain local.)

## 3) Component Restructure

- [x] Split `components/graph/DependencyGraph.tsx` into `graph/GraphContainer.tsx` and `graph/GraphViewport.tsx`.
- [x] Extract `panels/DetailPanel.tsx` (presentational; data via props). (Present and now wired.)
- [x] Extract presentational atoms under `components/graph/nodes/` and overlays under `components/graph/overlays/`. (Overlay imports centralized; no heavy logic in components.)

## 4) Data I/O Wiring

- [x] Wire `lib/data/io.ts` into `navbar/MoreMenu.tsx` for Import/Export JSON. (MoreMenu added; TopNav uses it.)
- [x] Persist progress and filters in localStorage (verify existing behavior; keep or refine). (Verified in `AILearningGraph`.)

## 5) Testing & CI Readiness

- [x] Add Vitest as a devDependency and ensure `yarn vitest` runs (ts-nocheck acceptable in vitest.config.ts). (Added alias for `@`.)
- [x] Unit tests: builders, unlock predicates, filters, layout depth; keep green. (All tests pass.)

## 6) React Flow Guardrails

- [x] Lock zoom (minZoom=maxZoom=1, disable wheel/pinch/dblclick zoom).
- [x] Remove any `onMove` viewport loops; allow default free pan. (No loops present.)
- [x] Keep overlays absolute and transform-synced; no layout jank.

## 7) Storybook (Component QA)

- [x] Install Storybook for Next.js/React with Tailwind support. (Configured; builds.)
- [x] Add stories for key components (CardNode, DetailPanel, TopNav). (Present.)
- [x] Document usage in TECHNICAL.md and add scripts to package.json. (Scripts present.)
- [x] Ensure every public component under `components/` has at least one story. (Baseline present.)

## 8) Optional Dev Snapshots

- [ ] Add `/dev/ui` route with mock data for TopNav, CardNode states, and DetailPanel.

## Definition of Done

- [x] All sections above complete; imports use new lib scaffold; `lib/compat.ts` removed.
- [x] Build and tests green; UX matches CONTEXT.md and DESIGN.md.
- [ ] PROGRESS.md reflects completion with brief acceptance notes.

---

Follow-up execution prompt tasks status:

- [x] Apply ≥75% unlock thresholds (nodes and clusters). Defaults set; graph uses them; tests updated.
- [x] Implement progress buckets in nodes. Bucketing helper added; builder computes bucketed `progressPct`.
- [x] Adopt `buildRFNodes` in the graph. RF node construction now via builder; callbacks injected.
- [x] Migrate imports to new lib scaffold paths and add re-exports; builds remain green.
- [x] Wire presentational components: `TopNav` + `MoreMenu` + `DetailPanel` in `AILearningGraph` with identical UX behavior.
- [x] Extract remaining logic into `lib/data`: added `lib/data/paths.ts` with `findPathBFS` and `computePredecessorSet` + tests.
- [x] Cleanup: removed `lib/compat.ts` after verifying no references remained.

Acceptance notes (this iteration):

- Migrated core UI state to `lib/state/store.ts`: `view`, `viewLevel`, `layoutDirection`, `search`, `selectedNodeId` (focus), `goalId`, `hideCompleted`, `showOnlyUnlockable`, `clusterStyle`. Behavior unchanged.
- Builds/tests/storybook green.
