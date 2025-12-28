'use client';

import { useCallback, useRef } from 'react';
import { useAccessibility } from '../contexts/AccessibilityProvider';

interface ActionHistory {
  action: string;
  timestamp: number;
  undo: () => void;
  redo: () => void;
}

export const useErrorPrevention = () => {
  const { confirmationDialogs, undoRedoEnabled, clearErrorMessages } = useAccessibility();
  const historyRef = useRef<ActionHistory[]>([]);
  const historyIndexRef = useRef<number>(-1);

  const showConfirmation = useCallback(
    (message: string, onConfirm: () => void, onCancel?: () => void): void => {
      if (!confirmationDialogs) {
        onConfirm();
        return;
      }

      const confirmed = window.confirm(message);
      if (confirmed) {
        onConfirm();
      } else if (onCancel) {
        onCancel();
      }
    },
    [confirmationDialogs]
  );

  const addToHistory = useCallback(
    (action: string, undo: () => void, redo: () => void) => {
      if (!undoRedoEnabled) return;

      // Remove any future history if we're not at the end
      if (historyIndexRef.current < historyRef.current.length - 1) {
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      }

      historyRef.current.push({
        action,
        timestamp: Date.now(),
        undo,
        redo,
      });

      historyIndexRef.current = historyRef.current.length - 1;

      // Limit history size
      if (historyRef.current.length > 50) {
        historyRef.current.shift();
        historyIndexRef.current--;
      }
    },
    [undoRedoEnabled]
  );

  const undo = useCallback(() => {
    if (!undoRedoEnabled || historyIndexRef.current < 0) return false;

    const current = historyRef.current[historyIndexRef.current];
    current.undo();
    historyIndexRef.current--;

    return true;
  }, [undoRedoEnabled]);

  const redo = useCallback(() => {
    if (!undoRedoEnabled || historyIndexRef.current >= historyRef.current.length - 1) return false;

    historyIndexRef.current++;
    const current = historyRef.current[historyIndexRef.current];
    current.redo();

    return true;
  }, [undoRedoEnabled]);

  const showError = useCallback(
    (message: string, details?: string) => {
      if (clearErrorMessages) {
        // Enhanced error display
        const errorMessage = details ? `${message}\n\nDetails: ${details}` : message;
        alert(errorMessage);
      } else {
        console.error(message, details);
      }
    },
    [clearErrorMessages]
  );

  return {
    showConfirmation,
    addToHistory,
    undo,
    redo,
    showError,
    canUndo: undoRedoEnabled && historyIndexRef.current >= 0,
    canRedo: undoRedoEnabled && historyIndexRef.current < historyRef.current.length - 1,
  };
};

