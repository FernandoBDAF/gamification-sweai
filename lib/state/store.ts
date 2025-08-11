import { create } from "zustand";
import { ViewMode, ViewLevel, NodeId, ClusterId } from "../data/graph-types";

interface AppState {
  view: ViewMode;
  setView: (v: ViewMode) => void;

  viewLevel: ViewLevel;
  setViewLevel: (v: ViewLevel) => void;

  layoutDir: "TB" | "LR";
  setLayoutDir: (d: "TB" | "LR") => void;

  search: string;
  setSearch: (q: string) => void;

  selectedClusters: ClusterId[]; // multi-select
  setSelectedClusters: (c: ClusterId[]) => void;

  hideCompleted: boolean;
  setHideCompleted: (b: boolean) => void;

  showOnlyUnlockable: boolean;
  setShowOnlyUnlockable: (b: boolean) => void;

  clusterStyle: string;
  setClusterStyle: (s: string) => void;

  focusNodeId?: NodeId | null;
  setFocusNode: (id: NodeId | null) => void;

  goalId?: NodeId | null;
  setGoalId: (id: NodeId | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: "tree",
  setView: (v) => set({ view: v }),

  viewLevel: "cluster",
  setViewLevel: (v) => set({ viewLevel: v }),

  layoutDir: "TB",
  setLayoutDir: (d) => set({ layoutDir: d }),

  search: "",
  setSearch: (q) => set({ search: q }),

  selectedClusters: [],
  setSelectedClusters: (c) => set({ selectedClusters: c }),

  hideCompleted: false,
  setHideCompleted: (b) => set({ hideCompleted: b }),

  showOnlyUnlockable: false,
  setShowOnlyUnlockable: (b) => set({ showOnlyUnlockable: b }),

  clusterStyle: "background",
  setClusterStyle: (s) => set({ clusterStyle: s }),

  focusNodeId: null,
  setFocusNode: (id) => set({ focusNodeId: id }),

  goalId: null,
  setGoalId: (id) => set({ goalId: id }),
}));
