"use client";

import React, { useState } from "react";
import { TopNav } from "@/components/navbar/TopNav";
import { DetailPanel } from "@/components/panels/DetailPanel";
import { CardNode, type CardNodeData } from "@/components/graph/CardNode";
import type { NodeProps } from "reactflow";

export default function DevUIPage() {
  const [search, setSearch] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);

  const baseCard = (
    overrides: Partial<CardNodeData> = {}
  ): NodeProps<CardNodeData> =>
    ({
      id: "node-1",
      type: "card",
      data: {
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
      },
      selected: false,
      xPos: 0,
      yPos: 0,
      isConnectable: false,
      dragging: false,
      zIndex: 0,
    }) as any;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white">
        <TopNav
          searchText={search}
          onSearchTextChange={setSearch}
          onOpenFilters={() => {}}
          onOpenMore={() => setMoreOpen((v) => !v)}
          xpLabel="420 XP • 42%"
        />
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <section>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">
            CardNode states
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <CardNode {...baseCard()} />
            <CardNode
              {...baseCard({ status: "completed", progressPct: 100 })}
            />
            <CardNode {...baseCard({ status: "locked", progressPct: 0 })} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">
            DetailPanel
          </h2>
          <div className="bg-white border rounded p-4 max-w-md">
            <DetailPanel
              title="Learn React"
              progressPct={25}
              deps={["js-basics", "ts-intro"]}
              dependents={["react-router", "redux"]}
              onSelectNode={() => {}}
              onToggleDone={() => {}}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
