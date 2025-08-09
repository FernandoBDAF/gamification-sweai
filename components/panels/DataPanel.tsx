import React, { useState, useEffect } from "react";
import { Download, Upload } from "lucide-react";
import { ProgressState } from "@/lib/gamification";
import { Button, Panel } from "@/components/ui";

interface DataPanelProps {
  progress: ProgressState;
  onImportProgress: (file: File) => void;
  compactMode?: boolean;
}

export const DataPanel: React.FC<DataPanelProps> = ({
  progress,
  onImportProgress,
  compactMode = false,
}) => {
  const [lastAction, setLastAction] = useState<{
    type: "import" | "export";
    timestamp: Date;
  } | null>(null);

  // Load last action from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ai-learning-graph-data-actions");
      if (stored) {
        const parsed = JSON.parse(stored);
        setLastAction({
          ...parsed,
          timestamp: new Date(parsed.timestamp),
        });
      }
    } catch {}
  }, []);

  const saveLastAction = (type: "import" | "export") => {
    const action = { type, timestamp: new Date() };
    setLastAction(action);
    localStorage.setItem(
      "ai-learning-graph-data-actions",
      JSON.stringify(action)
    );
  };

  const exportProgress = () => {
    const data = JSON.stringify(progress, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-learning-progress-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
    saveLastAction("export");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportProgress(file);
      event.target.value = ""; // Reset input
      saveLastAction("import");
    }
  };

  // Format timestamp for display
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Collapsed summary
  const collapsedSummary = (
    <div className="flex items-center justify-between">
      <span>
        {lastAction
          ? `Last ${lastAction.type}: ${formatTimestamp(lastAction.timestamp)}`
          : "No recent activity"}
      </span>
      {lastAction && (
        <span className="text-xs">
          {lastAction.type === "export" ? "📤" : "📥"}
        </span>
      )}
    </div>
  );

  return (
    <Panel
      id="data"
      title="Data"
      defaultOpen={false}
      collapsedSummary={collapsedSummary}
      compactMode={compactMode}
    >
      <div className="space-y-2">
        <Button onClick={exportProgress} className="w-full">
          <Download className={`mr-2 ${compactMode ? "w-3 h-3" : "w-4 h-4"}`} />
          Export Progress
        </Button>
        <div>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            id="import-file"
          />
          <Button
            onClick={() => document.getElementById("import-file")?.click()}
            className="w-full"
          >
            <Upload className={`mr-2 ${compactMode ? "w-3 h-3" : "w-4 h-4"}`} />
            Import Progress
          </Button>
        </div>
        {lastAction && (
          <div
            className={`text-center text-neutral-500 mt-2 ${
              compactMode ? "text-xs" : "text-sm"
            }`}
          >
            Last {lastAction.type}: {formatTimestamp(lastAction.timestamp)}
          </div>
        )}
      </div>
    </Panel>
  );
};
