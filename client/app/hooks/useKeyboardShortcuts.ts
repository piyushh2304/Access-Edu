'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAccessibility } from '../contexts/AccessibilityProvider';
import { useSpeech } from '../SpeechProvider';
import { useUndoRedo } from '../hooks/useUndoRedo';

interface ShortcutHandler {
  action: string;
  handler: () => void;
  description?: string;
}

interface UseKeyboardShortcutsProps {
  shortcuts?: ShortcutHandler[];
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({ shortcuts = [], enabled = true }: UseKeyboardShortcutsProps = {}) => {
  const router = useRouter();
  const { keyboardShortcutsEnabled, getShortcut } = useAccessibility();
  const { isTTSActive, toggleTTS, isVoiceControlActive, toggleVoiceControl } = useSpeech();
  const handlersRef = useRef<Map<string, () => void>>(new Map());
  const stickyKeysRef = useRef<Set<string>>(new Set());
  const { stickyKeysEnabled, undoRedoEnabled } = useAccessibility();
  const { undo, redo } = useUndoRedo();

  // Register custom shortcuts
  useEffect(() => {
    shortcuts.forEach(({ action, handler }) => {
      handlersRef.current.set(action, handler);
    });
  }, [shortcuts]);

  // Parse keyboard shortcut string (e.g., "Ctrl+Shift+T") to key combination
  const parseShortcut = useCallback((shortcut: string): { ctrl: boolean; shift: boolean; alt: boolean; meta: boolean; key: string } => {
    const parts = shortcut.toLowerCase().split('+').map(s => s.trim());
    return {
      ctrl: parts.includes('ctrl') || parts.includes('control'),
      shift: parts.includes('shift'),
      alt: parts.includes('alt'),
      meta: parts.includes('meta') || parts.includes('cmd'),
      key: parts[parts.length - 1],
    };
  }, []);

  // Check if a key combination matches a shortcut
  const matchesShortcut = useCallback((
    event: KeyboardEvent,
    shortcut: string
  ): boolean => {
    // Guard against undefined event.key
    if (!event.key) {
      return false;
    }

    const parsed = parseShortcut(shortcut);
    const key = event.key.toLowerCase();
    
    return (
      (parsed.ctrl === (event.ctrlKey || event.metaKey)) &&
      (parsed.shift === event.shiftKey) &&
      (parsed.alt === event.altKey) &&
      (parsed.key === key || parsed.key === key)
    );
  }, [parseShortcut]);

  // Handle sticky keys
  const handleStickyKeys = useCallback((event: KeyboardEvent) => {
    if (!stickyKeysEnabled) return false;

    // Guard against undefined event.key
    if (!event.key) {
      return false;
    }

    const modifierKeys = ['Control', 'Shift', 'Alt', 'Meta'];
    const isModifier = modifierKeys.includes(event.key);

    if (isModifier && event.type === 'keydown') {
      stickyKeysRef.current.add(event.key);
      return true; // Don't process yet
    }

    if (isModifier && event.type === 'keyup') {
      stickyKeysRef.current.delete(event.key);
      return false;
    }

    // If we have sticky modifiers and a regular key, simulate the combination
    if (stickyKeysRef.current.size > 0 && !isModifier) {
      const hasCtrl = stickyKeysRef.current.has('Control') || stickyKeysRef.current.has('Meta');
      const hasShift = stickyKeysRef.current.has('Shift');
      const hasAlt = stickyKeysRef.current.has('Alt');

      // Create a synthetic event-like object
      const syntheticEvent = {
        ...event,
        ctrlKey: hasCtrl || event.ctrlKey,
        shiftKey: hasShift || event.shiftKey,
        altKey: hasAlt || event.altKey,
      } as KeyboardEvent;

      // Process with sticky modifiers
      return processShortcut(syntheticEvent);
    }

    return false;
  }, [stickyKeysEnabled]);

  // Process keyboard shortcut
  const processShortcut = useCallback((event: KeyboardEvent): boolean => {
    if (!keyboardShortcutsEnabled || !enabled) return false;

    // Check custom shortcuts first
    for (const [action, handler] of handlersRef.current.entries()) {
      const shortcut = getShortcut(action);
      if (shortcut && matchesShortcut(event, shortcut)) {
        event.preventDefault();
        event.stopPropagation();
        handler();
        return true;
      }
    }

    // Check default shortcuts
    const defaultActions: Record<string, () => void> = {
      'toggle-tts': () => toggleTTS(),
      'toggle-voice-control': () => toggleVoiceControl(),
      'open-home': () => router.push('/'),
      'open-courses': () => router.push('/courses'),
      'open-profile': () => router.push('/profile'),
      'open-admin': () => router.push('/admin'),
      'search': () => {
        const searchInput = document.querySelector<HTMLInputElement>('input[type="search"], input[placeholder*="search" i]');
        if (searchInput) {
          searchInput.focus();
        }
      },
      'skip-to-content': () => {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: 'smooth' });
        }
      },
      'toggle-theme': () => {
        const themeButton = document.querySelector<HTMLButtonElement>('[aria-label*="theme" i], [aria-label*="dark" i], [aria-label*="light" i]');
        if (themeButton) {
          themeButton.click();
        }
      },
      'scroll-up': () => {
        window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
      },
      'scroll-down': () => {
        window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
      },
      'go-back': () => router.back(),
      'go-forward': () => router.forward(),
      'close-modal': () => {
        const modal = document.querySelector('[role="dialog"], .modal, [data-modal]');
        const closeButton = modal?.querySelector<HTMLButtonElement>('[aria-label*="close" i], button[data-close]');
        if (closeButton) {
          closeButton.click();
        } else if (modal) {
          // Try to find and trigger close handler
          const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
          modal.dispatchEvent(event);
        }
      },
      'submit-form': () => {
        const form = document.querySelector('form');
        const submitButton = form?.querySelector<HTMLButtonElement>('button[type="submit"], input[type="submit"]');
        if (submitButton && form?.checkValidity()) {
          submitButton.click();
        }
      },
      'open-accessibility-settings': () => {
        const settingsButton = document.querySelector<HTMLButtonElement>('[aria-label*="accessibility" i], [title*="accessibility" i]');
        if (settingsButton) {
          settingsButton.click();
        }
      },
      'toggle-reading-mode': () => {
        // This will be handled by the component that uses useAccessibility
        const event = new CustomEvent('toggle-reading-mode');
        window.dispatchEvent(event);
      },
      'toggle-simplified-ui': () => {
        const event = new CustomEvent('toggle-simplified-ui');
        window.dispatchEvent(event);
      },
      'undo': () => {
        if (undoRedoEnabled) {
          const action = undo();
          if (action) {
            console.log('Undid action:', action);
          }
        }
      },
      'redo': () => {
        if (undoRedoEnabled) {
          const action = redo();
          if (action) {
            console.log('Redid action:', action);
          }
        }
      },
      'redo-alt': () => {
        if (undoRedoEnabled) {
          const action = redo();
          if (action) {
            console.log('Redid action:', action);
          }
        }
      },
    };

    for (const [action, handler] of Object.entries(defaultActions)) {
      const shortcut = getShortcut(action);
      if (shortcut && matchesShortcut(event, shortcut)) {
        event.preventDefault();
        event.stopPropagation();
        handler();
        return true;
      }
    }

    return false;
  }, [keyboardShortcutsEnabled, enabled, getShortcut, matchesShortcut, toggleTTS, toggleVoiceControl, router, undoRedoEnabled, undo, redo]);

  // Main keyboard event handler
  useEffect(() => {
    if (!keyboardShortcutsEnabled || !enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle sticky keys first
      if (handleStickyKeys(event)) {
        return;
      }

      // Process shortcut
      processShortcut(event);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (stickyKeysEnabled) {
        handleStickyKeys(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keyboardShortcutsEnabled, enabled, handleStickyKeys, processShortcut, stickyKeysEnabled]);

  return {
    registerShortcut: useCallback((action: string, handler: () => void) => {
      handlersRef.current.set(action, handler);
    }, []),
    unregisterShortcut: useCallback((action: string) => {
      handlersRef.current.delete(action);
    }, []),
  };
};

