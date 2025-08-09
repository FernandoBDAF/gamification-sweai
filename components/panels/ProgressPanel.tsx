import React from "react";
import { ProgressState, getStreakBonusText } from "@/lib/gamification";
import { Badge, Panel } from "@/components/ui";
import { UI_CONSTANTS, getProgressColor } from "@/lib/ui-constants";
import { TrendingUp } from "lucide-react";

interface ProgressPanelProps {
  progress: ProgressState;
  completionPct: number;
  totalNodes: number;
  compactMode?: boolean;
}

export const ProgressPanel: React.FC<ProgressPanelProps> = ({
  progress,
  completionPct,
  totalNodes,
  compactMode = false,
}) => {
  const streakBonus = getStreakBonusText(progress.streakDays || 0);
  const completedCount = Object.values(progress.completed).filter(
    Boolean
  ).length;

  // Enhanced collapsed summary with aligned XP and percentage
  const collapsedSummary = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Badge
          className={`${UI_CONSTANTS.COLORS.ACTIVE_BADGE} border text-xs px-2 py-1 font-medium`}
        >
          {completedCount}/{totalNodes}
        </Badge>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-bold ${getProgressColor(completionPct)}`}
          >
            {progress.xp || 0} XP
          </span>
          <span className="text-gray-400">•</span>
          <span
            className={`text-sm font-bold ${getProgressColor(completionPct)}`}
          >
            {completionPct}%
          </span>
        </div>
      </div>
    </div>
  );

  const tooltipContent = `Progress – ${completedCount}/${totalNodes} topics completed (${completionPct}%) • ${
    progress.xp || 0
  } XP • Level ${progress.level} • ${progress.streakDays || 0} day streak`;

  return (
    <Panel
      id="progress"
      title="Progress"
      defaultOpen={true}
      collapsedSummary={collapsedSummary}
      compactMode={compactMode}
      icon={<TrendingUp />}
      tooltipContent={tooltipContent}
    >
      {/* Level and Streak Badges */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge
            className={`${UI_CONSTANTS.COLORS.SUCCESS_BADGE} border font-medium`}
          >
            Level {progress.level}
          </Badge>
          <Badge
            className={
              progress.streakDays && progress.streakDays >= 3
                ? `${UI_CONSTANTS.COLORS.WARNING_BADGE} border font-medium`
                : `${UI_CONSTANTS.COLORS.INACTIVE_BADGE} border`
            }
          >
            {progress.streakDays || 0}🔥
          </Badge>
        </div>

        {/* Aligned XP and Percentage Display */}
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`font-bold ${getProgressColor(completionPct)} ${
                compactMode ? "text-base" : "text-lg"
              }`}
            >
              {progress.xp || 0} XP
            </span>
            <span className="text-gray-400">•</span>
            <span
              className={`font-bold ${getProgressColor(completionPct)} ${
                compactMode ? "text-base" : "text-lg"
              }`}
            >
              {completionPct}%
            </span>
          </div>
          <div
            className={`text-gray-500 text-right ${
              compactMode ? "text-xs" : "text-sm"
            }`}
          >
            Experience • Completion
          </div>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span
            className={`font-medium text-gray-700 ${
              compactMode ? "text-xs" : "text-sm"
            }`}
          >
            Learning Progress
          </span>
          <span
            className={`text-gray-600 ${compactMode ? "text-xs" : "text-sm"}`}
          >
            {completedCount} of {totalNodes} topics
          </span>
        </div>

        {/* Thicker progress bar with better styling */}
        <div
          className={`w-full bg-gray-200 rounded-full ${UI_CONSTANTS.GAMIFICATION.PROGRESS_BAR_HEIGHT} shadow-inner`}
        >
          <div
            className={`${
              UI_CONSTANTS.GAMIFICATION.PROGRESS_BAR_HEIGHT
            } rounded-full transition-all duration-700 ease-out ${
              completionPct === 100
                ? "bg-gradient-to-r from-yellow-400 to-yellow-600" // Gold for 100%
                : completionPct > 0
                  ? "bg-gradient-to-r from-green-400 to-green-600" // Green for progress
                  : "bg-gray-300" // Gray for no progress
            }`}
            style={{ width: `${completionPct}%` }}
          />
        </div>

        <div
          className={`text-gray-500 mt-2 flex justify-between ${
            compactMode ? "text-xs" : "text-sm"
          }`}
        >
          <span>{completedCount} completed</span>
          <span>{totalNodes - completedCount} remaining</span>
        </div>
      </div>

      {/* Divider */}
      <div className={UI_CONSTANTS.GAMIFICATION.DIVIDER} />

      {/* Streak Bonus Info */}
      {streakBonus && (
        <div
          className={`${
            UI_CONSTANTS.COLORS.WARNING_BADGE
          } border px-3 py-2 rounded-lg ${
            compactMode ? "text-xs" : "text-sm"
          } font-medium`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <span>{streakBonus}</span>
          </div>
        </div>
      )}

      {/* Achievement Hint */}
      {completionPct < 100 && (
        <div
          className={`mt-3 p-3 ${
            UI_CONSTANTS.GAMIFICATION.CARD_BACKGROUND
          } border border-gray-200 rounded-lg ${
            compactMode ? "text-xs" : "text-sm"
          }`}
        >
          <div className="flex items-center gap-2 text-gray-600">
            <span>🏆</span>
            <span>
              {completionPct >= 80
                ? `${100 - completionPct}% to complete mastery!`
                : completionPct >= 50
                  ? `${80 - completionPct}% to advanced progress!`
                  : `${50 - completionPct}% to good progress milestone!`}
            </span>
          </div>
        </div>
      )}
    </Panel>
  );
};
