'use client';

import { useState, useCallback, useRef } from 'react';
import { useAccessibility } from '../contexts/AccessibilityProvider';

interface Action {
  type: string;
  data: any;
  timestamp: number;
}

export const useUndoRedo = () => {
  const { undoRedoEnabled } = useAccessibility();
  const [history, setHistory] = useState<Action[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const maxHistorySize = 50;

  const pushAction = useCallback((type: string, data: any) => {
    if (!undoRedoEnabled) return;

    setHistory((prev) => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push({
        type,
        data,
        timestamp: Date.now(),
      });
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        return newHistory;
      }
      
      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [undoRedoEnabled, currentIndex]);

  const undo = useCallback(() => {
    if (!undoRedoEnabled || currentIndex < 0) {
      return null;
    }

    const action = history[currentIndex];
    setCurrentIndex(currentIndex - 1);
    return action;
  }, [undoRedoEnabled, history, currentIndex]);

  const redo = useCallback(() => {
    if (!undoRedoEnabled || currentIndex >= history.length - 1) {
      return null;
    }

    const nextIndex = currentIndex + 1;
    const action = history[nextIndex];
    setCurrentIndex(nextIndex);
    return action;
  }, [undoRedoEnabled, history, currentIndex]);

  const canUndo = undoRedoEnabled && currentIndex >= 0;
  const canRedo = undoRedoEnabled && currentIndex < history.length - 1;

  return {
    pushAction,
    undo,
    redo,
    canUndo,
    canRedo,
    historySize: history.length,
  };
};

