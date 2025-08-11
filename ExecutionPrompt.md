You are an autonomous software engineer. Your goal is to complete the MVP end-to-end in this repo by iterating through the tasks below until finished, using small, atomic edits and keeping the build/tests green at every step.

Ground truth docs (read first, use as single source of truth):

- MASTER_EXECUTION_PROMPT.md
- CONTEXT.md
- DESIGN.md
- NorthStarProductBlueprint.md
- EXECUTION_PLAYBOOK.md
- LibraryScaffolding.md
- components/ReactFlow.md
- components/REESTRUCTURE-PLAN.md
- PROGRESS.md

Hard constraints (always true):

- Graph UX: zoom locked; free panning on both axes; no auto-center on node click; cluster header focus may center its column.
- Progress: buckets 0/25/50/75/100; dependents unlock at ≥75% prerequisites; clusters unlock at ≥75% of prerequisite clusters.
- Cluster visuals: translucent “column container” overlays + label pill; edges always visible; level-aligned within clusters.
- Business logic under lib/ (pure/testable): build/, data/, layout/, state/, ui/, utils/.
- Components remain thin/presentational; use lib for builders, layout, state, and data I/O.
- Use diff-first, minimal, isolated edits with concise commit messages.

Workflow loop (repeat until done):

1. Read PROGRESS.md → pick the next unchecked task.
2. Plan the smallest changes required. Write a concise diff plan.
3. Apply edits (diff-first).
4. Run:
   - yarn install --silent
   - yarn build | cat
   - yarn vitest run --reporter=dot | cat # add vitest if missing
   - yarn build-storybook | cat # verify Storybook compiles
     Fix issues until green.
5. Update PROGRESS.md with what changed and acceptance notes.
6. Commit with a small, descriptive message.
7. Iterate to the next task.

Primary task board (mirror and check off in PROGRESS.md):

0. Foundation & Verification

- Confirm DESIGN.md and CONTEXT.md match hard constraints (panning, zoom lock, progress buckets, ≥75% unlock, overlay style).
- Ensure imports prefer the new lib scaffold.

1. Builders & Layout

- Create lib/build/build-rf-nodes.ts (RF node construction with data.progressPct buckets).
- Ensure lib/build/build-edges.ts is the single source for edge styling; migrate usages.
- Move remaining layout helpers to lib/layout/dagre.ts and lib/layout/align.ts; update imports.

2. State Management

- Add lib/state/store.ts (Zustand) for selection, focus, filters, view settings, layout direction, cluster style.
- Incrementally migrate local component UI state to the store without UX change.

3. Component Restructure (see components/REESTRUCTURE-PLAN.md)

- Split components/graph/DependencyGraph.tsx into graph/GraphContainer.tsx and graph/GraphViewport.tsx.
- Extract panels/DetailPanel.tsx as a presentational component (data via props).
- Extract atoms under components/graph/nodes/ and overlays under components/graph/overlays/.
- Keep CardNode purely presentational.

4. Data I/O Wiring

- Wire lib/data/io.ts into navbar/MoreMenu.tsx for Import/Export JSON.
- Validate localStorage persistence for progress and filters.

5. Testing & CI

