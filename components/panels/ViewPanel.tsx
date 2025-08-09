import React from "react";
import { Card, Button } from "@/components/ui";

type ViewMode = "tree" | "cluster" | "matrix";

interface ViewPanelProps {
  view: ViewMode;
  setView: (view: ViewMode) => void;
  compact: boolean;
  setCompact: (compact: boolean) => void;
}

export const ViewPanel: React.FC<ViewPanelProps> = ({
  view,
  setView,
  compact,
  setCompact,
}) => {
  return (
    <Card>
      <div className="font-semibold">View</div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={view === "tree" ? "primary" : "outline"}
          onClick={() => setView("tree")}
        >
          Tech Tree
        </Button>
        <Button
          variant={view === "cluster" ? "primary" : "outline"}
          onClick={() => setView("cluster")}
        >
          Cluster View
        </Button>
        <Button
          variant={view === "matrix" ? "primary" : "outline"}
          onClick={() => setView("matrix")}
        >
          Dependency Table
        </Button>
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className="checkbox"
          checked={compact}
          onChange={(e) => setCompact(e.target.checked)}
        />
        <span className="text-sm">Compact mode</span>
      </label>
    </Card>
  );
}; 