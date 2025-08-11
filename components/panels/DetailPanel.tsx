import React from "react";

export type DetailPanelProps = {
  title: string;
  progressPct: number;
  statusChips?: string[];
  deps?: string[];
  dependents?: string[];
  onSelectNode?: (id: string) => void;
  onToggleDone?: () => void;
};

export const DetailPanel: React.FC<DetailPanelProps> = ({
  title,
  progressPct,
  statusChips = [],
  deps = [],
  dependents = [],
  onSelectNode,
  onToggleDone,
}) => {
  return (
    <aside className="w-[360px] sm:w-[420px] h-[600px] border rounded-xl p-3 bg-white">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="font-semibold leading-tight">{title}</div>
        <div className="badge select-none">{Math.round(progressPct)}%</div>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {statusChips.map((c) => (
          <span key={c} className="badge text-xs">
            {c}
          </span>
        ))}
      </div>
      <div className="mb-3">
        <div className="text-xs font-medium mb-1">Dependencies</div>
        <div className="flex flex-wrap gap-1">
          {deps.map((d) => (
            <button key={d} className="badge" onClick={() => onSelectNode?.(d)}>
              {d}
            </button>
          ))}
          {deps.length === 0 && (
            <span className="text-xs text-neutral-500">None</span>
          )}
        </div>
      </div>
      <div className="mb-3">
        <div className="text-xs font-medium mb-1">Dependents</div>
        <div className="flex flex-wrap gap-1">
          {dependents.map((d) => (
            <button key={d} className="badge" onClick={() => onSelectNode?.(d)}>
              {d}
            </button>
          ))}
          {dependents.length === 0 && (
            <span className="text-xs text-neutral-500">None</span>
          )}
        </div>
      </div>
      <div className="mt-auto pt-2 border-t">
        <button className="btn btn-primary w-full" onClick={onToggleDone}>
          Mark done
        </button>
      </div>
    </aside>
  );
};
