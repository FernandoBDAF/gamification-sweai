# Backlog (For Post-Phase Iteration)

## Map Rendering & Interaction System Improvements

### 1. **Cluster Hull Rendering**

- **Current State**: Basic convex hull implementation exists but needs enhancement
- **Needs**:
  - Replace current ellipse-based hulls with true convex hull polygons
  - Add configurable padding (30-50px)
  - Implement smooth corners using bezier curves or rounded polygon approach
  - Ensure hulls dynamically resize/reshape when zooming or panning
  - Improve hull color matching with cluster color scheme (opacity 0.2-0.3, border contrast 1-2px stroke)

### 2. **View Levels Behavior**

- **Current State**: Basic view level system exists but transitions need improvement
- **Needs**:
  - **Overview**: Compact spacing, hide labels, show only main cluster hulls + primary node icons
  - **Cluster**: Medium spacing, show labels for main nodes, highlight selected cluster hull
  - **Detail**: Full spacing, all labels visible, focus/zoom on selected cluster or node
  - Implement smooth transitions between levels (zoom & layout changes)

### 3. **Style Options Functionality**

- **Current State**: Multiple style options exist but may not be fully functional
- **Needs**:
  - **None**: No cluster visuals
  - **Background**: Light color block behind each cluster (full map area)
  - **Hull**: Convex hull polygons
  - **Bubble**: Blurred background bubble behind each cluster (glow effect)
  - **Labels**: Always show cluster labels regardless of zoom
  - Ensure all options visibly affect the map

### 4. **Node Selection Behavior**

- **Current State**: Basic node click handling exists
- **Needs**:
  - Clicking a node should center it in the viewport
  - Add highlight with glow/border effect
  - Display details in side/top panel
  - Clicking a cluster name should zoom and center on that cluster

### 5. **Colors & Contrast**

- **Current State**: Color system exists but may need adjustment
- **Needs**:
  - Ensure node colors match cluster colors from legend
  - Adjust cluster fill opacity for visibility without overpowering node content
  - Restore/improve color palette if needed

### 6. **Layout Responsiveness**

- **Current State**: Basic responsive behavior exists
- **Needs**:
  - Map should use all available horizontal and vertical space
  - Nodes/clusters should reposition or rescale when resizing browser window
  - Improve overall responsiveness

**Goal**: After these changes, each style & view level should be visually distinct, nodes/clusters should respond intuitively to clicks, and the display should remain high-contrast and responsive.

---

## Existing Backlog Items

### Deep search integration for map navigation (original Phase 2 idea)

### Alternate map layouts beyond tree view

### Color-coding enhancements for complex dependencies

### Advanced analytics (time spent per topic, learning velocity)

### Multiplayer/mentorship modes

## Future Enhancements (Backlog – Not for this iteration):

### Convex Hull Polygon — dynamic outline hugging card edges for organic shapes

### Blurred Bubble — subtle Gaussian blur effect for a softer grouping style

### Label Positioning Variants — experimenting with label inside vs. outside cluster bounds
