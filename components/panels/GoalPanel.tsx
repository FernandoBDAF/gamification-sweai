import React from "react";
import { Badge, Panel } from "@/components/ui";
import { UI_CONSTANTS } from "@/lib/ui-constants";
import { TopicNode } from "@/lib/types";
import { Target } from "lucide-react";

interface GoalPanelProps {
  goalId: string;
  setGoalId: (id: string) => void;
  nodes: TopicNode[];
  compactMode?: boolean;
}

export const GoalPanel: React.FC<GoalPanelProps> = ({
  goalId,
  setGoalId,
  nodes,
  compactMode = false,
}) => {
  const isActive = goalId !== "";
  const selectedGoal = nodes.find((node) => node.id === goalId);

  // Enhanced collapsed summary
  const collapsedSummary = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {isActive && selectedGoal ? (
          <Badge
            className={`${UI_CONSTANTS.COLORS.ACTIVE_BADGE} border text-xs px-2 py-0.5 font-medium truncate max-w-32`}
          >
            {selectedGoal.label}
          </Badge>
        ) : (
          <Badge
            className={`${UI_CONSTANTS.COLORS.INACTIVE_BADGE} border text-xs px-2 py-0.5`}
          >
            No Goal
          </Badge>
        )}
      </div>
      <div className="text-xs text-gray-500">{isActive ? "🎯" : "⚪"}</div>
    </div>
  );

  const tooltipContent = `Goal – ${
    isActive && selectedGoal
      ? `Target: ${selectedGoal.label}`
      : "No goal selected"
  }`;

  return (
    <Panel
      id="goal"
      title="Goal"
      defaultOpen={true}
      collapsedSummary={collapsedSummary}
      compactMode={compactMode}
      icon={<Target />}
      tooltipContent={tooltipContent}
    >
      <div>
        <label
          htmlFor="goal-select"
          className={`block font-medium text-gray-700 mb-2 ${
            compactMode ? "text-xs" : "text-sm"
          }`}
        >
          <div className="flex items-center gap-2">
            <Target
              className={
                compactMode
                  ? UI_CONSTANTS.ICONS.PANEL.COLLAPSED
                  : UI_CONSTANTS.ICONS.PANEL.EXPANDED
              }
            />
            Select Goal
            {isActive && (
              <Badge
                className={`${UI_CONSTANTS.COLORS.ACTIVE_BADGE} border text-xs px-1.5 py-0.5`}
              >
                Active
              </Badge>
            )}
          </div>
        </label>

        <div
          className={`text-gray-600 mb-3 ${
            compactMode ? "text-xs" : "text-sm"
          }`}
        >
          Highlights a path in the tech tree to help you focus on your learning
          goal
        </div>

        <select
          id="goal-select"
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            compactMode ? "text-sm" : "text-base"
          } ${isActive ? "ring-2 ring-yellow-200 border-yellow-300" : ""}`}
          value={goalId}
          onChange={(e) => setGoalId(e.target.value)}
        >
          <option value="">Select a goal...</option>
          {nodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.label}
            </option>
          ))}
        </select>

        {isActive && selectedGoal && (
          <div
            className={`mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md ${
              compactMode ? "text-xs" : "text-sm"
            }`}
          >
            <div className="flex items-center gap-2 font-medium text-yellow-800 mb-2">
              <Target className="w-4 h-4" />
              Current Goal
            </div>
            <div className="font-medium text-yellow-900 mb-1">
              {selectedGoal.label}
            </div>
            <div className="text-yellow-700 text-xs">
              The path to this goal will be highlighted in yellow on the graph
            </div>
            <button
              onClick={() => setGoalId("")}
              className="mt-2 text-xs text-yellow-600 hover:text-yellow-800 underline"
            >
              Clear Goal
            </button>
          </div>
        )}
      </div>
    </Panel>
  );
};
