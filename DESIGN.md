# DESIGN.md — Wireframe + Element Annotations

_(Civ VI–inspired, path‑first MVP)_

---

## 0) Purpose

This document locks the **structure and behavior** of the UI before styling. It combines:

- A **wireframe** (layout + flow)
- **Element annotations** (rules, states, interactions)

Use this as the single source of truth when handing work to any LLM/dev/designer.

---

## 1) Screen Wireframe (Desktop‑first)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ TOP BAR                                                                      │
│ ┌───────────────┐  ┌─────────────────┐  ┌──────────────┐  ┌─────┐  ┌──────┐ │
│ │  ☰  TITLE     │  │ Search topics…  │  │ Filters ▾    │  │ XP  │  │ More │ │
│ └───────────────┘  └─────────────────┘  └──────────────┘  └─────┘  └──────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│ ACTIVE FILTER CHIPS (dismissible)                                            │
│ [Status: Active] [Style: None] [Level: Cluster] [Goal: —] …                   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  HORIZONTAL SCROLL (clusters)                                                │
│  ┌───────────────── Cluster Column (A) ─────────────────┐  ┌──────────────┐  │
│  │ Header: name • % • lock state                        │  │ Cluster (B)  │  │
│  │ ┌──────────────────────────────────────────────────┐ │  │ Header …     │  │
│  │ │ Node row 1:                                      │ │  │ ┌──────────┐ │  │
│  │ │  ┌───── Node ─────┐      →      ┌──── Node ────┐ │ │  │ │ Node …   │ │  │
│  │ │  | %  title       |   (to B)    | %  title    | │ │  │ └──────────┘ │  │
│  │ │  | badges         |             | badges      | │ │  │   …          │  │
│  │ │  └────────────────┘             └─────────────┘ │ │  └──────────────┘  │
│  │ │        ↓ (within cluster)                        │ │                     │
│  │ │  ┌────────────────┐                              │ │                     │
│  │ │  | next Node …    |                              │ │                     │
│  │ │  └────────────────┘                              │ │                     │
│  │ └──────────────────────────────────────────────────┘ │                     │
│  └──────────────────────────────────────────────────────┘                     │
│                                                                              │
│                                                                              │
│                                             ┌─────────────────────────────┐  │
│                                             │  DETAIL PANEL (sticky)      │  │
│                                             │  Title • % • status         │  │
│                                             │  Description                │  │
│                                             │  Dependencies (chips + go)  │  │
│                                             │  Progress (+actions)        │  │
│                                             │  Related nodes (chips →)    │  │
│                                             └─────────────────────────────┘  │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ MINIMAP (optional, compact)         LEGEND (colors/states)                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Layout principles**

- Clusters are **vertical columns** (scroll horizontally across clusters; vertically within a long cluster).
- Nodes stack **top→bottom** inside a cluster; arrows show edges **downwards** (in‑cluster) and **rightwards** (cross‑cluster).
- Detail panel is **sticky on the right**, never covering nodes in the active column.

---

## 2) Component Inventory & IDs

| ID  | Element             | Purpose                                                                                             |
| --- | ------------------- | --------------------------------------------------------------------------------------------------- |
| A1  | Top Bar / Title     | App identity + compact controls                                                                     |
| A2  | Search              | Client-side filter (node title/keywords)                                                            |
| A3  | Filters menu        | Opens small sheet for status toggles (Active/Completed/Locked, “Only unlockable”, “Show goal path”) |
| A4  | XP/Level pill       | Shows player progress; non-blocking                                                                 |
| A5  | More menu           | Export/Import JSON, Reset view, Help                                                                |
| B1  | Filter Chips row    | Live view of active filters; dismiss to reset each                                                  |
| C\* | Cluster Column      | Container with header and body                                                                      |
| C1  | Cluster Header      | Name, completion %, lock icon (locked/unlocked)                                                     |
| C2  | Cluster Body        | Vertical lane that holds node rows + edges                                                          |
| N\* | Node Card           | Atomic knowledge item with % and badges                                                             |
| E\* | Edges (arrows)      | Dependency lines (down for intra, right for inter)                                                  |
| D1  | Detail Panel        | Rich content for selected node                                                                      |
| L1  | Legend              | Color/states key                                                                                    |
| M1  | Mini‑map (optional) | Orientation aid; can be disabled for MVP                                                            |

