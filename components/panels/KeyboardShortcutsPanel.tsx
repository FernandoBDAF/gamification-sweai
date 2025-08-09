import React, { useState } from "react";
import { Keyboard, X } from "lucide-react";
import { Card, Button } from "@/components/ui";

export const KeyboardShortcutsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: "F", description: "Focus search" },
    { key: "1", description: "Switch to Tech Tree view" },
    { key: "2", description: "Switch to Cluster view" },
    { key: "3", description: "Switch to Matrix view" },
    { key: "C", description: "Toggle compact mode" },
    { key: "H", description: "Toggle hide completed" },
    { key: "ESC", description: "Clear goal and search" },
  ];

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full p-3 shadow-lg"
        title="Keyboard Shortcuts (Press ? for help)"
      >
        <Keyboard className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </h3>
          <Button onClick={() => setIsOpen(false)} className="p-1">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
            >
              <span className="text-sm text-gray-600">
                {shortcut.description}
              </span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono font-semibold">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Press <kbd className="px-1 py-0.5 bg-gray-100 rounded">ESC</kbd> or
          click outside to close
        </div>
      </Card>
    </div>
  );
};
