import React from "react";

export type TopNavProps = {
  title?: string;
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onOpenFilters?: () => void;
  onOpenMore?: () => void;
  xpLabel?: string; // e.g., "420 XP"
};

export const TopNav: React.FC<TopNavProps> = ({
  title = "AI Learning Graph",
  searchText,
  onSearchTextChange,
  onOpenFilters,
  onOpenMore,
  xpLabel = "",
}) => {
  return (
    <div className="w-full sticky top-0 z-20 bg-white/90 backdrop-blur border-b">
      <div className="mx-auto max-w-[1200px] px-3 py-2 flex items-center gap-2">
        <button className="btn" aria-label="Menu">
          ☰
        </button>
        <div className="font-semibold text-sm sm:text-base">{title}</div>
        <div className="flex-1" />
        <div className="w-[220px] sm:w-[320px]">
          <input
            className="input"
            placeholder="Search topics…"
            value={searchText}
            onChange={(e) => onSearchTextChange(e.target.value)}
          />
        </div>
        <button className="btn" onClick={onOpenFilters}>
          Filters ▾
        </button>
        {xpLabel ? <span className="badge select-none">{xpLabel}</span> : null}
        <button className="btn" onClick={onOpenMore}>
          More
        </button>
      </div>
    </div>
  );
};
