// UI Configuration Constants
export const UI_CONSTANTS = {
  // Animation durations (in milliseconds)
  ANIMATION: {
    PANEL_TRANSITION: 275, // Panel expand/collapse (slightly increased for smoother feel)
    HOVER_TRANSITION: 150, // Hover effects
    TOOLTIP_DELAY: 500, // Tooltip show delay
    CHEVRON_ROTATION: 200, // Chevron rotation animation
  },

  // Spacing and padding
  SPACING: {
    PANEL_GAP: "1.25rem", // 20px - increased gap between panels for better visual separation
    PANEL_PADDING: {
      EXPANDED: "1.25rem", // 20px - slightly increased for better breathing room
      COLLAPSED: "1rem", // 16px - padding inside collapsed panels
    },
    COLLAPSED_SUMMARY_HEIGHT: "2.5rem", // 40px - slightly increased for better readability
    CARD_HEADER_PADDING: "0.75rem", // 12px - consistent header padding
  },

  // Typography
  TYPOGRAPHY: {
    PANEL_TITLE: {
      EXPANDED: "text-sm font-bold", // Made bold for better hierarchy
      COLLAPSED: "text-xs font-bold", // Made bold for consistency
    },
    SUMMARY: {
      EXPANDED: "text-sm", // 14px
      COLLAPSED: "text-xs", // 12px
    },
    COMPACT_SUMMARY: "text-xs", // 12px - even smaller in compact mode
    MICROCOPY: "text-xs text-gray-600", // For descriptive text under controls
  },

  // Icon sizes
  ICONS: {
    CHEVRON: {
      EXPANDED: "w-4 h-4", // 16px
      COLLAPSED: "w-3 h-3", // 12px
    },
    PANEL: {
      EXPANDED: "w-5 h-5", // 20px - increased for better visual presence
      COLLAPSED: "w-4 h-4", // 16px - increased proportionally
    },
    MEDAL: {
      SIZE: "text-xl", // Consistent medal emoji size
      CONTAINER: "w-8 h-8", // Container for medal badges
    },
  },

  // Colors and styling
  COLORS: {
    ACTIVE_BADGE: "bg-blue-100 text-blue-800 border-blue-200",
    INACTIVE_BADGE: "bg-gray-100 text-gray-600 border-gray-200",
    SUCCESS_BADGE: "bg-green-100 text-green-800 border-green-200",
    WARNING_BADGE: "bg-yellow-100 text-yellow-800 border-yellow-200",
    TOOLTIP: "bg-gray-900 text-white",
    HOVER: "hover:bg-gray-50",

    // Progress colors
    PROGRESS: {
      EMPTY: "text-gray-500",
      ACTIVE: "text-green-600",
      COMPLETE: "text-yellow-600",
    },

    // Gamification colors
    MEDAL: {
      GOLD: "text-yellow-600 bg-yellow-50 border-yellow-200",
      SILVER: "text-gray-600 bg-gray-50 border-gray-200",
      BRONZE: "text-amber-600 bg-amber-50 border-amber-200",
    },
  },

  // Gamification styling
  GAMIFICATION: {
    CARD_BACKGROUND: "bg-gradient-to-br from-slate-50 to-gray-50", // Subtle parchment-like gradient
    CARD_BORDER: "border border-gray-200",
    CARD_SHADOW: "shadow-sm hover:shadow-md transition-shadow duration-200",
    PROGRESS_BAR_HEIGHT: "h-3", // Increased thickness for better visibility
    DIVIDER: "border-t border-gray-200 my-3", // Subtle dividers
  },

  // Breakpoints
  RESPONSIVE: {
    MOBILE_BREAKPOINT: "1024px", // lg breakpoint
  },
} as const;

// Helper function to get responsive classes
export const getResponsiveClass = (mobileClass: string, desktopClass: string) =>
  `${mobileClass} lg:${desktopClass}`;

// Animation utility classes
export const ANIMATION_CLASSES = {
  SMOOTH_TRANSITION: `transition-all duration-${UI_CONSTANTS.ANIMATION.PANEL_TRANSITION} ease-in-out`,
  HOVER_TRANSITION: `transition-colors duration-${UI_CONSTANTS.ANIMATION.HOVER_TRANSITION}`,
  CHEVRON_TRANSITION: `transition-transform duration-${UI_CONSTANTS.ANIMATION.CHEVRON_ROTATION} ease-in-out`,
} as const;

// Gamification utility functions
export const getProgressColor = (completionPct: number) => {
  if (completionPct === 100) return UI_CONSTANTS.COLORS.PROGRESS.COMPLETE;
  if (completionPct > 0) return UI_CONSTANTS.COLORS.PROGRESS.ACTIVE;
  return UI_CONSTANTS.COLORS.PROGRESS.EMPTY;
};

export const getMedalInfo = (percentage: number) => {
  if (percentage >= 100)
    return {
      emoji: "🏆",
      label: "Gold",
      color: UI_CONSTANTS.COLORS.MEDAL.GOLD,
      description: "Complete mastery - 100% of topics finished",
    };
  if (percentage >= 80)
    return {
      emoji: "🥈",
      label: "Silver",
      color: UI_CONSTANTS.COLORS.MEDAL.SILVER,
      description: "Advanced progress - 80%+ topics completed",
    };
  if (percentage >= 50)
    return {
      emoji: "🥉",
      label: "Bronze",
      color: UI_CONSTANTS.COLORS.MEDAL.BRONZE,
      description: "Good progress - 50%+ topics completed",
    };
  return null;
};
