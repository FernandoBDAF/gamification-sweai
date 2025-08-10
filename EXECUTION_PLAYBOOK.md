# Execution Playbook (Ship-Ready)

## 1) Definition of Done (DoD)

A change is Done when ALL are true:

- Matches North Star behavior (cluster columns, vertical/horizontal paths, locked zoom, node % always visible).
- Matches DESIGN.md components (Navbar, Node, Detail Panel) and uses images in `public/design_reference/*` as visual guardrails.
- No regressions in: node selection, path arrows, pan/fitView behavior, cluster grouping.
- Passes Visual QA checklist (below) on Chrome + Safari, 1440x900 and 1920x1080.
- Merges with clean diff, descriptive PR, and any in-app debug flags turned off.

### Visual QA (copy/paste into every PR)

Layout
- [ ] Columns align; nodes at same dependency level align horizontally
- [ ] No overflow on navbar at 1440px; controls readable
- [ ] Node percent always visible; inactive uses lighter shade

Interactions
- [ ] Single click selects (no auto-center); double click opens panel
- [ ] Hover tooltip under 150ms
- [ ] Dependency highlights: prerequisites vs dependents are distinct

Map
- [ ] Zoom locked; trackpad/scroll does not zoom
- [ ] Smooth vertical/horizontal pan only
- [ ] Edges render for locked nodes

Performance
- [ ] No flicker on hover or pan
- [ ] Re-layout under ~150ms on filter changes

---

## 2) Branching and commits

- main: always shippable
- feat/<slug>: one feature or sub-feature per branch
- fix/<slug>: regression/hot fix
- Small commits with atomic diffs. Each commit answers: what changed + why.

---

## 3) Issue / Prompt templates

### Task card (Jira/GitHub)

```
Title: [feat] Compact Navbar v1 (no overflow @1440px)

Goal:
- Replace current navbar with compact, icon-first design per DESIGN.md (Navbar).
- Keep filter behavior identical; only visual grouping/spacing changes.

Constraints:
- Desktop-first
- Do not add zoom/pan features
- Do not remove existing working features

Acceptance:
- Matches design reference: /public/design_reference/navbar/navbar-filters.png
- At 1440px width, all primary controls visible; secondary in "More"
- Hover tooltip <150ms; icons legible at 24px
```

### LLM diff-first prompt (paste each time)

```
Continue from the current code state. Do not remove existing working features unless explicitly requested.

Context:
- North Star: README.md
- Architecture: DESIGN.md
- Reference images: public/design_reference/* (navbar, node-states, node-detail, settings-modal)

Task:
- Implement <feature> as per DESIGN.md section <section>.
- Keep zoom locked and pan behavior intact.

Deliver:
- Unified diff(s) only.
- Summarize any new props or utils in 3 bullets.

Do not:
- Add new libraries unless necessary
- Modify unrelated files
```

---

## 4) Review checklist

- Spec match: PR aligns with DESIGN.md and the exact image under `public/design_reference/...`.
- Scope: Only touches files relevant to the feature.
- Risk: No changed defaults (zoom, selection behavior, layout strategy).
- Telemetry/debug: No console noise; guard debug behind `__DEV__` or `DEBUG_UI=false`.
- Docs: PROGRESS.md updated (status + next step).

---

## 5) Regression guardrails

- Feature flags (env or localStorage):
  - UI_NAVBAR_V1, UI_NODE_V1, UI_PANEL_V1. Default true. Keep old paths for one sprint as fallback.
- Snapshot stories or dev route:
  - `/dev/ui` renders: Navbar, Node (4 states), Node Panel using fixed mock data.
- Layout unit tests (pure functions only):
  - Dagre params, cluster grouping, sibling-level alignment.
- Optional image diffs:
  - Save a PNG of `/dev/ui` at 1440x900 and compare manually if something looks off.

---

## 6) Cadence

- Daily (or per feature): 1-2 diff-first LLM iterations -> review -> merge.
- Every 3-4 features: quick stabilization pass (papercuts, remove debug CSS).
- Weekly checkpoint: update PROGRESS.md (✅/🚧), capture 2-3 screenshots to `/docs/progress/YYYY-MM-DD/`.

---

## 7) Immediate implementation plan (next 3 PRs)

PR #1 — Compact Navbar V1
- Icon-first groups: Filters • Active/Completed • More (overflow)
- Hover tooltips (instant)
- No horizontal overflow at 1440px
- Ref: `public/design_reference/navbar/navbar-filters.png`

PR #2 — Node Card V1 (four states)
- Fixed size; % always visible; subtle bevel; gold outline
- States: Active / Inactive (light) / Locked (lock badge) / Completed (check)
- Ref: `public/design_reference/nodes/node-states.png`

PR #3 — Node Detail Panel V1
- Title, Description, Dependencies (badges), Progress bar, Related nodes (chips)
- Open on double-click only; non-blocking
- Ref: `public/design_reference/nodes/node-detail.png`

After these three: we have a stable baseline to wire path arrows and dependency highlighting safely.

---

## 8) Artifacts map

- README.md -> North Star (what we are building)
- CONTEXT.md -> Constraints & vocabulary
- DESIGN.md -> Components, behaviors, visual validation
- public/design_reference/ -> Ground-truth images
- PROGRESS.md -> Status, next up, learnings

---

## 9) Success metrics

- Time-to-merge per feature: <= 24h
- Visual regressions after merge: 0 (checked against /dev/ui)
- Interaction bugs during QA: <= 1 per sprint
- Smooth pan/hover at 1440x900 (no visible stutter)

---

## 10) Next actions

1) Create issues for PR #1-#3 using the Task card template above.
2) For each, run the LLM diff-first prompt with links to the exact reference PNGs.

I will review PRs against these checklists, keep PROGRESS.md updated, and draft the next prompt as soon as one lands.
