import React, { useRef } from "react";

export type MoreMenuProps = {
  onExport: () => void;
  onImport: (json: string) => void;
  onClose?: () => void;
};

export const MoreMenu: React.FC<MoreMenuProps> = ({
  onExport,
  onImport,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        onImport(String(reader.result || ""));
        onClose?.();
      } catch {}
    };
    reader.readAsText(file);
  };

  return (
    <div className="absolute right-0 mt-2 w-56 rounded-md border bg-white shadow-lg p-2 z-20">
      <button
        className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50"
        onClick={onExport}
      >
        Export Panel JSON
      </button>
      <label className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer block">
        Import Panel JSON
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFilePick}
        />
      </label>
    </div>
  );
};
