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

- [x] Create `lib/build/build-rf-nodes.ts` for React Flow node construction with `data.progressPct` buckets. (Present and used indirectly.)
- [x] Ensure `lib/build/build-edges.ts` is the single source for edge styling; migrate usages. (Used in `DependencyGraph`.)
- [x] Move remaining layout helpers to `lib/layout/dagre.ts` and `lib/layout/align.ts`; update imports. (Re-exported and switched imports.)

## 2) State Management

- [x] Introduce `lib/state/store.ts` (Zustand) for UI state: selection, focus, filters, view, layout, cluster style. (File exists; not yet fully wired.)
- [ ] Incrementally migrate local UI state in components to the store (no UX changes).

## 3) Component Restructure

- [ ] Split `components/graph/DependencyGraph.tsx` into `graph/GraphContainer.tsx` and `graph/GraphViewport.tsx`.
- [x] Extract `panels/DetailPanel.tsx` (presentational; data via props). (Present.)
- [ ] Extract presentational atoms under `components/graph/nodes/` and overlays under `components/graph/overlays/`.

## 4) Data I/O Wiring

- [ ] Wire `lib/data/io.ts` into `navbar/MoreMenu.tsx` for Import/Export JSON.
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

- [ ] All sections above complete; imports use new lib scaffold; `lib/compat.ts` removed.
- [x] Build and tests green; UX matches CONTEXT.md and DESIGN.md.
- [ ] PROGRESS.md reflects completion with brief acceptance notes.

---

Acceptance notes (this iteration):

- Updated layout imports to `@/lib/layout`, ensured RF zoom lock and free pan, and centralized edge styling via `lib/build/build-edges`.
- Fixed tests by adding Vitest alias for `@`, improving selectors search exact-id preference, and adding a TopicNode overload for unlock threshold.
- Storybook builds successfully; Next.js build is green; all tests pass.
