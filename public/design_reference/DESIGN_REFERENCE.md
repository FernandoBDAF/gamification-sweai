# Design Reference

This document contains references to all the generated UI elements for the **Knowledge Path Visualizer**.  
All images are stored in `public/design_reference/` for easy access and consistency during development.

---

## 1. Navigation Bar & Filters

**File:** `navbar-filters.png`  
**Description:**  
Navigation bar with title, active/completed dropdown, and filter buttons.  
Used across all screens for consistent navigation.

---

## 2. Node States

**File:** `node-states.png`  
**Description:**  
Visual states for hexagonal nodes:  
- **Active** (progress % displayed)  
- **Inactive** (dimmed)  
- **Locked** (padlock icon)  
- **Completed** (check icon)

---

## 3. Node Detail Panel

**File:** `node-detail.png`  
**Description:**  
Detail modal showing:  
- Node title & description  
- Dependencies  
- Progress bar  
- Related nodes

---

## 4. Settings Modal

**File:** `settings-modal.png`  
**Description:**  
User-configurable options:  
- Toggle display options (progress %, dependency paths, highlight completed nodes)  
- Map behavior (zoom lock, pan & zoom)  
- Theme selection (classic, dark)  
- Action buttons (cancel, save changes)

---

## 5. Map View (Full)

**Files:**  
- `map-view-classic.png`  
- `map-view-dark.png`  

**Description:**  
Full layout showing:  
- Clusters with completion percentages  
- Nodes connected via dependency paths  
- Right-side panel for node details

---

## 6. Alternate Map Layout

**File:** `map-view-alt.png`  
**Description:**  
Variation of the map with different cluster/node arrangements for layout experimentation.

---

## Notes for Future Design Work

- If new components are added (e.g., search bar, mini-map, onboarding), create separate reference images.  
- For alternative visual styles (e.g., light mode, sci-fi), follow the same structure.  
- Mobile/responsive versions should be documented separately when implemented.

---
