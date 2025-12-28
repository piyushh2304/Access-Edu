'use client';

import { useUndoRedo as useUndoRedoHook } from '../hooks/useUndoRedo';
import { useAccessibility } from '../contexts/AccessibilityProvider';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

/**
 * Global undo/redo hook with keyboard shortcuts
 */
export const useUndoRedo = () => {
  const { undoRedoEnabled } = useAccessibility();
  const { pushAction, undo, redo, canUndo, canRedo } = useUndoRedoHook();

  // Register undo/redo keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        action: 'undo',
        handler: () => undo(),
        description: 'Undo last action',
      },
      {
        action: 'redo',
        handler: () => redo(),
        description: 'Redo last action',
      },
    ],
    enabled: undoRedoEnabled,
  });

  return {
    pushAction,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};

