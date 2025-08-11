import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Target, Lock, Zap, CheckCircle, Star } from "lucide-react";
import { TopicNode } from "@/lib/utils/types";
import {
  MAP_CONSTANTS,
  getClusterStyle,
  getStatusStyle,
  getXPColor,
} from "@/lib/ui/map-tokens";
import { Tooltip } from "@/components/ui";

export interface TechTreeNodeData {
  topic: TopicNode;
  status: "locked" | "available" | "completed";
  compact?: boolean;
  reviewed?: boolean;
  note?: string;
  goalId?: string;
  isOnGoalPath?: boolean;
  clusterFocused?: boolean;
  onToggleDone: (id: string) => void;
  onToggleReviewed: (id: string) => void;
  onSaveNote: (id: string, text: string) => void;
  onSetGoal: (id: string) => void;
  onClusterFocus?: (clusterId: string) => void;
}

export const TechTreeNode: React.FC<{ data: TechTreeNodeData }> = ({
  data,
}) => {
  const {
    topic,
    status,
    compact = false,
    reviewed = false,
    note = "",
    goalId = "",
    isOnGoalPath = false,
    clusterFocused = false,
    onToggleDone,
    onToggleReviewed,
    onSaveNote,
    onSetGoal,
    onClusterFocus,
  } = data;

  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [noteText, setNoteText] = useState(note);

  // Determine node state for styling
  const isGoal = goalId === topic.id;
  const isCompleted = status === "completed";
  const isLocked = status === "locked";
  const isAvailable = status === "available";

  // Get styling based on cluster and status
  const clusterStyle = getClusterStyle(topic.cluster);
  const statusStyle = getStatusStyle(isGoal ? "goal" : status);
  const xpColor = getXPColor(topic.xp);

  // Calculate node dimensions
  const nodeWidth = compact
    ? MAP_CONSTANTS.NODE.WIDTH.COMPACT
    : MAP_CONSTANTS.NODE.WIDTH.STANDARD;
  const nodeHeight = compact
    ? MAP_CONSTANTS.NODE.HEIGHT.COMPACT
    : MAP_CONSTANTS.NODE.HEIGHT.STANDARD;

  // Handle interactions
  const handleToggleComplete = useCallback(() => {
    if (!isLocked) {
      onToggleDone(topic.id);
    }
  }, [isLocked, onToggleDone, topic.id]);

  const handleSetGoal = useCallback(() => {
    onSetGoal(isGoal ? "" : topic.id);
  }, [isGoal, onSetGoal, topic.id]);

  const handleClusterFocus = useCallback(() => {
    onClusterFocus?.(topic.cluster);
  }, [onClusterFocus, topic.cluster]);

  const handleSaveNote = useCallback(() => {
    onSaveNote(topic.id, noteText);
    setShowDetails(false);
  }, [onSaveNote, topic.id, noteText]);

  // Status icon component
  const StatusIcon = () => {
    if (isLocked) return <Lock className="w-4 h-4" />;
    if (isCompleted) return <CheckCircle className="w-4 h-4" />;
    if (isGoal) return <Target className="w-4 h-4" />;
    if (isAvailable) return <Zap className="w-4 h-4" />;
    return null;
  };

  // XP level indicator
  const getXPLevel = (xp: number) => {
    if (xp >= 150) return 4;
    if (xp >= 76) return 3;
    if (xp >= 26) return 2;
    return 1;
  };

  const xpLevel = getXPLevel(topic.xp);

  // Animation variants
  const nodeVariants = {
    initial: { scale: 1, opacity: statusStyle.opacity },
    hover: {
      scale: MAP_CONSTANTS.ANIMATIONS.NODE_HOVER.scale,
      transition: {
        duration: MAP_CONSTANTS.ANIMATIONS.NODE_HOVER.duration / 1000,
        ease: MAP_CONSTANTS.ANIMATIONS.NODE_HOVER.ease,
      },
    },
    complete: {
      scale: [1, 1.2, 1] as number[],
      transition: {
        duration: MAP_CONSTANTS.ANIMATIONS.NODE_COMPLETE.duration / 1000,
        ease: MAP_CONSTANTS.ANIMATIONS.NODE_COMPLETE.ease,
      },
    },
    unlock: {
      scale: [1, 1.1, 1] as number[],
      transition: {
        duration: MAP_CONSTANTS.ANIMATIONS.NODE_UNLOCK.duration / 1000,
        ease: MAP_CONSTANTS.ANIMATIONS.NODE_UNLOCK.ease,
      },
    },
  };

  // Tooltip content
  const tooltipContent = `${topic.label} • ${
    topic.xp
  } XP • ${status} • Cluster: ${topic.cluster}${
    topic.deps.length ? ` • Deps: ${topic.deps.length}` : ""
  }`;

  return (
    <Tooltip content={tooltipContent} disabled={showDetails}>
      <motion.div
        className="relative cursor-pointer select-none"
        style={{
          width: nodeWidth,
          height: nodeHeight,
        }}
        variants={nodeVariants}
        initial="initial"
        animate={isHovered ? "hover" : "initial"}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => setShowDetails(!showDetails)}
      >
        {/* Main Node Container */}
        <div
          className="relative w-full h-full rounded-xl border-2 overflow-hidden transition-all duration-300"
          style={{
            background: isOnGoalPath
              ? statusStyle.background
              : clusterStyle.background,
            borderColor: isGoal ? statusStyle.border : clusterStyle.border,
            boxShadow: `${statusStyle.glow}, 0 4px 12px rgba(0, 0, 0, 0.1)`,
            opacity: clusterFocused || !clusterFocused ? 1 : 0.4,
          }}
        >
          {/* Goal Ring */}
          {isGoal && (
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                border:
                  "ring" in statusStyle
                    ? statusStyle.ring
                    : "3px solid #eab308",
                animation:
                  "pulse" in statusStyle && statusStyle.pulse
                    ? "pulse 2s infinite"
                    : "none",
              }}
            />
          )}

          {/* Status Glow Effect */}
          {(("pulse" in statusStyle && statusStyle.pulse) || isOnGoalPath) && (
            <div
              className="absolute inset-0 rounded-xl opacity-50"
              style={{
                background: `radial-gradient(circle at center, ${clusterStyle.accent}20 0%, transparent 70%)`,
                animation: "pulse 3s infinite",
              }}
            />
          )}

          {/* Header Section */}
          <div
            className="relative p-3 border-b border-opacity-20"
            style={{ borderColor: clusterStyle.border }}
          >
            <div className="flex items-center justify-between">
              {/* Cluster Badge */}
              <div
                className="px-2 py-1 rounded-md text-xs font-medium border"
                style={{
                  backgroundColor: clusterStyle.primary,
                  color: "white",
                  borderColor: clusterStyle.border,
                }}
              >
                {topic.cluster}
              </div>

              {/* Status and Actions */}
              <div className="flex items-center gap-2">
                {/* XP Level Stars */}
                <div className="flex items-center gap-0.5">
                  {[...Array(xpLevel)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3 fill-current"
                      style={{ color: xpColor }}
                    />
                  ))}
                </div>

                {/* Status Icon */}
                <div
                  className="p-1 rounded-full"
                  style={{
                    backgroundColor: statusStyle.border,
                    color: "white",
                  }}
                >
                  <StatusIcon />
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="relative p-3 flex-1">
            {/* Topic Title */}
            <h3
              className={`font-bold leading-tight mb-2 ${
                compact ? "text-sm" : "text-base"
              }`}
              style={{ color: clusterStyle.text }}
            >
              {topic.label}
            </h3>

            {/* XP and Dependencies Info */}
            {!compact && (
              <div
                className="space-y-1 text-xs opacity-80"
                style={{ color: clusterStyle.text }}
              >
                <div className="flex items-center justify-between">
                  <span>Experience Points</span>
                  <span className="font-bold" style={{ color: xpColor }}>
                    {topic.xp} XP
                  </span>
                </div>
                {topic.deps.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Dependencies</span>
                    <span className="font-medium">{topic.deps.length}</span>
                  </div>
                )}
              </div>
            )}

            {/* Progress Indicators */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              {reviewed && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: clusterStyle.accent }}
                  title="Reviewed"
                />
              )}
              {note && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#f59e0b" }}
                  title="Has notes"
                />
              )}
              {isOnGoalPath && (
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: "#eab308" }}
                  title="On goal path"
                />
              )}
            </div>
          </div>

          {/* Cluster Focus Overlay */}
          {isHovered && (
            <div
              className="absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium cursor-pointer hover:scale-105 transition-transform"
              style={{
                backgroundColor: clusterStyle.primary,
                color: "white",
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleClusterFocus();
              }}
            >
              Focus Cluster
            </div>
          )}
        </div>

        {/* Expanded Details Panel */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-xl border-2 shadow-lg z-50"
              style={{ borderColor: clusterStyle.border }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={handleToggleComplete}
                  disabled={isLocked}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isCompleted
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : isLocked
                        ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                        : "bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200"
                  }`}
                >
                  {isCompleted
                    ? "✅ Completed"
                    : isLocked
                      ? "🔒 Locked"
                      : "📚 Mark Complete"}
                </button>

                <button
                  onClick={handleSetGoal}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isGoal
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {isGoal ? "🎯 Clear Goal" : "🎯 Set Goal"}
                </button>

                <button
                  onClick={() => onToggleReviewed(topic.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    reviewed
                      ? "bg-purple-100 text-purple-800 border border-purple-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {reviewed ? "👁️ Reviewed" : "👁️ Mark Reviewed"}
                </button>
              </div>

              {/* Notes Section */}
              <div className="mb-3">
                <label
                  className="block text-xs font-medium mb-1"
                  style={{ color: clusterStyle.text }}
                >
                  Notes
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add your notes..."
                  className="w-full p-2 text-xs border rounded-md resize-none"
                  rows={3}
                  style={{ borderColor: clusterStyle.border }}
                />
                <div className="flex justify-end mt-1">
                  <button
                    onClick={handleSaveNote}
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: clusterStyle.primary,
                      color: "white",
                    }}
                  >
                    Save Note
                  </button>
                </div>
              </div>

              {/* Dependencies */}
              {topic.deps.length > 0 && (
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: clusterStyle.text }}
                  >
                    Dependencies
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {topic.deps.map((dep) => (
                      <span
                        key={dep}
                        className="px-2 py-0.5 rounded text-xs border"
                        style={{
                          backgroundColor: clusterStyle.background,
                          borderColor: clusterStyle.border,
                          color: clusterStyle.text,
                        }}
                      >
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Tooltip>
  );
};
