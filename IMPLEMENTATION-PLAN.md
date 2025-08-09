Gamified Learning Map – Sequential Implementation Plan (Phases 1–6)
Execution Guidelines
Follow each phase in order; do not skip ahead unless explicitly instructed.

Maintain consistency in UI style, component structure, and color scheme across all phases.

Document all changes in tracker.md at the root of the project, including:

Phase number

Status (In Progress, Completed, Needs Review)

Summary of changes

Any backlog items deferred for later iteration

Use existing component breakdown as the base structure (components split into small, reusable pieces).

Preserve performance optimization — all views must scale to large datasets without lag.

Phase 1 – Sidebar Redesign
Goal: Optimize the left sidebar for space efficiency, improved clarity, and quick state awareness.

Objectives
Collapsible cards for each filter/group.

Show compact “selection summary” when closed (e.g., # of items selected).

Sidebar takes minimal horizontal space when collapsed.

Ensure accessibility and keyboard navigation.

Output
Collapsed + expanded sidebar mockup.

Smooth expand/collapse animation.

State persistence via localStorage.

Phase 2 – Map Visualization Redesign
Goal: Improve cluster/node clarity, space usage, and navigation guidance in the main map.

Objectives
Optimize spacing & layout for maximum visible map area.

Add clear cluster boundaries using consistent but distinct color palettes.

Add visual legend for cluster colors, node states (locked, available, completed).

Introduce “focus mode” for guided viewing.

Smooth zoom/pan with inertia.

Output
Default map layout + focused mode mockups.

Interaction flow diagram for panning/zooming.

Scalable styling that works at any zoom level.

Phase 3 – Cluster View Redesign
Goal: Focus on one cluster at a time, fading out non-relevant nodes but preserving faint cross-links.

Objectives
Dedicated Cluster View mode.

Mini-map or breadcrumb for global position.

Cluster completion % tracking + small celebration animation.

Collapsible subclusters.

Path highlight option from current cluster to another.

Output
Cluster View mockups (default, completion state).

Mini-map integration diagrams.

Transition animations from full map to cluster view.

Phase 4 – Dependency Table View
Goal: Provide a tabular reference of all dependencies for quick filtering, sorting, and cross-referencing.

Objectives
Rows = topics; columns = dependency types.

Search & filter by keyword, cluster, or status.

Color-coded dependency lines:

Same cluster = light cluster color

Cross-cluster = secondary color

Indirect dependencies = italic in table, dashed in map

Critical Path Highlighting toggle.

Output
Dependency table mockups (default, filtered).

Interaction flow between table ↔ map.

CSV/JSON export option.

Phase 5 – Compact vs Full Mode Toggle
Goal: Allow user to switch between a minimal UI for focus and a full UI for exploration.

Objectives
Compact mode hides/collapses non-essential UI.

Full mode restores all UI elements.

Smooth transition animation.

Mode remembered in localStorage.

Works in map, cluster, and dependency views.

Output
Full vs compact mockups.

Animation storyboard.

Shortcut key mappings for both modes.

Phase 6 – Resources & Note-Taking Integration
Goal: Add learning resources and local note-taking per node.

Objectives
Resources tab per node:

External links, embedded videos, community references.

Local notes stored in localStorage.

Rich text formatting for notes.

“Mark as Reviewed” separate from “Completed.”

Resource/Note badges on nodes.

Output
Node detail panel mockups with tabs.

Quick access context menu for notes/resources.

Interaction flow for adding resources and notes.

