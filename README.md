# Knowledge Mapping Platform — Developer Entry Point

This README is the entry point for LLMs and engineers. It summarizes the hard constraints and points to the authoritative specs.

## Quick Links

- North Star: `NorthStarProductBlueprint.md`
- Context & constraints: `CONTEXT.md`
- Design spec (components/behaviors): `DESIGN.md`
- Technical architecture & module responsibilities: `TECHNICAL.md`
- Execution Playbook (DoD, QA, prompts): `EXECUTION_PLAYBOOK.md`
- Progress & status: `PROGRESS.md`
- Library scaffold & migration: `LibraryScaffolding.md`

## Non‑negotiables (MVP)

- Desktop‑first; no mobile
- Zoom disabled; free panning; no auto‑center on click
- Vertical paths in clusters; horizontal between clusters
- Directional edges always visible (even if locked)
- Node progress buckets (0, 25, 50, 75, 100); unlock dependents at ≥75%
- Cluster unlock at ≥75% of prerequisite clusters complete
- Detail panel opens on double‑click; Esc closes; clicking a dependency selects it
- UI logic in components; all business logic in `/lib` (pure & tested)

## LLM Guidance

- Make pure functions under `/lib` with unit tests first. Components consume pure outputs via props.
- Prefer incremental diffs touching only relevant modules. Keep imports aligned to the new scaffold (`lib/{build,data,layout,state,ui,utils}`) or `lib/compat.ts` during migration.
- Never enable zoom; preserve pan and selection behavior.
- After changes: run tests (Vitest) and ensure app build is green.

## Current Gaps (to prioritize)

- Migrate remaining imports to new `/lib` scaffold; then remove `lib/compat.ts`.
- Extract RF node building to `lib/build/build-rf-nodes.ts`.
- Introduce `/lib/state/store.ts` and move global UI state there incrementally.
- Add `/dev/ui` (optional) to snapshot key components with mock data.

## How to propose changes

- Use the diff-first prompt from `EXECUTION_PLAYBOOK.md`.
- Reference exact module paths; include brief bullets on any new props/utilities.
