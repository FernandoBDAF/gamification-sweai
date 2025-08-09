import React from "react";
import { Download, Upload } from "lucide-react";
import { ProgressState } from "@/lib/gamification";
import { Card, Button } from "@/components/ui";

interface DataPanelProps {
  progress: ProgressState;
  onImportProgress: (file: File) => void;
}

export const DataPanel: React.FC<DataPanelProps> = ({
  progress,
  onImportProgress,
}) => {
  const exportProgress = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-learning-graph-progress.json";
    a.click();
  };

  return (
    <Card>
      <div className="font-semibold">Progress Data</div>
      <div className="flex gap-2">
        <Button onClick={exportProgress}>
          <Download className="w-4 h-4 mr-1" /> Export
        </Button>
        <label className="btn btn-outline cursor-pointer">
          <Upload className="w-4 h-4 mr-1" /> Import
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) =>
              e.target.files && onImportProgress(e.target.files[0])
            }
          />
        </label>
      </div>
    </Card>
  );
}; 