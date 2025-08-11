import type { Meta, StoryObj } from "@storybook/react";
import { CardNode, type CardNodeData } from "./CardNode";
import type { NodeProps } from "reactflow";

const meta: Meta<NodeProps<CardNodeData>> = {
  title: "Graph/CardNode",
  component: CardNode,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<NodeProps<CardNodeData>>;

const baseData = (overrides: Partial<CardNodeData> = {}): CardNodeData => ({
  topic: {
    id: "n1",
    label: "Learn React",
    cluster: "foundations",
    deps: [],
    xp: 50,
    links: [{ label: "Official Docs", url: "https://react.dev" }],
  } as any,
  status: "available",
  compact: false,
  reviewed: false,
  note: "",
  goalId: "",
  onToggleDone: () => {},
  onToggleReviewed: () => {},
  onSaveNote: () => {},
  onSetGoal: () => {},
  highlightType: null,
  progressPct: 25,
  ...overrides,
});

export const Available: Story = {
  args: {
    id: "node-1",
    data: baseData(),
    selected: false,
    xPos: 0,
    yPos: 0,
    isConnectable: false,
    dragging: false,
    zIndex: 0,
    type: "card",
  },
};

export const Completed: Story = {
  args: {
    ...Available.args,
    data: baseData({ status: "completed", progressPct: 100 }),
  },
};

export const Locked: Story = {
  args: {
    ...Available.args,
    data: baseData({ status: "locked", progressPct: 0 }),
  },
};
