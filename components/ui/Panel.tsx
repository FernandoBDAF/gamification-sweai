import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "./Card";
import { Tooltip } from "./Tooltip";
import { UI_CONSTANTS, ANIMATION_CLASSES } from "@/lib/ui-constants";

interface PanelProps {
  id: string;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
  collapsedSummary?: React.ReactNode;
  compactMode?: boolean;
  icon?: React.ReactNode;
  tooltipContent?: string;
  isPinned?: boolean;
  onPinToggle?: (id: string, pinned: boolean) => void;
}

// Simple localStorage utilities
const UI_STORAGE_KEY = "ai-learning-graph-ui";

function getPanelState(panelId: string, defaultOpen: boolean): boolean {
  if (typeof window === "undefined") return defaultOpen;

  try {
    const stored = localStorage.getItem(UI_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.sidebarPanels?.[panelId] ?? defaultOpen;
    }
  } catch {}
  return defaultOpen;
}

function setPanelState(panelId: string, isOpen: boolean): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(UI_STORAGE_KEY);
    const current = stored ? JSON.parse(stored) : {};
    const updated = {
      ...current,
      sidebarPanels: {
        ...current.sidebarPanels,
        [panelId]: isOpen,
      },
    };
    localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

function getPinnedPanels(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(UI_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.pinnedPanels || [];
    }
  } catch {}
  return [];
}

function setPinnedPanels(pinnedPanels: string[]): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(UI_STORAGE_KEY);
    const current = stored ? JSON.parse(stored) : {};
    const updated = {
      ...current,
      pinnedPanels,
    };
    localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

function getCompactMode(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const stored = localStorage.getItem(UI_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.compactMode || false;
    }
  } catch {}
  return false;
}

