# AI Learning Graph - Usage Manual

Welcome to the AI Learning Graph! This interactive application helps you visualize and track your AI/SWE learning journey through a gamified tech tree interface.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Navigation & Controls](#navigation--controls)
4. [Node Interactions](#node-interactions)
5. [Sidebar Panels](#sidebar-panels)
6. [Cluster Visualization](#cluster-visualization)
7. [Progress Tracking](#progress-tracking)
8. [Data Management](#data-management)
9. [Troubleshooting](#troubleshooting)
10. [Tips & Best Practices](#tips--best-practices)

---

## 🚀 Getting Started

### First Launch

1. Open the application in your browser
2. You'll see the main learning graph with interconnected topic nodes
3. The sidebar on the left contains control panels
4. The legend button (❓) in the bottom-right provides help

### Initial Setup

- No account required - all progress is saved locally in your browser
- Start by exploring the map using mouse controls
- Set your first learning goal to begin tracking progress

---

## 🖥️ Interface Overview

### Main Areas

**Compact Top Navigation Bar**
- Application title and branding in minimal header
- Maximizes vertical space for the learning graph
- Clean, professional layout optimized for productivity

**Horizontal Control Strip**
- All control panels integrated into a single horizontal navigation bar
- Scrollable on smaller screens to accommodate all controls
- Includes: Progress, Search, Filters, Cluster Selection, Goals, Badges, View Controls, and Data Management
- Space-efficient design maximizing map real estate

**Main Content Area (Full Screen)**
- Interactive graph using 100% of available width and height
- Dramatically enhanced cluster effects with proper positioning
- Responsive to view level changes with meaningful visual differences
- Background has subtle Civilization-inspired gradient patterns

**Controls (Top-Right of Map)**
- Zoom in/out buttons with extended range (0.1x to 4.0x)
- Fit view button to center the graph
- Enhanced mini-map for navigation

**Legend (Bottom-Right of Map)**
- Floating help button (❓)
- Comprehensive guide to all visual elements

---

## 🖱️ Navigation & Controls

### Horizontal Control Strip Features

**Progress Display**
- Compact circular level indicator with current XP
- Shows XP total, completion percentage, and streak days
- Color-coded with blue gradient background

**Search & Filters**
- Inline search box with clear button
- Compact checkboxes for "Hide completed" and "Only unlockable"
- Real-time filtering as you type

**Cluster & Goal Selection**
- Dropdown selectors for cluster filtering and goal setting
- Compact labels with clear visual hierarchy
- Smart filtering of available goals based on unlock status

**Cluster Badges**
- Horizontal display of top 5 clusters with medal indicators
- 🥇 Gold (100%), 🥈 Silver (50-99%), 🥉 Bronze (1-49%)
- Compact percentage display with tooltips

**View Controls**
- Icon-based buttons for Tree (🌲), Cluster (🎯), Matrix (📊) views
- Compact toggle design with clear active states
- Immediate visual feedback on selection

**Data Management**
- Inline Export and Import buttons
- Color-coded: Blue for export, Green for import
- One-click progress backup and restore

### Mouse Controls
- **Scroll Wheel**: Zoom in/out (now 0.1x to 4.0x range)
- **Click & Drag**: Pan around the map
- **Click Node**: Open detailed information panel
- **Click Background**: Deselect nodes
- **Hover Node**: Show quick tooltip
- **Hover Cluster**: Enhanced visual feedback with dramatic effects

### Responsive Design
- **Desktop**: Full horizontal layout with all controls visible
- **Tablet**: Horizontal scrolling for control strip
- **Mobile**: Optimized spacing with icon-only view controls
- **Small Screens**: Abbreviated labels with full tooltip information

---

## 🔵 Node Interactions

### Node States

Each topic node displays its current status:

- **🔒 Locked**: Prerequisites not completed (gray, low opacity)
- **⚡ Available**: Ready to start (blue border, pulsing glow)
- **✅ Completed**: Successfully finished (green border, checkmark)
- **🎯 Goal**: Your current learning target (yellow ring, animated)

### Node Information

Click any node to see:

- **Topic Details**: Title, XP value, dependencies
- **Action Buttons**: Mark complete, set as goal, mark reviewed
- **Notes Section**: Add personal notes
- **Progress Indicators**: Small dots showing review status and notes

### XP Stars

Nodes display experience level with colored stars:

- **1 Star (Green)**: 1-25 XP (Beginner)
- **2 Stars (Amber)**: 26-75 XP (Intermediate)
- **3 Stars (Red)**: 76-150 XP (Advanced)
- **4 Stars (Purple)**: 150+ XP (Expert)

### Cluster Badges

Each node shows its cluster affiliation with a colored badge (C1-C10).

---

## 📊 Sidebar Panels

### Progress Panel

**Displays:**

- Current XP total and level
- Daily streak counter with bonus multiplier
- Completion percentage
- Progress bar with color coding

**Features:**

- Collapsed view shows XP and percentage
- Tooltips explain streak bonuses
- Achievement hints for motivation

### Filter Panel

**Search:**

- Type to filter topics by name or ID
- Real-time filtering as you type
- Clear button to reset search

**View Modes:**

- Toggle between different display options
- Hide completed topics to focus on remaining work
- Compact mode for smaller displays

**Collapsed Summary:**
Shows active filter count and search term preview.

### Cluster Badges Panel

**Medal System:**

- **🥇 Gold**: 100% cluster completion
- **🥈 Silver**: 50-99% cluster completion
- **🥉 Bronze**: 1-49% cluster completion

**Features:**

- Hover tooltips explain medal requirements
- Visual progress for each of the 10 learning clusters
- Gamification encouragement

### Data Management Panel

**Export Progress:**

- Download your progress as JSON file
- Includes completion status, notes, and timestamps
- Useful for backup or sharing

**Import Progress:**

- Upload previously exported progress file
- Merge or replace current progress
- Validates file format automatically

**Timestamps:**
Shows last import/export activity.

### View Controls Panel

**Cluster Visualization:**
Choose from 4 styles:

- **⬜ Background**: Translucent cluster backgrounds (recommended)
- **🔷 Hull**: Organic curved boundaries
- **🫧 Bubble**: Soft blurred groupings
- **🏷️ Labels**: Label-only mode
- **⭕ None**: No cluster visualization

**Layout Options:**

- Direction toggle (vertical/horizontal)
- Zoom level presets
- Cluster focus mode

---

## 🎨 Cluster Visualization

### Translucent Background (Recommended)

- **Visual**: Soft, semi-transparent backgrounds around cluster groups
- **Benefits**: Clear visual grouping without overwhelming content
- **Interactions**: Hover to highlight, click label to focus cluster
- **Best For**: General use, presentations, clear visual hierarchy

### Convex Hull Polygon

- **Visual**: Organic curved outlines following node shapes
- **Benefits**: Natural, dynamic boundaries that adapt to content
- **Animations**: Smooth path drawing when clusters appear
- **Best For**: Artistic presentations, organic feel

### Blurred Bubble

- **Visual**: Soft, diffused halos around cluster groups
- **Benefits**: Gentle visual grouping without hard edges
- **Effects**: Subtle glow and scaling on hover
- **Best For**: Minimalist aesthetic, soft visual style

### Label Positioning

- **Visual**: Prominent cluster labels with completion stats
- **Benefits**: Focus on cluster identity and progress
- **Features**: Dynamic positioning, zoom-aware sizing
- **Best For**: Progress tracking, cluster-focused workflows

### None

- **Visual**: No cluster visualization
- **Benefits**: Clean, minimal interface focusing on individual nodes
- **Best For**: Detailed node work, reduced visual complexity

---

## 📈 Progress Tracking

### XP System

- **Earning XP**: Complete topics to gain experience points
- **Levels**: Automatic leveling based on total XP
- **Streak Bonuses**: Daily activity multiplies XP gains

### Goal Setting

1. Click any available node
2. Select "🎯 Set Goal" button
3. Path to goal highlights in animated yellow
4. Progress indicators show completion status

### Review System

- Mark topics as "👁️ Reviewed" after studying
- Add personal notes for future reference
- Visual indicators on nodes show review status

### Completion Tracking

- Mark topics as complete when finished
- Unlocks dependent topics automatically
- Updates cluster badges and overall progress

---

## 💾 Data Management

### Automatic Saving

- All progress saves automatically to browser storage
- No account required
- Data persists between sessions

### Manual Backup

1. Open "Data Management" panel
2. Click "Export Progress"
3. Save the downloaded JSON file
4. Store safely for backup

### Restoring Progress

1. Open "Data Management" panel
2. Click "Import Progress"
3. Select your saved JSON file
4. Choose merge or replace option
5. Confirm import

### Data Privacy

- All data stored locally in your browser
- No external servers or accounts
- Complete privacy and control

---

## 🔧 Troubleshooting

### Common Issues

**Graph Not Loading**

- Refresh the page
- Clear browser cache
- Ensure JavaScript is enabled

**Progress Not Saving**

- Check browser storage permissions
- Disable private/incognito mode
- Export progress as backup

**Performance Issues**

- Use "Overview" zoom for large graphs
- Close unused browser tabs
- Try different cluster visualization modes

**Mobile Display Issues**

- Use hamburger menu to access sidebar
- Pinch to zoom on touch devices
- Rotate to landscape for better view

### Browser Compatibility

- **Recommended**: Chrome, Firefox, Safari (latest versions)
- **Minimum**: Any modern browser with JavaScript enabled
- **Mobile**: iOS Safari, Android Chrome

### Reset Options

If you need to start fresh:

1. Clear browser data for the site
2. Refresh the page
3. Or manually delete all progress in Data panel

---

## 💡 Tips & Best Practices

### Getting Started

1. **Set Your First Goal**: Choose an interesting topic to create motivation
2. **Explore Dependencies**: Click nodes to understand prerequisites
3. **Use Search**: Find specific topics quickly with the search function
4. **Start Small**: Complete easier topics first to build momentum

### Effective Learning

1. **Follow Dependencies**: Respect the prerequisite structure
2. **Take Notes**: Use the notes feature for key insights
3. **Review Regularly**: Mark topics as reviewed after studying
4. **Track Streaks**: Daily engagement builds habits

### Visual Organization

1. **Choose Your Style**: Pick a cluster visualization that works for you
2. **Use Zoom Levels**: Switch between overview and detail as needed
3. **Focus Clusters**: Click cluster labels to isolate related topics
4. **Goal Paths**: Set goals to see learning progression clearly

### Progress Management

1. **Regular Exports**: Backup your progress weekly
2. **Honest Tracking**: Only mark topics complete when truly finished
3. **Use Filters**: Hide completed work to focus on remaining topics
4. **Celebrate Progress**: Check your badges and XP regularly

### Collaboration

1. **Share Progress**: Export and share JSON files with study partners
2. **Compare Paths**: Different people may take different learning routes
3. **Group Goals**: Coordinate on cluster completion with teammates

### Customization

1. **Experiment with Views**: Try different visualization modes
2. **Adjust Layout**: Switch between vertical and horizontal flows
3. **Compact Mode**: Use for smaller screens or focused work
4. **Panel Management**: Collapse panels you don't need

---

## 🎯 Quick Reference

### Essential Actions

- **Set Goal**: Click node → "🎯 Set Goal"
- **Mark Complete**: Click node → "📚 Mark Complete"
- **Add Notes**: Click node → Type in notes field → "Save Note"
- **Change View**: Sidebar → "Cluster Style" → Select mode
- **Export Progress**: Sidebar → "Data Management" → "Export Progress"

### Visual Legend

- 🔒 Locked | ⚡ Available | ✅ Completed | 🎯 Goal
- 🥇 Gold Medal | 🥈 Silver Medal | 🥉 Bronze Medal
- ⭐ 1-4 Stars for XP levels
- 🎨 Cluster colors (C1-C10)

### Keyboard Shortcuts

- **Escape**: Close panels
- **Space + Drag**: Pan view
- **Mouse Wheel**: Zoom

---

**Need more help?** Click the ❓ legend button for interactive guidance, or refer to the detailed tooltips throughout the interface.

Happy Learning! 🚀✨
