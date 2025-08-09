import React from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  CheckCircle,
  Target,
  NotebookPen,
  Link as LinkIcon,
  Columns2,
} from "lucide-react";
import { TopicNode, TopicStatus } from "@/lib/types";
import { clusterLabels, clusterColors } from "@/lib/constants";

export type CardNodeData = {
  topic: TopicNode;
  status: TopicStatus;
  compact: boolean;
  reviewed?: boolean;
  note?: string;
  goalId: string;
  onToggleDone: (id: string) => void;
  onToggleReviewed: (id: string) => void;
  onSaveNote: (id: string, text: string) => void;
  onSetGoal: (id: string) => void;
};

export const CardNode: React.FC<{ data: CardNodeData }> = ({ data }) => {
  const {
    topic,
    status,
    compact,
    reviewed,
    note,
    goalId,
    onToggleDone,
    onToggleReviewed,
    onSaveNote,
    onSetGoal,
  } = data;
  const completed = status === "completed";
  const locked = status === "locked";
  const isGoal = goalId === topic.id;
  const [open, setOpen] = React.useState(false);

  const base = compact
    ? "rounded-lg border-2 p-2 shadow-sm min-w-[180px] max-w-[280px] bg-white"
    : "rounded-2xl border-2 p-3 shadow-sm min-w-[220px] max-w-[320px] sm:min-w-[260px] sm:max-w-[360px] bg-white";

  const cluster = clusterColors[topic.cluster] || "bg-white";

  // Status-based border colors as per requirements
  const statusBorders: Record<TopicStatus, string> = {
    locked: "border-gray-300",
    available: "border-blue-400",
    completed: "border-green-500",
  };

  const statusClasses = `${statusBorders[status]} ${
    locked ? "opacity-50 grayscale" : ""
  }`;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={`${base} ${cluster} ${statusClasses} ${
        isGoal ? "ring-2 ring-yellow-400 shadow-lg" : ""
      }`}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <span className="badge text-xs">
          {clusterLabels[topic.cluster] || topic.cluster}
        </span>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {completed && (
            <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
          )}
          {isGoal && (
            <Target className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
          )}
          <span className="badge text-xs">{topic.xp} XP</span>
        </div>
      </div>
      <div className="mt-2 font-medium text-sm sm:text-base leading-tight">
        {topic.label}
      </div>
      {!compact && (
        <div className="mt-2 text-xs text-neutral-500 leading-tight">
          Deps: {topic.deps.length ? topic.deps.join(", ") : "None"}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-1 sm:gap-2">
        <button
          className={`btn text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 ${
            completed ? "btn-outline" : "btn-primary"
          }`}
          onClick={() => !locked && onToggleDone(topic.id)}
          disabled={locked}
        >
          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 inline" />{" "}
          {completed ? "Undo" : locked ? "Locked" : "Done"}
        </button>
        <button
          className="btn btn-outline text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
          onClick={() => onToggleReviewed(topic.id)}
        >
          <NotebookPen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 inline" />{" "}
          {reviewed ? "✓" : "Review"}
        </button>
        <button
          className="btn btn-outline text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
          onClick={() => setOpen(!open)}
        >
          <Columns2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 inline" />{" "}
          {open ? "Hide" : "Details"}
        </button>
        <button
          className={`btn text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 ${
            isGoal ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => onSetGoal(isGoal ? "" : topic.id)}
        >
          <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 inline" />
          {isGoal ? "Clear" : "Goal"}
        </button>
      </div>

      {open && (
        <div className="mt-3 border-t pt-3 text-sm">
          <div className="flex gap-2 mb-2">
            <span className="badge text-xs">Resources</span>
            <span className="badge text-xs">Notes</span>
          </div>
          {/* Resources */}
          {topic.links && topic.links.length > 0 ? (
            <ul className="list-disc ml-4 sm:ml-5 text-xs space-y-1">
              {topic.links.map((l, i) => (
                <li key={i} className="flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 flex-shrink-0" />
                  <a
                    className="underline hover:text-blue-600 transition-colors break-words"
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-neutral-500">
              No links yet — add in data/graphData.json
            </div>
          )}
          {/* Notes */}
          <textarea
            className="mt-2 w-full border rounded-md p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={compact ? 2 : 3}
            placeholder="Your notes…"
            value={note || ""}
            onChange={(e) => onSaveNote(topic.id, e.target.value)}
          />
        </div>
      )}
    </motion.div>
  );
};