---

## 3) Element Annotations (Behavior, Rules, States)

### A) Top Bar & Filters

- **Compact**: single row; no overflow to second line.
- **Search**: filters live list; highlight matches.
- **Filters menu (non-modal popover)**:
  - Status toggles: `Active`, `Completed`, `Locked`, `Only unlockable`.
  - Visibility: `Show goal path`, `Show cross‑cluster edges`.
  - Layout: `Level = Overview | Cluster | Detail` (defaults to **Cluster**).
- **XP/Level pill** (read‑only MVP): total XP and streak (if available).
- **More menu**: `Export JSON`, `Import JSON`, `Reset pan`, `Keyboard shortcuts`.

### B) Filter Chips

- Each chip shows `Group: Value` with an **×** to clear just that filter.
- Chips update in real time.
- If all cleared, row collapses (no extra vertical space).

### C) Cluster Column

- **Header (C1)**:
  - Left: **Cluster Name**; Right: **Completion %** and a **lock icon** (`locked` gray, `unlocked` colored).
  - Clicking the header **focuses** the column: centers it and dims others (no zoom).
- **Body (C2)**:
  - **Vertical lane** with soft guide lines to align nodes at each **dependency level** (same depth = same horizontal line).
  - Internal scroll allowed **only if** the column exceeds viewport height; otherwise full page scroll is vertical.
  - **No free-form dragging**; nodes are positioned by layout engine.
- **Presentation (canonical)**:
  - Prefer translucent **column container overlays** with a label pill showing cluster name and %.
  - Traditional DOM headers are optional and should not disrupt the path layout.

### D) Node Card (N\*)

- **Layout** (fixed size):
  - Top: **% Complete** (big, numeric); optional small badge row (e.g., 🔒 Locked, ⭐ Goal).
  - Middle: **Title** (wrap to two lines max).
  - Bottom: micro‑meta (e.g., “Links 3”).
- **States**:
  - `Active` (unlocked): primary color; edge arrows visible.
  - `Locked`: reduced contrast; arrows still visible, but opacity lowered.
  - `Completed`: saturated color; small ✓.
  - `Goal`: ring highlight.
  - `Hover`: subtle border glow; show quick tooltip (deps + dependents count).
  - `Selected`: ring + keeps highlight until another node is selected.
- **Interactions**:
  - **Single click**: select node; reveal detail panel (D1); highlight dependencies/dependents.
  - **Double click**: (reserved) open extended detail (future).
  - **Right click**: context menu (Mark done/undo, Set/Clear goal).
- **Dependency highlight** when a node is active:
  - **Dependencies (prereqs)**: nodes and edges **amber**.
  - **Dependents (unlocks)**: nodes and edges **emerald**.
  - **Primary**: active node **blue**.
  - Highlights are **subtle** (no blinking).
- **Progress styling**:
  - Node border color intensity scales with `%` using `progressToColor` to maintain approximate AA contrast.
  - Completed paths are brighter; partially completed paths are slightly brighter than neutral.

### E) Edges / Arrows (E\*)

- **In‑cluster**: straight **vertical** with a small arrow pointing **down**.
- **Cross‑cluster**: straight or slightly curved **horizontal** with an arrow **right**.
- Always visible (even if target is locked) with lowered opacity for locked targets.
- On active node: recolor edges per rule above (amber/emerald).
- Edge thickness scales by **importance** (optional later; default single weight).

### F) Detail Panel (D1)

