// Map Visualization Constants - Civilization-Inspired Design
import { clusterLabels } from "./constants";

export const MAP_CONSTANTS = {
  // Node dimensions and spacing
  NODE: {
    // Standard node sizes
    WIDTH: {
      COMPACT: 200,
      STANDARD: 280,
      EXPANDED: 320,
    },
    HEIGHT: {
      COMPACT: 120,
      STANDARD: 160,
      EXPANDED: 180,
    },
    // Spacing between nodes
    SPACING: {
      HORIZONTAL: 160,
      VERTICAL: 140,
      CLUSTER_GAP: 220, // Extra space between different clusters
    },
    // Border radius for modern flat design
    BORDER_RADIUS: "12px",
  },

  // Cluster visual organization
  CLUSTERS: {
    // Enhanced cluster color schemes with depth and hierarchy
    COLORS: {
      C1: {
        primary: "#0ea5e9", // sky-500
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", // sky-50 to sky-100
        border: "#0ea5e9",
        text: "#0c4a6e", // sky-900
        accent: "#38bdf8", // sky-400
      },
      C2: {
        primary: "#10b981", // emerald-500
        background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", // emerald-50 to emerald-100
        border: "#10b981",
        text: "#064e3b", // emerald-900
        accent: "#34d399", // emerald-400
      },
      C3: {
        primary: "#f59e0b", // amber-500
        background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", // amber-50 to amber-100
        border: "#f59e0b",
        text: "#92400e", // amber-800
        accent: "#fbbf24", // amber-400
      },
      C4: {
        primary: "#6366f1", // indigo-500
        background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)", // indigo-50 to indigo-100
        border: "#6366f1",
        text: "#312e81", // indigo-800
        accent: "#818cf8", // indigo-400
      },
      C5: {
        primary: "#ef4444", // red-500
        background: "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)", // red-50 to red-100
        border: "#ef4444",
        text: "#991b1b", // red-800
        accent: "#f87171", // red-400
      },
      C6: {
        primary: "#14b8a6", // teal-500
        background: "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)", // teal-50 to teal-100
        border: "#14b8a6",
        text: "#134e4a", // teal-800
        accent: "#2dd4bf", // teal-400
      },
      C7: {
        primary: "#d946ef", // fuchsia-500
        background: "linear-gradient(135deg, #fdf4ff 0%, #f5d0fe 100%)", // fuchsia-50 to fuchsia-100
        border: "#d946ef",
        text: "#86198f", // fuchsia-800
        accent: "#e879f9", // fuchsia-400
      },
      C8: {
        primary: "#64748b", // slate-500
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)", // slate-50 to slate-200
        border: "#64748b",
        text: "#1e293b", // slate-800
        accent: "#94a3b8", // slate-400
      },
      C9: {
        primary: "#84cc16", // lime-500
        background: "linear-gradient(135deg, #f7fee7 0%, #d9f99d 100%)", // lime-50 to lime-200
        border: "#84cc16",
        text: "#365314", // lime-800
        accent: "#a3e635", // lime-400
      },
      C10: {
        primary: "#a855f7", // purple-500
        background: "linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%)", // purple-50 to purple-200
        border: "#a855f7",
        text: "#581c87", // purple-800
        accent: "#c084fc", // purple-400
      },
    },

    // Cluster organization and layout
    LAYOUT: {
      // Preferred cluster positioning (can be overridden by algorithm)
      POSITIONS: {
        C1: { x: 0, y: 0 }, // Foundation - AI Era & Roles
        C2: { x: 1, y: 0 }, // Agents & Protocols
        C3: { x: 2, y: 0 }, // Design Patterns
        C4: { x: 0, y: 1 }, // Caching
        C5: { x: 1, y: 1 }, // Security
        C6: { x: 2, y: 1 }, // Prompt & Context
        C7: { x: 0, y: 2 }, // System Design
        C8: { x: 1, y: 2 }, // Observability
        C9: { x: 2, y: 2 }, // Testing & QA
        C10: { x: 1, y: 3 }, // Cost Control
      },
    },
  },

  // Node status styling (gamification)
  STATUS: {
    LOCKED: {
      background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)", // gray-50 to gray-100
      border: "#d1d5db", // gray-300
      text: "#6b7280", // gray-500
      opacity: 0.6,
      icon: "🔒",
      glow: "none",
    },
    AVAILABLE: {
      background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", // blue-100 to blue-200
      border: "#3b82f6", // blue-500
      text: "#1e40af", // blue-800
      opacity: 1,
      icon: "🎯",
      glow: "0 0 20px rgba(59, 130, 246, 0.3)",
      pulse: true,
    },
    IN_PROGRESS: {
      background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", // amber-100 to amber-200
      border: "#f59e0b", // amber-500
      text: "#92400e", // amber-800
      opacity: 1,
      icon: "⚡",
      glow: "0 0 15px rgba(245, 158, 11, 0.4)",
    },
    COMPLETED: {
      background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", // emerald-100 to emerald-200
      border: "#10b981", // emerald-500
      text: "#065f46", // emerald-800
      opacity: 1,
      icon: "✅",
      glow: "0 0 25px rgba(16, 185, 129, 0.4)",
    },
    GOAL: {
      background: "linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)", // yellow-100 to yellow-300
      border: "#eab308", // yellow-500
      text: "#a16207", // yellow-700
      opacity: 1,
      icon: "🎯",
      glow: "0 0 30px rgba(234, 179, 8, 0.5)",
      pulse: true,
      ring: "3px solid #eab308",
    },
  },

  // Edge (connection) styling
  EDGES: {
    DEFAULT: {
      stroke: "#94a3b8", // slate-400
      strokeWidth: 2,
      opacity: 0.6,
    },
    ACTIVE_PATH: {
      stroke: "#eab308", // yellow-500
      strokeWidth: 3,
      opacity: 1,
      animated: true,
      glow: "0 0 10px rgba(234, 179, 8, 0.5)",
    },
    CROSS_CLUSTER: {
      stroke: "#6b7280", // gray-500
      strokeWidth: 1.5,
      opacity: 0.3,
      strokeDasharray: "5,5",
    },
    COMPLETED_PATH: {
      stroke: "#10b981", // emerald-500
      strokeWidth: 2.5,
      opacity: 0.8,
    },
  },

  // Animations and transitions
  ANIMATIONS: {
    NODE_HOVER: {
      scale: 1.05,
      duration: 200,
      ease: "easeOut",
    },
    NODE_COMPLETE: {
      scale: [1, 1.2, 1],
      duration: 600,
      ease: "easeInOut",
    },
    NODE_UNLOCK: {
      scale: [1, 1.1, 1],
      glow: [0, 1, 0.7],
      duration: 800,
      ease: "easeOut",
    },
    CLUSTER_FOCUS: {
      scale: 1.02,
      duration: 300,
      ease: "easeOut",
    },
    EDGE_DRAW: {
      strokeDashoffset: [100, 0],
      duration: 500,
      ease: "easeInOut",
    },
  },

  // XP and level indicators
  GAMIFICATION: {
    XP_COLORS: {
      LOW: "#84cc16", // lime-500 (1-25 XP)
      MEDIUM: "#f59e0b", // amber-500 (26-75 XP)
      HIGH: "#ef4444", // red-500 (76-150 XP)
      EPIC: "#a855f7", // purple-500 (150+ XP)
    },
    LEVEL_GLOW: {
      1: "0 0 15px rgba(132, 204, 22, 0.4)", // lime
      2: "0 0 20px rgba(245, 158, 11, 0.4)", // amber
      3: "0 0 25px rgba(239, 68, 68, 0.4)", // red
      4: "0 0 30px rgba(168, 85, 247, 0.4)", // purple
    },
  },

  // Zoom configuration - Enhanced for more dramatic differences
  ZOOM: {
    MIN: 0.1, // Allow much more zoomed out
    MAX: 4.0, // Allow much more zoomed in
    DEFAULT: 1.0,
    LEVELS: {
      OVERVIEW: 0.3, // Much more zoomed out for true overview
      CLUSTER: 1.0, // Standard zoom for balanced work
      DETAIL: 2.2, // Much more zoomed in for detailed examination
    },
  },
} as const;

// Utility functions for map styling
export const getClusterStyle = (clusterId: string) => {
  return (
    MAP_CONSTANTS.CLUSTERS.COLORS[
      clusterId as keyof typeof MAP_CONSTANTS.CLUSTERS.COLORS
    ] || MAP_CONSTANTS.CLUSTERS.COLORS.C8
  );
};

export const getStatusStyle = (
  status: "locked" | "available" | "in_progress" | "completed" | "goal"
) => {
  return MAP_CONSTANTS.STATUS[
    status.toUpperCase() as keyof typeof MAP_CONSTANTS.STATUS
  ];
};

export const getXPColor = (xp: number) => {
  if (xp >= 150) return MAP_CONSTANTS.GAMIFICATION.XP_COLORS.EPIC;
  if (xp >= 76) return MAP_CONSTANTS.GAMIFICATION.XP_COLORS.HIGH;
  if (xp >= 26) return MAP_CONSTANTS.GAMIFICATION.XP_COLORS.MEDIUM;
  return MAP_CONSTANTS.GAMIFICATION.XP_COLORS.LOW;
};

export const getClusterLabel = (clusterId: string) => {
  return clusterLabels[clusterId] || clusterId;
};
