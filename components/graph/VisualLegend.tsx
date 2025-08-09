import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Lock,
  Zap,
  CheckCircle,
  Target,
  Star,
  Eye,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  MAP_CONSTANTS,
  getClusterStyle,
  getStatusStyle,
  getXPColor,
  getClusterLabel,
} from "@/lib/map-constants";
import { Badge } from "@/components/ui";

interface VisualLegendProps {
  isOpen: boolean;
  onToggle: () => void;
  compact?: boolean;
}

export const VisualLegend: React.FC<VisualLegendProps> = ({
  isOpen,
  onToggle,
  compact = false,
}) => {
  const [activeTab, setActiveTab] = useState<
    "status" | "clusters" | "xp" | "controls"
  >("status");

  // Legend sections data
  const statusLegend = [
    {
      key: "locked",
      icon: <Lock className="w-4 h-4" />,
      label: "Locked",
      description: "Prerequisites not completed",
      style: getStatusStyle("locked"),
    },
    {
      key: "available",
      icon: <Zap className="w-4 h-4" />,
      label: "Available",
      description: "Ready to start learning",
      style: getStatusStyle("available"),
    },
    {
      key: "completed",
      icon: <CheckCircle className="w-4 h-4" />,
      label: "Completed",
      description: "Successfully finished",
      style: getStatusStyle("completed"),
    },
    {
      key: "goal",
      icon: <Target className="w-4 h-4" />,
      label: "Goal",
      description: "Your current learning target",
      style: getStatusStyle("goal"),
    },
  ];

  const clusterLegend = Object.keys(MAP_CONSTANTS.CLUSTERS.COLORS).map(
    (clusterId) => ({
      key: clusterId,
      label: getClusterLabel(clusterId),
      style: getClusterStyle(clusterId),
    })
  );

  const xpLevels = [
    { range: "1-25 XP", level: 1, color: getXPColor(20), label: "Beginner" },
    {
      range: "26-75 XP",
      level: 2,
      color: getXPColor(50),
      label: "Intermediate",
    },
    { range: "76-150 XP", level: 3, color: getXPColor(100), label: "Advanced" },
    { range: "150+ XP", level: 4, color: getXPColor(200), label: "Expert" },
  ];

  const controlsLegend = [
    {
      icon: <Eye className="w-4 h-4" />,
      label: "Reviewed",
      description: "Topic has been reviewed",
      indicator: <div className="w-3 h-3 rounded-full bg-purple-500" />,
    },
    {
      icon: <FileText className="w-4 h-4" />,
      label: "Has Notes",
      description: "Personal notes added",
      indicator: <div className="w-3 h-3 rounded-full bg-amber-500" />,
    },
    {
      icon: <Target className="w-4 h-4" />,
      label: "Goal Path",
      description: "On path to current goal",
      indicator: (
        <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
      ),
    },
  ];

  const TabButton: React.FC<{
    id: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
    count?: number;
  }> = ({ id, label, isActive, onClick, count }) => (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
        isActive
          ? "bg-blue-100 text-blue-800 border border-blue-200"
          : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
      }`}
    >
      {label}
      {count && (
        <Badge className="ml-1 px-1 py-0 text-xs bg-gray-200 text-gray-600">
          {count}
        </Badge>
      )}
    </button>
  );

  const LegendItem: React.FC<{
    icon?: React.ReactNode;
    label: string;
    description?: string;
    color?: string;
    background?: string;
    border?: string;
    indicator?: React.ReactNode;
    glow?: string;
  }> = ({
    icon,
    label,
    description,
    color,
    background,
    border,
    indicator,
    glow,
  }) => (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg border-2 text-xs font-medium"
        style={{
          background: background || "white",
          borderColor: border || "#e5e7eb",
          color: color || "#374151",
          boxShadow: glow || "none",
        }}
      >
        {icon || indicator}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900">{label}</div>
        {description && (
          <div className="text-xs text-gray-500 mt-0.5">{description}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Toggle Button */}
      <motion.button
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-40 p-3 bg-white border-2 border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Toggle Legend"
      >
        <HelpCircle className="w-5 h-5 text-gray-600" />
      </motion.button>

      {/* Legend Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 300, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-20 right-4 z-50 w-80 max-h-96 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-gray-600" />
                <h3 className="font-bold text-gray-900">Map Legend</h3>
              </div>
              <button
                onClick={onToggle}
                className="p-1 hover:bg-gray-200 rounded-md transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 p-3 border-b border-gray-200 bg-gray-50">
              <TabButton
                id="status"
                label="Status"
                isActive={activeTab === "status"}
                onClick={() => setActiveTab("status")}
                count={statusLegend.length}
              />
              <TabButton
                id="clusters"
                label="Clusters"
                isActive={activeTab === "clusters"}
                onClick={() => setActiveTab("clusters")}
                count={clusterLegend.length}
              />
              <TabButton
                id="xp"
                label="XP Levels"
                isActive={activeTab === "xp"}
                onClick={() => setActiveTab("xp")}
                count={xpLevels.length}
              />
              <TabButton
                id="controls"
                label="Indicators"
                isActive={activeTab === "controls"}
                onClick={() => setActiveTab("controls")}
                count={controlsLegend.length}
              />
            </div>

            {/* Content */}
            <div className="p-3 max-h-64 overflow-y-auto">
              {activeTab === "status" && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700 text-sm mb-3">
                    Node Status Types
                  </h4>
                  {statusLegend.map((item) => (
                    <LegendItem
                      key={item.key}
                      icon={item.icon}
                      label={item.label}
                      description={item.description}
                      background={item.style.background}
                      border={item.style.border}
                      color="white"
                      glow={
                        item.style.glow !== "none" ? item.style.glow : undefined
                      }
                    />
                  ))}
                </div>
              )}

              {activeTab === "clusters" && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700 text-sm mb-3">
                    Learning Clusters
                  </h4>
                  {clusterLegend.map((item) => (
                    <LegendItem
                      key={item.key}
                      label={item.label}
                      background={item.style.background}
                      border={item.style.border}
                      color={item.style.text}
                      indicator={
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: item.style.primary }}
                        />
                      }
                    />
                  ))}
                </div>
              )}

              {activeTab === "xp" && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700 text-sm mb-3">
                    Experience Point Levels
                  </h4>
                  {xpLevels.map((item, index) => (
                    <LegendItem
                      key={index}
                      label={`${item.label} (${item.range})`}
                      description={`${item.level} star${
                        item.level > 1 ? "s" : ""
                      }`}
                      indicator={
                        <div className="flex items-center gap-0.5">
                          {[...Array(item.level)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 fill-current"
                              style={{ color: item.color }}
                            />
                          ))}
                        </div>
                      }
                    />
                  ))}
                </div>
              )}

              {activeTab === "controls" && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700 text-sm mb-3">
                    Progress Indicators
                  </h4>
                  {controlsLegend.map((item, index) => (
                    <LegendItem
                      key={index}
                      icon={item.icon}
                      label={item.label}
                      description={item.description}
                      indicator={item.indicator}
                    />
                  ))}

                  {/* Additional Info */}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-800 text-xs mb-2">
                      Quick Actions
                    </h5>
                    <div className="space-y-1 text-xs text-blue-700">
                      <div>• Click node to view details</div>
                      <div>• Hover for quick info tooltip</div>
                      <div>• Click "Focus Cluster" to isolate</div>
                      <div>• Use mouse wheel to zoom</div>
                      <div>• Drag to pan around the map</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-500 text-center">
                🎮 Inspired by Civilization's tech tree design
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