- **Sticky** on the right; never overlaps nodes.
- **Sections**:
  1. **Header**: Title, % complete, status chips (Active/Locked/Completed/Goal).
  2. **Description**: 3–5 lines max; “More” to expand (future).
  3. **Dependencies**: chip list (click to jump/select).
  4. **Progress**: internal progress bar; buttons `Mark done/Undo`.
  5. **Related nodes**: chips (click to jump/select).
- **Keyboard**: `Esc` to clear selection (panel collapses).

### G) Legend (L1)

- Small, bottom-right: swatches for **Active / Locked / Completed** + **Dependency / Dependent** highlight colors.
- Tappable to toggle show/hide highlight (debug/testing aid).

### H) Mini‑map (M1) — _Optional for MVP_

- Bottom-right, tiny; dots by cluster columns; draggable viewport frame.
- Can be disabled via “More”.

---

## 4) Layout & Navigation Rules

- **Desktop‑first**; no mobile layout in MVP.
- **No zoom** (wheel/pinch disabled).
- **Panning**: free pan (both axes). Optional axis‑snapping on modifier (e.g., Shift).
- **Auto-centering**:
  - Clicking a **cluster header** centers that column.
  - Clicking a **node** does not auto‑center.
- **Dependency Depth Alignment**: within each cluster, nodes at the same depth share a horizontal guide line.

---

## 5) Visual System (Civ VI–inspired, light polish only)

_(Implementation happens after structure works. Keep subtle, no heavy animations.)_

- **Palette**: rich neutrals for background; jewel‑tone accents per state:
  - Active: deep blue; Completed: saturated variant; Locked: cool gray.
  - Highlights: Amber (deps), Emerald (dependents), Azure (primary).
- **Shapes**: soft‑rounded rectangles; light inner shadow for cluster lanes; refined stroke on arrows.
- **Typography**: one strong display face for headers; clean sans for labels.

---

## 6) Data → UI Mapping (for devs)

**Node**

```ts
type Node = {
  id: string;
  title: string;
  clusterId: string;
  deps: string[]; // prerequisites
  progress: number; // 0..100
  status: "locked" | "active" | "completed";
  badges?: string[]; // optional tags
};
```

**Cluster**

```ts
type Cluster = {
  id: string;
  name: string;
  order: number; // column index
  lockRule?: {
    // optional MVP rule
    requiredClusters: string[];
    thresholdPct: number; // completion required
  };
};
```

**Computed**

- Cluster % = average of member node completion.
- Node `status` is derived from deps unless explicitly locked in data.

---

## 7) Keyboard & Accessibility

- Keyboard:
  - Arrow keys move selection across nodes on same depth / to next depth.
  - Enter selects; Esc clears.
- ARIA:
  - Nodes = buttons with `aria-pressed` for selected.
  - Edges are decorative; highlight instruction is announced on selection.
- Color:
  - Maintain 4.5:1 contrast; use patterns for color‑blind safety in highlights (dashed amber vs solid emerald).

---

## 8) MVP Cut‑list (must/should/later)

**Must**

- Columns for clusters; fixed‑size nodes aligned by depth.
- Selecting a node: dependency/dependent highlights + detail panel.
- Status filters & chips; compact top bar; no zoom; structured panning.

**Should**

- Cross‑cluster arrows with slight curve and smart routing.
- “Only unlockable” filter.
- Export/Import JSON.

**Later**

- Mini‑map; achievements; themes; advanced layouts; collaboration.

---

## 9) Open Questions

- Do we need **goal path mode** (single highlighted route) in MVP or later?
- Should cluster completion be **weighted** by node importance?
- Do we allow **parallel unlock** rules (N of M deps)?

---

## 10) Handoff Notes

When implementing:

1. Build structure exactly as the wireframe (no stylistic detours).
2. Use the annotations as acceptance criteria.
3. Only after interactions feel right, apply Civ VI visual polish (colors/tones/edges).

_This file + CONTEXT.md + PROGRESS.md are the minimum onboarding kit for any new contributor or LLM._
