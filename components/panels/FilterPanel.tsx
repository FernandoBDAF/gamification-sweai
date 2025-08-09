import React from "react";
import { Filter, Search } from "lucide-react";
import { TopicNode } from "@/lib/types";
import { clusterLabels } from "@/lib/constants";
import { Card } from "@/components/ui";

interface FilterPanelProps {
  clusterFilter: string;
  setClusterFilter: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;
  hideCompleted: boolean;
  setHideCompleted: (value: boolean) => void;
  showOnlyUnlockable: boolean;
  setShowOnlyUnlockable: (value: boolean) => void;
  goalId: string;
  setGoalId: (value: string) => void;
  nodes: TopicNode[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  clusterFilter,
  setClusterFilter,
  search,
  setSearch,
  hideCompleted,
  setHideCompleted,
  showOnlyUnlockable,
  setShowOnlyUnlockable,
  goalId,
  setGoalId,
  nodes,
}) => {
  return (
    <Card>
      <div className="font-semibold flex items-center gap-2">
        <Filter className="w-4 h-4" /> Filters
      </div>
      <select
        className="select"
        value={clusterFilter}
        onChange={(e) => setClusterFilter(e.target.value)}
      >
        <option value="ALL">All Clusters</option>
        {Object.keys(clusterLabels).map((c) => (
          <option key={c} value={c}>
            {clusterLabels[c]}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4" />
        <input
          className="input"
          placeholder="Search topic…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className="checkbox"
          checked={hideCompleted}
          onChange={(e) => setHideCompleted(e.target.checked)}
        />
        <span className="text-sm">Hide completed</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className="checkbox"
          checked={showOnlyUnlockable}
          onChange={(e) => setShowOnlyUnlockable(e.target.checked)}
        />
        <span className="text-sm">Show only unlockable</span>
      </label>
      <div className="pt-2">
        <div className="text-xs text-neutral-500 mb-2">
          Goal (highlights a path in the tech tree)
        </div>
        <select
          className="select"
          value={goalId}
          onChange={(e) => setGoalId(e.target.value)}
        >
          <option value="">None</option>
          {nodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.label}
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
};