- Add Vitest as a devDependency; ensure yarn vitest runs (vitest.config.ts may use // @ts-nocheck).
- Add/maintain unit tests for builders, unlock predicates, filters, layout depth.

6. React Flow Guardrails

- Lock zoom: minZoom=maxZoom=1; zoomOnScroll/Pinch/DoubleClick false.
- Remove any onMove viewport setViewport loops; allow default free pan.
- Keep overlays absolute and transform-synced; avoid layout jank.

7. Storybook (Component QA)

- Ensure Storybook is configured (Next.js + Tailwind).
- Add stories for CardNode, DetailPanel, TopNav (and then for every other public component under components/).
- Document Storybook usage in TECHNICAL.md; ensure yarn storybook and yarn build-storybook work.

8. Optional Dev Snapshots

- Add /dev/ui route with mock data for TopNav, CardNode states, and DetailPanel (dev-only).

Definition of Done:

- All tasks above complete; imports use the new lib scaffold; lib/compat.ts removed.
- yarn build, yarn vitest, and yarn build-storybook are green.
- UX matches CONTEXT.md and DESIGN.md.
- PROGRESS.md shows 100% with brief acceptance notes.

React Flow reminders (do not violate):

- Never constrain panning at runtime via onMove + setViewport loops.
- Keep nodeTypes/edgeTypes identities stable across renders.
- Compute layout and build nodes/edges in lib, not inside renders.
- Keep overlays absolute, transform-synced, and lightweight.

If blocked:

- Prefer discovering in-repo info (read code, search) and proceed with a clearly stated assumption in PROGRESS.md rather than pausing.

Start now:

- Read PROGRESS.md, decide the next task, and propose the initial minimal diff plan.

### Follow-up execution prompt: close remaining MVP gaps

You are continuing the same loop. Keep diffs minimal and tests/build/storybook green at every step.

- Ground truth docs: `MASTER_EXECUTION_PROMPT.md`, `CONTEXT.md`, `DESIGN.md`, `NorthStarProductBlueprint.md`, `EXECUTION_PLAYBOOK.md`, `LibraryScaffolding.md`, `components/ReactFlow.md`, `components/REESTRUCTURE-PLAN.md`, `PROGRESS.md`.
- Hard constraints: zoom locked; free panning; no auto-center on node click; translucent cluster overlays with label + %; progress buckets 0/25/50/75/100; unlock at ≥75%; business logic under `lib/`; components thin.

Workflow loop:

1. Read `PROGRESS.md` → pick next task.
2. Write a minimal diff plan.
3. Apply edits.
4. Run: `yarn install --silent && yarn build | cat && yarn vitest run --reporter=dot | cat && yarn build-storybook | cat`
5. Update `PROGRESS.md` with acceptance notes.
6. Commit small message.
7. Repeat.

Tasks to execute now, in order:

1. Apply ≥75% unlock thresholds

- Edits:
  - In `lib/data/graph-progress.ts`: set `NODE_UNLOCK_THRESHOLD = 0.75` and `CLUSTER_UNLOCK_THRESHOLD = 0.75`.
  - In `components/graph/DependencyGraph.tsx`: stop using hard-coded `1.0` and `100` for thresholds; use defaults or pass `0.75` explicitly to `computeStatus` and `isClusterUnlocked`.
  - Update unlock-related tests to expect 75%.
- Acceptance:
  - Nodes with ≥75% of deps done are “available”; clusters unlock when prerequisite clusters are ≥75% complete.

2. Implement progress buckets in nodes

- Edits:
  - Create a pure helper in `lib/data/graph-progress.ts` (e.g., `bucketProgressPct(p: number): 0|25|50|75|100`).
  - Compute per-node progress as percent of dependencies satisfied; bucket it; set `data.progressPct` for each node.
  - `CardNode` already consumes `progressPct` and `progressToColor`; no UI changes needed beyond passing correct values.
- Acceptance:
  - Visual: node borders clearly brighten across 0/25/50/75/100.
  - Add a small unit test for bucketing.

3. Adopt `buildRFNodes` in the graph

- Edits:
  - Replace inline RF node construction in `components/graph/DependencyGraph.tsx` with `lib/build/build-rf-nodes.ts` `buildRFNodes(...)`.
  - Ensure `data` fields match `CardNode` expectations: `topic`, `status`, `progressPct`, `highlightType`, callbacks.
  - Add a unit test for `buildRFNodes` happy path.
- Acceptance:
  - Same UI behavior; RF nodes created by the builder function.

4. Migrate imports to the new lib scaffold

- Edits:
  - Replace:
    - `@/lib/constants` → `@/lib/ui/tokens`
    - `@/lib/map-constants` → `@/lib/ui/map-tokens`
    - `@/lib/cluster-visualization` → `@/lib/ui/cluster-visualization`
    - `@/lib/types` → `@/lib/utils/types`
  - Keep `lib/compat.ts` until all references updated, then remove it.
- Acceptance:
  - `grep` shows no references to deprecated paths; build/tests/storybook green.

5. Wire presentational components

- Edits:
  - Replace inline top bar in `components/AILearningGraph.tsx` with `components/navbar/TopNav.tsx`.
  - Replace inline right-side panel with `components/panels/DetailPanel.tsx`.
  - Preserve behavior: search, filters, import/export, focus/close, progress pill.
- Acceptance:
  - Identical UX; Storybook stories for `TopNav` and `DetailPanel` still render.

6. Extract remaining logic into `lib/data`

- Edits:
  - Move BFS goal-path utility to `lib/data/paths.ts` (pure function with tests).
  - Ensure any remaining filters are centralized in `lib/data/filters.ts`; update components to consume them.
- Acceptance:
  - Components contain no heavy logic; tests cover selectors/pathing.

7. Wire JSON import/export from `lib/data/io.ts`

- Edits:
  - Create `components/navbar/MoreMenu.tsx`; use `exportPanel`/`importPanel` pure functions.
  - Hook `MoreMenu` into `TopNav`; remove file handling from `AILearningGraph`.
- Acceptance:
  - Import/export works from the menu; code is presentational + pure-logic split.

8. Storybook coverage

- Edits:
  - Add stories for any missing public components (e.g., `VisualLegend`, cluster label overlay).
- Acceptance:
  - All public components in `components/` have at least one story; `yarn build-storybook` green.

9. Tests and CI readiness

- Edits:
  - Update unlock tests to 75%.
  - Add tests for bucketing and `buildRFNodes`.
- Acceptance:
  - `yarn vitest` green; Next build green; Storybook build green.

10. Cleanup

- Edits:
  - Remove `lib/compat.ts` after all imports are migrated.
  - Update `PROGRESS.md` Definition of Done.
- Acceptance:
  - No deprecated imports; all three builds pass.

Notes and guardrails:

- Do not reintroduce any onMove + setViewport loops; keep free panning and zoom locked.
- Keep overlays absolute and transform-synced.
- Keep `nodeTypes`/`edgeTypes` identities stable across renders.
- Keep components thin; logic lives in `lib/`.

What to run each cycle:

- `yarn install --silent`
- `yarn build | cat`
- `yarn vitest run --reporter=dot | cat`
- `yarn build-storybook | cat`

Deliverables after finishing all tasks:

- Imports fully migrated; `lib/compat.ts` removed.
- Unlock thresholds at 75%; nodes show bucketed progress visually.
- Graph uses `buildRFNodes`; BFS and filters in `lib/data/*`.
- `TopNav` and `DetailPanel` wired.
- All public components have stories.
- `yarn build`, `yarn vitest`, `yarn build-storybook` all pass.
- `PROGRESS.md` updated with brief acceptance notes.
