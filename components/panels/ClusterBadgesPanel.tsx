import React from "react";
import { clusterLabels } from "@/lib/constants";
import { Card } from "@/components/ui";

interface ClusterBadgesPanelProps {
  byClusterCompletion: Record<
    string,
    { total: number; done: number; pct: number }
  >;
}

const getBadgeInfo = (pct: number) => {
  if (pct >= 100)
    return {
      badge: "🏆",
      label: "Gold",
      color: "text-yellow-600 bg-yellow-50",
    };
  if (pct >= 80)
    return { badge: "🥈", label: "Silver", color: "text-gray-600 bg-gray-50" };
  if (pct >= 50)
    return {
      badge: "🥉",
      label: "Bronze",
      color: "text-amber-600 bg-amber-50",
    };
  return { badge: "", label: "", color: "" };
};

export const ClusterBadgesPanel: React.FC<ClusterBadgesPanelProps> = ({
  byClusterCompletion,
}) => {
  return (
    <Card>
      <div className="font-semibold">Cluster Badges</div>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(byClusterCompletion).map(([cluster, stats]) => {
          const badgeInfo = getBadgeInfo(stats.pct);

          return (
            <div
              key={cluster}
              className="border rounded-xl p-2 text-xs relative"
            >
              <div className="font-medium">
                {clusterLabels[cluster] || cluster}
              </div>
              <div className="text-neutral-500">
                {stats.done}/{stats.total} • {stats.pct}%
              </div>

              {/* Progress bar */}
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${stats.pct}%` }}
                ></div>
              </div>

              {/* Badge display */}
              {badgeInfo.badge && (
                <div
                  className={`mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${badgeInfo.color}`}
                >
                  <span>{badgeInfo.badge}</span>
                  <span>{badgeInfo.label}</span>
                </div>
              )}

              {/* Next badge progress */}
              {stats.pct < 100 && (
                <div className="mt-1 text-xs text-neutral-400">
                  {stats.pct < 50 && `${50 - stats.pct}% to Bronze 🥉`}
                  {stats.pct >= 50 &&
                    stats.pct < 80 &&
                    `${80 - stats.pct}% to Silver 🥈`}
                  {stats.pct >= 80 &&
                    stats.pct < 100 &&
                    `${100 - stats.pct}% to Gold 🏆`}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
