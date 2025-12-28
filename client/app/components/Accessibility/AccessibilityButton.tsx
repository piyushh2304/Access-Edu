'use client';

import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { AccessibilitySettings } from './AccessibilitySettings';
import { StickyKeysIndicator } from './StickyKeysIndicator';
import { useAccessibility } from '../../contexts/AccessibilityProvider';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export const AccessibilityButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { keyboardShortcutsEnabled } = useAccessibility();

  // Register keyboard shortcut to open settings
  useKeyboardShortcuts({
    shortcuts: [
      {
        action: 'open-accessibility-settings',
        handler: () => setIsOpen(true),
        description: 'Open accessibility settings',
      },
    ],
    enabled: keyboardShortcutsEnabled,
  });

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        aria-label="Open accessibility settings"
        title="Accessibility Settings (Ctrl+Shift+A)"
      >
        <Settings className="w-6 h-6" />
      </button>

      <StickyKeysIndicator />
      <AccessibilitySettings isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

