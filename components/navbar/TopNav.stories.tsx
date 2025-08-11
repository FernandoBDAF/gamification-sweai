import type { Meta, StoryObj } from "@storybook/react";
import { TopNav, type TopNavProps } from "./TopNav";
import React from "react";

const meta: Meta<TopNavProps> = {
  title: "Navbar/TopNav",
  component: TopNav,
  parameters: { layout: "centered" },
  argTypes: {
    onSearchTextChange: { action: "searchChange" },
    onOpenFilters: { action: "openFilters" },
    onOpenMore: { action: "openMore" },
  },
};
export default meta;

type Story = StoryObj<TopNavProps>;

export const Default: Story = {
  args: {
    title: "AI Learning Graph",
    searchText: "",
    xpLabel: "420 XP",
  },
};
