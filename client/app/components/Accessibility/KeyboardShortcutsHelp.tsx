'use client';

import React, { useState, useEffect } from 'react';
import { X, Keyboard, Settings } from 'lucide-react';
import { useAccessibility } from '../../contexts/AccessibilityProvider';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

const defaultShortcuts: Record<string, { keys: string; description: string; category: string }> = {
  'toggle-tts': {
    keys: 'Ctrl+Shift+T',
    description: 'Toggle text-to-speech on/off',
    category: 'Accessibility',
  },
  'toggle-voice-control': {
    keys: 'Ctrl+Shift+V',
    description: 'Toggle voice control on/off',
    category: 'Accessibility',
  },
  'open-home': {
    keys: 'Ctrl+H',
    description: 'Go to home page',
    category: 'Navigation',
  },
  'open-courses': {
    keys: 'Ctrl+C',
    description: 'Go to courses page',
    category: 'Navigation',
  },
  'open-profile': {
    keys: 'Ctrl+P',
    description: 'Go to profile page',
    category: 'Navigation',
  },
  'open-admin': {
    keys: 'Ctrl+A',
    description: 'Go to admin dashboard',
    category: 'Navigation',
  },
  'search': {
    keys: 'Ctrl+K',
    description: 'Focus search input',
    category: 'Navigation',
  },
  'skip-to-content': {
    keys: 'Alt+S',
    description: 'Skip to main content',
    category: 'Navigation',
  },
  'toggle-theme': {
    keys: 'Ctrl+Shift+D',
    description: 'Toggle dark/light theme',
    category: 'Interface',
  },
  'scroll-up': {
    keys: 'Ctrl+Up',
    description: 'Scroll up one page',
    category: 'Navigation',
  },
  'scroll-down': {
    keys: 'Ctrl+Down',
    description: 'Scroll down one page',
    category: 'Navigation',
  },
  'go-back': {
    keys: 'Alt+Left',
    description: 'Go back in history',
    category: 'Navigation',
  },
  'go-forward': {
    keys: 'Alt+Right',
    description: 'Go forward in history',
    category: 'Navigation',
  },
  'close-modal': {
    keys: 'Escape',
    description: 'Close modal or dialog',
    category: 'Interface',
  },
  'submit-form': {
    keys: 'Ctrl+Enter',
    description: 'Submit current form',
    category: 'Forms',
  },
  'open-keyboard-help': {
    keys: 'Ctrl+Shift+?',
    description: 'Open keyboard shortcuts help',
    category: 'Help',
  },
  'open-accessibility-settings': {
    keys: 'Ctrl+Shift+A',
    description: 'Open accessibility settings',
    category: 'Help',
  },
  'undo': {
    keys: 'Ctrl+Z',
    description: 'Undo last action',
    category: 'Actions',
  },
  'redo': {
    keys: 'Ctrl+Y',
    description: 'Redo last undone action',
    category: 'Actions',
  },
  'redo-alt': {
    keys: 'Ctrl+Shift+Z',
    description: 'Redo last undone action (alternative)',
    category: 'Actions',
  },
};

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
  const { getShortcut, setShortcut, keyboardShortcutsEnabled } = useAccessibility();
  const [editingAction, setEditingAction] = useState<string | null>(null);
  const [newKeys, setNewKeys] = useState('');

  // Register shortcut to open this panel
  useKeyboardShortcuts({
    shortcuts: [
      {
        action: 'open-keyboard-help',
        handler: () => {
          if (!isOpen) {
            // This will be handled by parent component
          }
        },
      },
    ],
  });

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = Array.from(new Set(Object.values(defaultShortcuts).map(s => s.category)));

  const handleKeyCapture = (action: string) => {
    setEditingAction(action);
    setNewKeys('');
    
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const parts: string[] = [];
      if (e.ctrlKey || e.metaKey) parts.push(e.metaKey ? 'Meta' : 'Ctrl');
      if (e.shiftKey) parts.push('Shift');
      if (e.altKey) parts.push('Alt');
      parts.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);
      
      const shortcut = parts.join('+');
      setNewKeys(shortcut);
      
      window.removeEventListener('keydown', handleKeyDown);
      setTimeout(() => {
        setEditingAction(null);
        if (shortcut) {
          setShortcut(action, shortcut);
        }
      }, 100);
    };
    
    window.addEventListener('keydown', handleKeyDown);
  };

  const resetShortcut = (action: string) => {
    setShortcut(action, defaultShortcuts[action].keys);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-help-title"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h2 id="keyboard-help-title" className="text-2xl font-bold text-gray-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close keyboard shortcuts help"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!keyboardShortcutsEnabled && (
            <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200">
                Keyboard shortcuts are currently disabled. Enable them in accessibility settings.
              </p>
            </div>
          )}

          {categories.map((category) => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {Object.entries(defaultShortcuts)
                  .filter(([_, info]) => info.category === category)
                  .map(([action, info]) => {
                    const currentKeys = getShortcut(action) || info.keys;
                    const isEditing = editingAction === action;

                    return (
                      <div
                        key={action}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {info.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={newKeys || 'Press keys...'}
                                readOnly
                                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-purple-500 rounded text-sm font-mono min-w-[150px] text-center"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <>
                              <kbd className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono shadow-sm">
                                {currentKeys}
                              </kbd>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleKeyCapture(action)}
                                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                  aria-label={`Edit shortcut for ${info.description}`}
                                  title="Edit shortcut"
                                >
                                  <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </button>
                                {currentKeys !== info.keys && (
                                  <button
                                    onClick={() => resetShortcut(action)}
                                    className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs text-gray-600 dark:text-gray-400"
                                    aria-label={`Reset shortcut for ${info.description} to default`}
                                    title="Reset to default"
                                  >
                                    Reset
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Press <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">Escape</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
};