function setCompactMode(compact: boolean): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(UI_STORAGE_KEY);
    const current = stored ? JSON.parse(stored) : {};
    const updated = {
      ...current,
      compactMode: compact,
    };
    localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export const Panel: React.FC<PanelProps> = ({
  id,
  title,
  defaultOpen = true,
  children,
  className = "",
  collapsedSummary,
  compactMode = false,
  icon,
  tooltipContent,
  isPinned = false,
  onPinToggle,
}) => {
  // Two-pass rendering: start with defaultOpen, then sync with localStorage after hydration
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isHydrated, setIsHydrated] = useState(false);
  const [pinned, setPinned] = useState(isPinned);

  // After hydration, sync with localStorage
  useEffect(() => {
    setIsHydrated(true);
    const storedValue = getPanelState(id, defaultOpen);
    const pinnedPanels = getPinnedPanels();
    const isPinnedStored = pinnedPanels.includes(id);

    setIsOpen(storedValue);
    setPinned(isPinnedStored);
  }, [id, defaultOpen]);

  // Handle panel toggle
  const toggleOpen = useCallback(() => {
    if (pinned) return; // Don't allow collapsing pinned panels

    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (isHydrated) {
      setPanelState(id, newIsOpen);
    }
  }, [id, isOpen, isHydrated, pinned]);

  // Handle pin toggle
  const handlePinToggle = useCallback(() => {
    const newPinned = !pinned;
    setPinned(newPinned);

    if (isHydrated) {
      const currentPinned = getPinnedPanels();
      const updatedPinned = newPinned
        ? [...currentPinned, id]
        : currentPinned.filter((panelId) => panelId !== id);

      setPinnedPanels(updatedPinned);

      // If pinning, ensure panel is open
      if (newPinned && !isOpen) {
        setIsOpen(true);
        setPanelState(id, true);
      }

      onPinToggle?.(id, newPinned);
    }
  }, [id, pinned, isHydrated, isOpen, onPinToggle]);

  // Listen for external storage changes (from other tabs or panel controls)
  useEffect(() => {
    if (!isHydrated) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === UI_STORAGE_KEY && event.newValue) {
        try {
          const newState = JSON.parse(event.newValue);
          if (newState.sidebarPanels?.[id] !== undefined) {
            setIsOpen(newState.sidebarPanels[id]);
          }
          if (newState.pinnedPanels) {
            setPinned(newState.pinnedPanels.includes(id));
          }
        } catch {}
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [id, isHydrated]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleOpen();
    }
  };

  // Dynamic styling based on state
  const titleClasses = compactMode
    ? UI_CONSTANTS.TYPOGRAPHY.PANEL_TITLE.COLLAPSED
    : UI_CONSTANTS.TYPOGRAPHY.PANEL_TITLE.EXPANDED;

  const summaryClasses = compactMode
    ? UI_CONSTANTS.TYPOGRAPHY.COMPACT_SUMMARY
    : isOpen
      ? UI_CONSTANTS.TYPOGRAPHY.SUMMARY.EXPANDED
      : UI_CONSTANTS.TYPOGRAPHY.SUMMARY.COLLAPSED;

  const chevronClasses = compactMode
    ? UI_CONSTANTS.ICONS.CHEVRON.COLLAPSED
    : UI_CONSTANTS.ICONS.CHEVRON.EXPANDED;

  const iconClasses = compactMode
    ? UI_CONSTANTS.ICONS.PANEL.COLLAPSED
    : UI_CONSTANTS.ICONS.PANEL.EXPANDED;

  const cardPadding = isOpen
    ? UI_CONSTANTS.SPACING.PANEL_PADDING.EXPANDED
    : UI_CONSTANTS.SPACING.PANEL_PADDING.COLLAPSED;

  // Generate tooltip content if not provided
  const defaultTooltipContent =
    tooltipContent ||
    `${title}${
      collapsedSummary
        ? ` – ${
            typeof collapsedSummary === "string" ? collapsedSummary : "Active"
          }`
        : ""
    }`;

  const headerContent = (
    <div
      className={`flex items-center justify-between cursor-pointer select-none rounded-lg ${
        UI_CONSTANTS.COLORS.HOVER
      } ${pinned ? "ring-1 ring-blue-200 bg-blue-50" : ""}`}
      onClick={toggleOpen}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-expanded={isOpen}
      aria-controls={`panel-${id}-content`}
      aria-label={`Toggle ${title} panel`}
      style={{
        padding: UI_CONSTANTS.SPACING.CARD_HEADER_PADDING,
        transition: `all ${UI_CONSTANTS.ANIMATION.HOVER_TRANSITION}ms ease-in-out`,
      }}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`text-gray-600 flex-shrink-0 ${iconClasses}`}>
            {icon}
          </div>
        )}
        <div className={`${titleClasses} text-gray-800`}>{title}</div>
        {pinned && (
          <div
            className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"
            title="Pinned"
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Pin toggle button */}
        {onPinToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePinToggle();
            }}
            className={`p-1.5 rounded-md hover:bg-gray-200 ${
              ANIMATION_CLASSES.HOVER_TRANSITION
            } ${
              pinned ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            }`}
            title={pinned ? "Unpin panel" : "Pin panel open"}
            aria-label={pinned ? "Unpin panel" : "Pin panel open"}
          >
            <div className="w-3 h-3">📌</div>
          </button>
        )}

        {/* Chevron with smooth rotation */}
        <div
          className={`${ANIMATION_CLASSES.CHEVRON_TRANSITION} text-gray-500`}
          style={{
            transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        >
          {isOpen ? (
            <ChevronUp className={chevronClasses} />
          ) : (
            <ChevronDown className={chevronClasses} />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card
      className={`${className} ${UI_CONSTANTS.GAMIFICATION.CARD_BACKGROUND} ${UI_CONSTANTS.GAMIFICATION.CARD_BORDER} ${UI_CONSTANTS.GAMIFICATION.CARD_SHADOW}`}
      style={{
        padding: "0", // Remove default padding, let header and content control their own
        marginBottom: UI_CONSTANTS.SPACING.PANEL_GAP,
      }}
    >
      {/* Header with optional tooltip */}
      {!isOpen && tooltipContent ? (
        <Tooltip content={defaultTooltipContent} position="right">
          {headerContent}
        </Tooltip>
      ) : (
        headerContent
      )}

      {/* Collapsed Summary */}
      {!isOpen && collapsedSummary && (
        <div
          className={`px-3 pb-3 text-gray-600 overflow-hidden ${summaryClasses}`}
          style={{
            maxHeight: UI_CONSTANTS.SPACING.COLLAPSED_SUMMARY_HEIGHT,
          }}
        >
          {collapsedSummary}
        </div>
      )}

      {/* Full Content with smooth animation */}
      <div
        id={`panel-${id}-content`}
        className="overflow-hidden"
        style={{
          maxHeight: isOpen ? "2000px" : "0px", // Increased max height for larger content
          opacity: isOpen ? 1 : 0,
          paddingLeft: isOpen ? cardPadding : "0",
          paddingRight: isOpen ? cardPadding : "0",
          paddingBottom: isOpen ? cardPadding : "0",
          paddingTop: isOpen ? "0.75rem" : "0", // Top padding for content separation
          transition: `all ${UI_CONSTANTS.ANIMATION.PANEL_TRANSITION}ms ease-in-out`,
        }}
      >
        {children}
      </div>
    </Card>
  );
};

// Enhanced utility functions for panel management
export const usePanelControls = () => {
  // Two-pass rendering: start with default, then sync with localStorage after hydration
  const [compactModeState, setCompactModeState] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [pinnedPanels, setPinnedPanelsState] = useState<string[]>([]);

  // After hydration, sync with localStorage
  useEffect(() => {
    setIsHydrated(true);
    const storedCompactMode = getCompactMode();
    const storedPinnedPanels = getPinnedPanels();
    setCompactModeState(storedCompactMode);
    setPinnedPanelsState(storedPinnedPanels);
  }, []);

  // Listen for storage changes to update state
  useEffect(() => {
    if (!isHydrated) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === UI_STORAGE_KEY && event.newValue) {
        try {
          const newState = JSON.parse(event.newValue);
          setCompactModeState(newState.compactMode || false);
          setPinnedPanelsState(newState.pinnedPanels || []);
        } catch {}
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [isHydrated]);

  const collapseAll = useCallback(() => {
    if (!isHydrated) return;

    try {
      const stored = localStorage.getItem(UI_STORAGE_KEY);
      const current = stored ? JSON.parse(stored) : {};
      const currentPinned = current.pinnedPanels || [];

      // Only collapse non-pinned panels
      const updated = {
        ...current,
        sidebarPanels: Object.keys(current.sidebarPanels || {}).reduce(
          (acc, key) => ({
            ...acc,
            [key]: currentPinned.includes(key) ? true : false, // Keep pinned panels open
          }),
          {}
        ),
      };
      localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(updated));

      // Dispatch storage event to notify all panels
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: UI_STORAGE_KEY,
          newValue: JSON.stringify(updated),
        })
      );
    } catch {}
  }, [isHydrated]);

  const expandAll = useCallback(() => {
    if (!isHydrated) return;

    try {
      const stored = localStorage.getItem(UI_STORAGE_KEY);
      const current = stored ? JSON.parse(stored) : {};
      const updated = {
        ...current,
        sidebarPanels: Object.keys(current.sidebarPanels || {}).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        ),
      };
      localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(updated));

      // Dispatch storage event to notify all panels
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: UI_STORAGE_KEY,
          newValue: JSON.stringify(updated),
        })
      );
    } catch {}
  }, [isHydrated]);

  const updateCompactMode = useCallback(
    (compact: boolean) => {
      setCompactModeState(compact);

      if (isHydrated) {
        setCompactMode(compact);

        // Dispatch storage event to notify other components
        try {
          const stored = localStorage.getItem(UI_STORAGE_KEY);
          const current = stored ? JSON.parse(stored) : {};
          const updated = { ...current, compactMode: compact };
          window.dispatchEvent(
            new StorageEvent("storage", {
              key: UI_STORAGE_KEY,
              newValue: JSON.stringify(updated),
            })
          );
        } catch {}
      }
    },
    [isHydrated]
  );

  return {
    collapseAll,
    expandAll,
    setCompactMode: updateCompactMode,
    compactMode: compactModeState,
    pinnedPanels,
  };
};
