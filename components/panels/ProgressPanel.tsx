import React from "react";
import { ProgressState, getStreakBonusText } from "@/lib/gamification";
import { Card, Badge } from "@/components/ui";

interface ProgressPanelProps {
  progress: ProgressState;
  completionPct: number;
  totalNodes: number;
}

export const ProgressPanel: React.FC<ProgressPanelProps> = ({
  progress,
  completionPct,
  totalNodes,
}) => {
  const streakBonus = getStreakBonusText(progress.streakDays || 0);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="font-semibold">Progress</div>
        <div className="flex items-center gap-2">
          <Badge>Lvl {progress.level}</Badge>
          <Badge
            className={
              progress.streakDays && progress.streakDays >= 3
                ? "bg-orange-100 text-orange-800"
                : ""
            }
          >
            Streak {progress.streakDays || 0}🔥
          </Badge>
        </div>
      </div>
      <div className="progress">
        <span style={{ width: `${completionPct}%` }} />
      </div>
      <div className="text-xs text-neutral-500">
        {Object.values(progress.completed).filter(Boolean).length}/{totalNodes}{" "}
        topics • {progress.xp} XP
      </div>
      {streakBonus && (
        <div className="text-xs text-orange-600 font-medium">
          🎉 {streakBonus}
        </div>
      )}
    </Card>
  );
};
