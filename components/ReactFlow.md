# React Flow — Implementation Guidance

This document explains why React Flow is the right choice for the MVP, and how to use it to meet our specs while staying future‑proof.

## Why React Flow for MVP

- Directional graph primitives (nodes/edges) with custom node/edge types
- Controlled camera: we can fully lock zoom and allow free pan
- Good performance with memoized nodes/edges
- Extensible for custom edges (orthogonal/stepped), markers, and overlays
- Strong ecosystem; maintained; fits our Civ‑VI style graph

## MVP goals mapped to React Flow

- Zoom disabled: `minZoom=maxZoom=1`, `zoomOnScroll={false}`, `zoomOnPinch={false}`, `zoomOnDoubleClick={false}`
- Free panning: do not override onMove with setViewport loops; use default panning
- Selection: `elementsSelectable`, handle `onNodeClick` to set selection; never call `fitView` on select
- Double‑click panel: `onNodeDoubleClick` triggers focus panel (keep selection separate)
- Directional edges: use custom edge styles; arrow markers on `markerEnd`
- Always-visible edges: include edges even for locked targets
- Level alignment: compute depth per cluster in `/lib/layout/align.ts` and align Y by group
- Cluster overlays: absolute layer synced to viewport transform; no layout shift
- Progress illumination:
  - Compute `progressPct` in builders (MVP buckets 0/25/50/75/100)
  - `progressToColor` for node border intensity
  - Use centrally built edges from `/lib/build/build-edges.ts` to brighten completed and partial paths

## Best practices for stability & performance

- Keep nodeTypes and edgeTypes stable; avoid recreating objects each render
- Build RF nodes/edges in `/lib/build` and pass arrays as props; no heavy computation in render
- Memoize nodes/edges with referential integrity; prefer `useMemo` + stable inputs
- Throttle hover (≤150ms); never mount/unmount nodes on hover
- Avoid `fitView` during interaction; only use it on cluster focus or initial mount
- Keep overlays in a transform‑synced absolute container: `transform: translate(tx,ty) scale(k)`

## Implementation checklist

- [ ] Create `/lib/build/build-rf-nodes.ts` that accepts domain nodes + statuses and returns RF nodes:
  - includes `data.progressPct` in MVP buckets
  - includes `highlightType` for dependency/dependent coloring
- [ ] Use `/lib/build/build-edges.ts` to get styled edges (neutral, partial brighter, completed brightest); preserve amber/green highlight rules
- [ ] Lock zoom as above; allow free panning; ensure no onMove setViewport loops
- [ ] Keep selection (map) and focus (panel) in separate state keys (store)
- [ ] Render overlays in an absolute container synced to `useStore((s)=>s.transform)`

## Future‑proofing (post‑MVP)

- Custom edges: introduce orthogonal/stepped edges via custom edge type
- Edge routing: avoid overlap; route around column containers if needed
- Mini‑map: small, optional; integrate later for orientation
- Animated progress: subtle transitions on completion; respect performance budget
- Large graphs: virtualize overlays and legend; chunk builders; debounce layout calls

## Common pitfalls

- onMove + setViewport loops (causes freeze) → Do not constrain axis at runtime; prefer optional axis snap on modifier
- Changing nodeTypes/edgeTypes identity on each render → use stable module‑level objects or memoize
- Computing layout in render → move to `/lib/layout`; use memoized inputs
- Heavy overlays in DOM flow → always absolute and transform‑synced
