'use client';

import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import { useErrorPrevention } from '../../hooks/useErrorPrevention';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useAccessibility } from '../../contexts/AccessibilityProvider';

export const UndoRedoControls: React.FC = () => {
  const { undo, redo, canUndo, canRedo } = useErrorPrevention();
  const { undoRedoEnabled } = useAccessibility();

  // Register keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        action: 'undo',
        handler: () => undo(),
      },
      {
        action: 'redo',
        handler: () => redo(),
      },
    ],
  });

  if (!undoRedoEnabled) return null;

  return (
    <div className="fixed top-20 left-4 z-[9997] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex gap-2">
      <button
        onClick={undo}
        disabled={!canUndo}
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Undo (Ctrl+Z)"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Redo (Ctrl+Y)"
        title="Redo (Ctrl+Y)"
      >
        <Redo2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  );
};

