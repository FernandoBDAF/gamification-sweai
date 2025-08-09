import React from "react";
import { Badge, Panel } from "@/components/ui";
import { UI_CONSTANTS } from "@/lib/ui-constants";
import { Search, Filter } from "lucide-react";

interface FilterPanelProps {
  search: string;
  setSearch: (search: string) => void;
  hideCompleted: boolean;
  setHideCompleted: (hide: boolean) => void;
  showOnlyUnlockable: boolean;
  setShowOnlyUnlockable: (show: boolean) => void;
  compactMode?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  search,
  setSearch,
  hideCompleted,
  setHideCompleted,
  showOnlyUnlockable,
  setShowOnlyUnlockable,
  compactMode = false,
}) => {
  // Count active filters
  const activeFiltersCount = [
    search.trim().length > 0,
    hideCompleted,
    showOnlyUnlockable,
  ].filter(Boolean).length;

  // Enhanced collapsed summary with active filter count
  const collapsedSummary = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {activeFiltersCount > 0 ? (
          <Badge
            className={`${UI_CONSTANTS.COLORS.ACTIVE_BADGE} border text-xs px-2 py-1 font-medium`}
          >
            {activeFiltersCount} active
          </Badge>
        ) : (
          <Badge
            className={`${UI_CONSTANTS.COLORS.INACTIVE_BADGE} border text-xs px-2 py-1`}
          >
            No filters
          </Badge>
        )}
        {search.trim() && (
          <span className="text-xs text-gray-600 truncate max-w-24 font-medium">
            "{search.trim()}"
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {hideCompleted && <span className="text-xs">👁️</span>}
        {showOnlyUnlockable && <span className="text-xs">🔓</span>}
      </div>
    </div>
  );

  const tooltipContent = `Filters – ${activeFiltersCount} active${
    search.trim() ? ` • Search: "${search.trim()}"` : ""
  }${hideCompleted ? " • Hide completed" : ""}${
    showOnlyUnlockable ? " • Show unlockable only" : ""
  }`;

  return (
    <Panel
      id="filters"
      title="Filters"
      defaultOpen={true}
      collapsedSummary={collapsedSummary}
      compactMode={compactMode}
      icon={<Filter />}
      tooltipContent={tooltipContent}
    >
      {/* Search Section */}
      <div className="mb-4">
        <label
          htmlFor="search-input"
          className={`block font-medium text-gray-700 mb-2 ${
            compactMode ? "text-xs" : "text-sm"
          }`}
        >
          <div className="flex items-center gap-2">
            <Search
              className={
                compactMode
                  ? UI_CONSTANTS.ICONS.PANEL.COLLAPSED
                  : UI_CONSTANTS.ICONS.PANEL.EXPANDED
              }
            />
            Search Topics
            {search.trim() && (
              <Badge
                className={`${UI_CONSTANTS.COLORS.ACTIVE_BADGE} border text-xs px-1.5 py-0.5`}
              >
                Active
              </Badge>
            )}
          </div>
        </label>

        <input
          id="search-input"
          type="text"
          placeholder="Type to search topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            compactMode ? "text-sm" : "text-base"
          } ${
            search.trim()
              ? "ring-2 ring-blue-200 border-blue-300 bg-blue-50"
              : "bg-white"
          }`}
        />

        {search.trim() && (
          <div
            className={`mt-2 text-gray-500 ${
              compactMode ? "text-xs" : "text-sm"
            }`}
          >
            Searching for:{" "}
            <span className="font-medium text-gray-700">"{search.trim()}"</span>
          </div>
        )}

        <div className={`${UI_CONSTANTS.TYPOGRAPHY.MICROCOPY} mt-1`}>
          Find topics by name or keyword
        </div>
      </div>

      {/* Divider */}
      <div className={UI_CONSTANTS.GAMIFICATION.DIVIDER} />

      {/* Visibility Controls Section */}
      <div className="space-y-4">
        <div
          className={`font-medium text-gray-700 ${
            compactMode ? "text-xs" : "text-sm"
          } flex items-center gap-2`}
        >
          <span>👁️</span>
          <span>Visibility Controls</span>
        </div>

        <div className="space-y-3 ml-1">
          <div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={hideCompleted}
                  onChange={(e) => setHideCompleted(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    hideCompleted
                      ? "bg-blue-500 border-blue-500 shadow-sm"
                      : "border-gray-300 group-hover:border-gray-400 bg-white"
                  }`}
                >
                  {hideCompleted && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div
                  className={`font-medium text-gray-700 ${
                    compactMode ? "text-xs" : "text-sm"
                  } flex items-center gap-2`}
                >
                  Hide Completed Topics
                  {hideCompleted && (
                    <Badge
                      className={`${UI_CONSTANTS.COLORS.ACTIVE_BADGE} border text-xs px-1.5 py-0.5`}
                    >
                      Active
                    </Badge>
                  )}
                </div>
                <div className={`${UI_CONSTANTS.TYPOGRAPHY.MICROCOPY} mt-1`}>
                  Focus on remaining topics to learn
                </div>
              </div>
            </label>
          </div>

          <div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={showOnlyUnlockable}
                  onChange={(e) => setShowOnlyUnlockable(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    showOnlyUnlockable
                      ? "bg-green-500 border-green-500 shadow-sm"
                      : "border-gray-300 group-hover:border-gray-400 bg-white"
                  }`}
                >
                  {showOnlyUnlockable && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div
                  className={`font-medium text-gray-700 ${
                    compactMode ? "text-xs" : "text-sm"
                  } flex items-center gap-2`}
                >
                  Show Only Unlockable
                  {showOnlyUnlockable && (
                    <Badge
                      className={`${UI_CONSTANTS.COLORS.SUCCESS_BADGE} border text-xs px-1.5 py-0.5`}
                    >
                      Active
                    </Badge>
                  )}
                </div>
                <div className={`${UI_CONSTANTS.TYPOGRAPHY.MICROCOPY} mt-1`}>
                  Show topics you can start now
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <>
          <div className={UI_CONSTANTS.GAMIFICATION.DIVIDER} />
          <div
            className={`p-3 ${
              UI_CONSTANTS.COLORS.ACTIVE_BADGE
            } border rounded-lg ${compactMode ? "text-xs" : "text-sm"}`}
          >
            <div className="font-medium mb-2 flex items-center gap-2">
              <span>⚡</span>
              <span>
                {activeFiltersCount} Filter{activeFiltersCount !== 1 ? "s" : ""}{" "}
                Applied
              </span>
            </div>
            <div className="space-y-1 text-blue-700">
              {search.trim() && (
                <div className="flex items-center gap-2">
                  <Search className="w-3 h-3" />
                  <span>Searching: "{search.trim()}"</span>
                </div>
              )}
              {hideCompleted && (
                <div className="flex items-center gap-2">
                  <span>👁️</span>
                  <span>Hiding completed topics</span>
                </div>
              )}
              {showOnlyUnlockable && (
                <div className="flex items-center gap-2">
                  <span>🔓</span>
                  <span>Showing unlockable only</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Panel>
  );
};
