import React from "react";
import { Eye, Grid, Table, Minimize2, Maximize2 } from "lucide-react";
import { ViewMode } from "@/lib/types";
import { Button, Panel, usePanelControls } from "@/components/ui";

interface ViewPanelProps {
  view: ViewMode;
  setView: (view: ViewMode) => void;
  compact: boolean;
  setCompact: (compact: boolean) => void;
  compactMode?: boolean;
}

export const ViewPanel: React.FC<ViewPanelProps> = ({
  view,
  setView,
  compact,
  setCompact,
  compactMode = false,
}) => {
  const {
    collapseAll,
    expandAll,
    setCompactMode,
    compactMode: globalCompactMode,
  } = usePanelControls();

  // View mode labels
  const viewLabels = {
    tree: "Tech Tree",
    cluster: "Cluster",
    matrix: "Matrix",
  };

  // View mode icons
  const ViewIcon = view === "tree" ? Eye : view === "cluster" ? Grid : Table;

  // Collapsed summary
  const collapsedSummary = (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2">
        <ViewIcon className={compactMode ? "w-3 h-3" : "w-4 h-4"} />
        {viewLabels[view]} {compact && "(Compact)"}
      </span>
      {globalCompactMode && (
        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
          Compact
        </span>
      )}
    </div>
  );

  return (
    <Panel
      id="view"
      title="View"
      defaultOpen={true}
      collapsedSummary={collapsedSummary}
      compactMode={compactMode}
    >
      <div className="space-y-4">
        {/* View Mode Selection */}
        <div>
          <label
            className={`block font-medium mb-2 ${
              compactMode ? "text-xs" : "text-sm"
            }`}
          >
            View Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              className={`btn px-2 py-2 ${
                view === "tree" ? "btn-primary" : "btn-outline"
              } ${compactMode ? "text-xs" : "text-xs"}`}
              onClick={() => setView("tree")}
            >
              <Eye className={`mr-1 ${compactMode ? "w-3 h-3" : "w-3 h-3"}`} />
              Tech Tree
            </button>
            <button
              className={`btn px-2 py-2 ${
                view === "cluster" ? "btn-primary" : "btn-outline"
              } ${compactMode ? "text-xs" : "text-xs"}`}
              onClick={() => setView("cluster")}
            >
              <Grid className={`mr-1 ${compactMode ? "w-3 h-3" : "w-3 h-3"}`} />
              Cluster
            </button>
            <button
              className={`btn px-2 py-2 ${
                view === "matrix" ? "btn-primary" : "btn-outline"
              } ${compactMode ? "text-xs" : "text-xs"}`}
              onClick={() => setView("matrix")}
            >
              <Table
                className={`mr-1 ${compactMode ? "w-3 h-3" : "w-3 h-3"}`}
              />
              Matrix
            </button>
          </div>
        </div>

        {/* Graph Compact Mode Toggle */}
        <div>
          <label
            className={`flex items-center gap-2 ${
              compactMode ? "text-xs" : "text-sm"
            }`}
          >
            <input
              type="checkbox"
              checked={compact}
              onChange={(e) => setCompact(e.target.checked)}
              className="rounded"
            />
            Graph compact mode
          </label>
        </div>

        {/* Global Compact Mode Toggle */}
        <div>
          <label
            className={`flex items-center gap-2 ${
              compactMode ? "text-xs" : "text-sm"
            }`}
          >
            <input
              type="checkbox"
              checked={globalCompactMode}
              onChange={(e) => setCompactMode(e.target.checked)}
              className="rounded"
            />
            UI compact mode
          </label>
        </div>

        {/* Panel Controls */}
        <div>
          <label
            className={`block font-medium mb-2 ${
              compactMode ? "text-xs" : "text-sm"
            }`}
          >
            Panel Controls
          </label>
          <div className="flex gap-2">
            <Button
              onClick={collapseAll}
              className={`flex-1 py-2 ${compactMode ? "text-xs" : "text-xs"}`}
            >
              <Minimize2
                className={`mr-1 ${compactMode ? "w-3 h-3" : "w-3 h-3"}`}
              />
              Collapse All
            </Button>
            <Button
              onClick={expandAll}
              className={`flex-1 py-2 ${compactMode ? "text-xs" : "text-xs"}`}
            >
              <Maximize2
                className={`mr-1 ${compactMode ? "w-3 h-3" : "w-3 h-3"}`}
              />
              Expand All
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  );
};
