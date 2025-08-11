import type { Meta, StoryObj } from "@storybook/react";
import { DetailPanel, type DetailPanelProps } from "./DetailPanel";

const meta: Meta<DetailPanelProps> = {
  title: "Panels/DetailPanel",
  component: DetailPanel,
  parameters: { layout: "centered" },
  argTypes: {
    onSelectNode: { action: "selectNode" },
    onToggleDone: { action: "toggleDone" },
  },
};
export default meta;

type Story = StoryObj<DetailPanelProps>;

export const Default: Story = {
  args: {
    title: "Learn React",
    progressPct: 50,
    statusChips: ["Active"],
    deps: ["JS Basics", "TS Basics"],
    dependents: ["React Router"],
  },
};
