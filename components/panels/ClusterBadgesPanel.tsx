import React from "react";
import { clusterLabels } from "@/lib/constants";
import { Badge, Panel, Tooltip } from "@/components/ui";
import { UI_CONSTANTS, getMedalInfo } from "@/lib/ui-constants";
import { Award } from "lucide-react";

interface ClusterBadgesPanelProps {
  byClusterCompletion: Record<
    string,
    { total: number; done: number; pct: number }
  >;
  compactMode?: boolean;
}

export const ClusterBadgesPanel: React.FC<ClusterBadgesPanelProps> = ({
  byClusterCompletion,
  compactMode = false,
}) => {
  // Calculate completed clusters (100% completion)
  const completedClusters = Object.values(byClusterCompletion).filter(
    (stats) => stats.pct >= 100
  ).length;

  const totalClusters = Object.keys(byClusterCompletion).length;

  // Count badges earned using the new utility function
  const badgeCounts = Object.values(byClusterCompletion).reduce(
    (acc, stats) => {
      const medalInfo = getMedalInfo(stats.pct);
      if (medalInfo?.label === "Gold") acc.gold++;
      else if (medalInfo?.label === "Silver") acc.silver++;
      else if (medalInfo?.label === "Bronze") acc.bronze++;
      return acc;
    },
    { gold: 0, silver: 0, bronze: 0 }
  );

  const totalBadges =
    badgeCounts.gold + badgeCounts.silver + badgeCounts.bronze;

  // Enhanced collapsed summary with medal emojis
  const collapsedSummary = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Badge
          className={`${UI_CONSTANTS.COLORS.ACTIVE_BADGE} border text-xs px-2 py-1 font-medium`}
        >
          {completedClusters}/{totalClusters}
        </Badge>
        <div className="flex items-center gap-2">
          {badgeCounts.gold > 0 && (
            <Tooltip content="Gold medals - Complete mastery (100%)">
              <span
                className={`${UI_CONSTANTS.ICONS.MEDAL.SIZE} flex items-center gap-0.5`}
              >
                🏆<span className="text-xs font-bold">{badgeCounts.gold}</span>
              </span>
            </Tooltip>
          )}
          {badgeCounts.silver > 0 && (
            <Tooltip content="Silver medals - Advanced progress (80%+)">
              <span
                className={`${UI_CONSTANTS.ICONS.MEDAL.SIZE} flex items-center gap-0.5`}
              >
                🥈
                <span className="text-xs font-bold">{badgeCounts.silver}</span>
              </span>
            </Tooltip>
          )}
          {badgeCounts.bronze > 0 && (
            <Tooltip content="Bronze medals - Good progress (50%+)">
              <span
                className={`${UI_CONSTANTS.ICONS.MEDAL.SIZE} flex items-center gap-0.5`}
              >
                🥉
                <span className="text-xs font-bold">{badgeCounts.bronze}</span>
              </span>
            </Tooltip>
          )}
        </div>
      </div>
      <div className="text-xs text-gray-500 font-medium">
        {totalBadges} earned
      </div>
    </div>
  );

  const tooltipContent = `Cluster Badges – ${completedClusters}/${totalClusters} clusters completed • ${totalBadges} medals earned (🏆${badgeCounts.gold} 🥈${badgeCounts.silver} 🥉${badgeCounts.bronze})`;

  // Sort clusters by medal priority and completion percentage
  const sortedClusters = Object.entries(byClusterCompletion)
    .map(([cluster, stats]) => ({
      cluster,
      stats,
      medalInfo: getMedalInfo(stats.pct),
    }))
    .sort((a, b) => {
      // First sort by medal priority (gold > silver > bronze > none)
      const aPriority = a.medalInfo
        ? a.medalInfo.label === "Gold"
          ? 3
          : a.medalInfo.label === "Silver"
            ? 2
            : 1
        : 0;
      const bPriority = b.medalInfo
        ? b.medalInfo.label === "Gold"
          ? 3
          : b.medalInfo.label === "Silver"
            ? 2
            : 1
        : 0;

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      // Then by completion percentage
      return b.stats.pct - a.stats.pct;
    });

  return (
    <Panel
      id="cluster-badges"
      title="Cluster Badges"
      defaultOpen={true}
      collapsedSummary={collapsedSummary}
      compactMode={compactMode}
      icon={<Award />}
      tooltipContent={tooltipContent}
    >
      {/* Medal Achievement Summary */}
      <div
        className={`mb-4 p-4 ${
          UI_CONSTANTS.GAMIFICATION.CARD_BACKGROUND
        } border border-yellow-200 rounded-lg ${
          compactMode ? "text-xs" : "text-sm"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold text-gray-800 flex items-center gap-2">
            <Award className={compactMode ? "w-4 h-4" : "w-5 h-5"} />
            <span>Achievement Progress</span>
          </div>
          <Badge
            className={`${UI_CONSTANTS.COLORS.WARNING_BADGE} border text-xs px-2 py-1 font-medium`}
          >
            {totalBadges} medals
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Tooltip content={getMedalInfo(100)?.description || ""}>
            <div
              className={`text-center p-2 rounded-lg ${UI_CONSTANTS.COLORS.MEDAL.GOLD} border transition-all hover:shadow-sm`}
            >
              <div className={`${UI_CONSTANTS.ICONS.MEDAL.SIZE} mb-1`}>🏆</div>
              <div className="font-bold text-lg">{badgeCounts.gold}</div>
              <div
                className={`${compactMode ? "text-xs" : "text-sm"} font-medium`}
              >
                Gold
              </div>
            </div>
          </Tooltip>

          <Tooltip content={getMedalInfo(80)?.description || ""}>
            <div
              className={`text-center p-2 rounded-lg ${UI_CONSTANTS.COLORS.MEDAL.SILVER} border transition-all hover:shadow-sm`}
            >
              <div className={`${UI_CONSTANTS.ICONS.MEDAL.SIZE} mb-1`}>🥈</div>
              <div className="font-bold text-lg">{badgeCounts.silver}</div>
              <div
                className={`${compactMode ? "text-xs" : "text-sm"} font-medium`}
              >
                Silver
              </div>
            </div>
          </Tooltip>

          <Tooltip content={getMedalInfo(50)?.description || ""}>
            <div
              className={`text-center p-2 rounded-lg ${UI_CONSTANTS.COLORS.MEDAL.BRONZE} border transition-all hover:shadow-sm`}
            >
              <div className={`${UI_CONSTANTS.ICONS.MEDAL.SIZE} mb-1`}>🥉</div>
              <div className="font-bold text-lg">{badgeCounts.bronze}</div>
              <div
                className={`${compactMode ? "text-xs" : "text-sm"} font-medium`}
              >
                Bronze
              </div>
            </div>
          </Tooltip>
        </div>

        <div
          className={`text-center mt-3 ${UI_CONSTANTS.TYPOGRAPHY.MICROCOPY}`}
        >
          {completedClusters}/{totalClusters} clusters completed
        </div>
      </div>

      {/* Divider */}
      <div className={UI_CONSTANTS.GAMIFICATION.DIVIDER} />

      {/* Individual Cluster Progress */}
      <div className="space-y-3">
        <div
          className={`font-medium text-gray-700 ${
            compactMode ? "text-xs" : "text-sm"
          } flex items-center gap-2 mb-3`}
        >
          <span>📊</span>
          <span>Cluster Progress</span>
        </div>

        {sortedClusters.map(({ cluster, stats, medalInfo }) => (
          <div
            key={cluster}
            className={`border rounded-lg p-3 ${
              medalInfo
                ? `${medalInfo.color} border-opacity-60`
                : "bg-gray-50 border-gray-200"
            } transition-all hover:shadow-sm ${
              UI_CONSTANTS.GAMIFICATION.CARD_SHADOW
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h3
                  className={`font-medium ${
                    compactMode ? "text-sm" : "text-base"
                  }`}
                >
                  {clusterLabels[cluster] || cluster}
                </h3>
                {medalInfo && (
                  <Tooltip content={medalInfo.description}>
                    <div className="flex items-center gap-1.5">
                      <span className={UI_CONSTANTS.ICONS.MEDAL.SIZE}>
                        {medalInfo.emoji}
                      </span>
                      <Badge
                        className={`text-xs px-2 py-0.5 font-medium ${medalInfo.color} border`}
                      >
                        {medalInfo.label}
                      </Badge>
                    </div>
                  </Tooltip>
                )}
              </div>
              <div
                className={`font-bold ${
                  compactMode ? "text-sm" : "text-base"
                } ${
                  stats.pct >= 100
                    ? "text-yellow-600"
                    : stats.pct >= 80
                      ? "text-gray-600"
                      : stats.pct >= 50
                        ? "text-amber-600"
                        : "text-gray-500"
                }`}
              >
                {stats.pct}%
              </div>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="mb-2">
              <div
                className={`w-full bg-white bg-opacity-70 rounded-full ${UI_CONSTANTS.GAMIFICATION.PROGRESS_BAR_HEIGHT} shadow-inner`}
              >
                <div
                  className={`${
                    UI_CONSTANTS.GAMIFICATION.PROGRESS_BAR_HEIGHT
                  } rounded-full transition-all duration-700 ease-out ${
                    stats.pct >= 100
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                      : stats.pct >= 80
                        ? "bg-gradient-to-r from-gray-400 to-gray-600"
                        : stats.pct >= 50
                          ? "bg-gradient-to-r from-amber-400 to-amber-600"
                          : "bg-gray-300"
                  }`}
                  style={{ width: `${stats.pct}%` }}
                />
              </div>
            </div>

            {/* Progress Details */}
            <div
              className={`flex justify-between ${
                compactMode ? "text-xs" : "text-sm"
              } opacity-80`}
            >
              <span>{stats.done} completed</span>
              <span>{stats.total - stats.done} remaining</span>
            </div>

            {/* Next milestone hint */}
            {stats.pct < 100 && (
              <div
                className={`mt-2 ${UI_CONSTANTS.TYPOGRAPHY.MICROCOPY} text-center`}
              >
                {stats.pct < 50
                  ? `${50 - stats.pct}% to Bronze 🥉`
                  : stats.pct < 80
                    ? `${80 - stats.pct}% to Silver 🥈`
                    : `${100 - stats.pct}% to Gold 🏆`}
              </div>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
};
