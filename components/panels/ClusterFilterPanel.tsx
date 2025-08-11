import React from "react";
import { Badge, Panel } from "@/components/ui";
import { UI_CONSTANTS } from "@/lib/ui-constants";
import { TopicNode } from "@/lib/utils/types";
import { clusterLabels } from "@/lib/ui/tokens";
import { Layers } from "lucide-react";

interface ClusterFilterPanelProps {
  clusterFilter: string;
  setClusterFilter: (cluster: string) => void;
  nodes: TopicNode[];
  compactMode?: boolean;
}

export const ClusterFilterPanel: React.FC<ClusterFilterPanelProps> = ({
  clusterFilter,
  setClusterFilter,
  nodes,
  compactMode = false,
}) => {
  const clusters = Array.from(new Set(nodes.map((n) => n.cluster))).sort();
  const isActive = clusterFilter !== "ALL";

  // Enhanced collapsed summary
  const collapsedSummary = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {isActive ? (
          <Badge
            className={`${UI_CONSTANTS.COLORS.ACTIVE_BADGE} border text-xs px-2 py-0.5 font-medium`}
          >
            {clusterLabels[clusterFilter] || clusterFilter}
          </Badge>
        ) : (
          <Badge
            className={`${UI_CONSTANTS.COLORS.INACTIVE_BADGE} border text-xs px-2 py-0.5`}
          >
            All Clusters
          </Badge>
        )}
      </div>
      <div className="text-xs text-gray-500">{clusters.length} available</div>
    </div>
  );

  const tooltipContent = `Cluster Filter – ${
    isActive
      ? `Showing: ${clusterLabels[clusterFilter] || clusterFilter}`
      : "Showing all clusters"
  }`;

  return (
    <Panel
      id="cluster-filter"
      title="Cluster Filter"
      defaultOpen={true}
      collapsedSummary={collapsedSummary}
      compactMode={compactMode}
      icon={<Layers />}
      tooltipContent={tooltipContent}
    >
      <div>
        <label
          htmlFor="cluster-select"
          className={`block font-medium text-gray-700 mb-2 ${
            compactMode ? "text-xs" : "text-sm"
          }`}
        >
          <div className="flex items-center gap-2">
            <Layers
              className={
                compactMode
                  ? UI_CONSTANTS.ICONS.PANEL.COLLAPSED
                  : UI_CONSTANTS.ICONS.PANEL.EXPANDED
              }
            />
            Select Cluster
            {isActive && (
              <Badge
                className={`${UI_CONSTANTS.COLORS.ACTIVE_BADGE} border text-xs px-1.5 py-0.5`}
              >
                Active
              </Badge>
            )}
          </div>
        </label>

        <select
          id="cluster-select"
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            compactMode ? "text-sm" : "text-base"
          } ${isActive ? "ring-2 ring-blue-200 border-blue-300" : ""}`}
          value={clusterFilter}
          onChange={(e) => setClusterFilter(e.target.value)}
        >
          <option value="ALL">All Clusters</option>
          {clusters.map((cluster) => (
            <option key={cluster} value={cluster}>
              {clusterLabels[cluster] || cluster}
            </option>
          ))}
        </select>

        {isActive && (
          <div
            className={`mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md ${
              compactMode ? "text-xs" : "text-sm"
            }`}
          >
            <div className="font-medium text-blue-800">
              Showing: {clusterLabels[clusterFilter] || clusterFilter}
            </div>
            <div className="text-blue-600 text-xs mt-1">
              Only topics from this cluster will be displayed
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};
