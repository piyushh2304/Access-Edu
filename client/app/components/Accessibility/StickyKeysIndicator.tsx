'use client';

import React, { useEffect, useState } from 'react';
import { useAccessibility } from '../../contexts/AccessibilityProvider';

export const StickyKeysIndicator: React.FC = () => {
  const { stickyKeysEnabled } = useAccessibility();
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!stickyKeysEnabled) {
      setActiveKeys(new Set());
      return;
    }

    const modifierKeys = ['Control', 'Shift', 'Alt', 'Meta'];
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modifierKeys.includes(e.key)) {
        setActiveKeys(prev => new Set(prev).add(e.key));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (modifierKeys.includes(e.key)) {
        setActiveKeys(prev => {
          const next = new Set(prev);
          next.delete(e.key);
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [stickyKeysEnabled]);

  if (!stickyKeysEnabled || activeKeys.size === 0) {
    return null;
  }

  const keyLabels: Record<string, string> = {
    'Control': 'Ctrl',
    'Meta': 'Cmd',
    'Shift': 'Shift',
    'Alt': 'Alt',
  };

  return (
    <div className="sticky-keys-active">
      <span className="font-semibold">Sticky Keys Active:</span>
      <div className="flex gap-2">
        {Array.from(activeKeys).map(key => (
          <kbd key={key} className="px-2 py-1 bg-white/20 rounded text-xs font-mono">
            {keyLabels[key] || key}
          </kbd>
        ))}
      </div>
    </div>
  );
};

