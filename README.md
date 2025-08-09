# AI Learning Graph

A Next.js 14 application for visualizing AI/SWE learning paths with gamification features and advanced cluster visualization.

## ✨ Features

### 🎮 Gamification System

- **XP Points & Levels**: Earn experience points and level up
- **Daily Streaks**: Maintain learning streaks with bonus multipliers
- **Achievement Badges**: Gold, Silver, Bronze medals for cluster completion
- **Progress Tracking**: Visual progress indicators and completion percentages

### 🗺️ Advanced Map Visualization

- **Civilization-Inspired Design**: Professional strategy game aesthetics
- **Interactive Node System**: Click, hover, and expand detailed information
- **Goal Path Highlighting**: Animated paths showing learning progression
- **Multi-Level Zoom**: Overview, Cluster, and Detail view modes
- **Dynamic Layout**: Auto-positioning with Dagre algorithms

### 🎨 **Cluster Visualization Styles** (NEW!)

Choose from 4 distinct visualization modes:

1. **⬜ Translucent Background** _(Primary Focus)_

   - Soft-edged, semi-transparent backgrounds with 22-25% opacity
   - Modern 12px corner radius with subtle borders
   - Enhanced padding to prevent edge collision
   - Color-matched labels with cluster branding

2. **🔷 Convex Hull Polygon**

   - Organic, curved polygons using Graham scan algorithm
   - Exaggerated curve smoothing for natural graph shapes
   - Dynamic path drawing animations

3. **🫧 Blurred Bubble**

   - Diffused halo effects with enhanced blur radius
   - Smooth scaling animations on hover
   - Soft visual grouping without hard edges

4. **🏷️ Label Positioning**
   - Flexible label positioning (top-center, top-left, floating, pinned-side)
   - Zoom-aware font scaling and positioning
   - Purple pill-shaped labels with completion stats

### 🎯 Interactive Features

- **Hover Interactions**: Cluster highlighting with completion tooltips
- **Click to Focus**: Isolate clusters with related dependencies
- **Real-time Updates**: Dynamic boundary resizing as nodes change
- **Smooth Animations**: 250ms transitions with cubic-bezier easing
- **A/B Testing Ready**: Toggleable visualization modes

### 📊 Sidebar Panels

- **Progress Panel**: XP, levels, streaks, and completion stats
- **Filter Panel**: Search, view modes, and content filtering
- **Cluster Badges**: Medal system showing completion achievements
- **Data Management**: Import/export progress with timestamps
- **View Controls**: Layout direction and zoom level management

### 🔧 Technical Features

- **Next.js 14** with App Router and TypeScript
- **React Flow** for interactive graph visualization
- **Framer Motion** for smooth animations
- **Tailwind CSS** for utility-first styling
- **Local Storage** persistence for user progress
- **Responsive Design** with mobile hamburger menu
- **Performance Optimized** for 50-200+ nodes

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📱 Usage

1. **Explore the Map**: Use mouse wheel to zoom, drag to pan
2. **Set Learning Goals**: Click any node and select "Set Goal"
3. **Track Progress**: Mark topics as completed and reviewed
4. **Switch Views**: Use sidebar controls to change visualization styles
5. **Focus Clusters**: Click cluster labels to isolate related topics
6. **Customize Display**: Toggle between different cluster visualization modes

## 🎨 Cluster Visualization Guide

The **Translucent Background** style is optimized for:

- ✅ **Clarity**: 22-25% opacity for perfect balance
- ✅ **Visual Cohesion**: Color-matched cluster branding
- ✅ **WCAG Compliance**: Proper contrast ratios
- ✅ **Zoom Adaptability**: Dynamic scaling across all levels
- ✅ **Space Efficiency**: Tight bounds with adequate padding

## 🏗️ Architecture

- `lib/cluster-visualization.ts` - Core cluster algorithms and styling
- `components/graph/ClusterVisualization.tsx` - React components
- `components/graph/DependencyGraph.tsx` - Main graph orchestration
- `lib/map-constants.ts` - Visual design system constants
- `lib/gamification.ts` - Progress tracking and XP system

## 📈 Performance

- **Zero Build Errors**: Production-ready codebase
- **Type-Safe**: Comprehensive TypeScript coverage
- **Optimized Rendering**: Efficient React patterns and memoization
- **Scalable**: Handles 50-200+ nodes smoothly
- **Cross-Platform**: Works on all modern browsers

---

Built with ❤️ using Next.js 14, React Flow, and modern web technologies.
