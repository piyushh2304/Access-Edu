'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface AccessibilitySettings {
  // Motion settings
  reducedMotion: boolean;
  disableAnimations: boolean;
  simplifiedTransitions: boolean;
  
  // Click/tap assistance
  largerClickableAreas: boolean;
  stickyKeysEnabled: boolean;
  doubleClickPrevention: boolean;
  
  // Keyboard shortcuts
  keyboardShortcutsEnabled: boolean;
  customShortcuts: Record<string, string>;
  
  // Reading mode
  readingModeEnabled: boolean;
  focusModeEnabled: boolean;
  readingRulerEnabled: boolean;
  
  // Simplified UI
  simplifiedUIMode: boolean;
  hideNonEssentialElements: boolean;
  stepByStepGuidance: boolean;
  
  // Time management
  extendedTimeEnabled: boolean;
  extendedTimeMultiplier: number; // e.g., 1.5x, 2x
  sessionTimeoutWarnings: boolean;
  sessionTimeoutMinutes: number;
  breakReminders: boolean;
  breakIntervalMinutes: number;
  
  // Error prevention
  confirmationDialogs: boolean;
  undoRedoEnabled: boolean;
  clearErrorMessages: boolean;
  
  // Content accessibility
  contentAccessibilityEnabled: boolean;
}

interface AccessibilityContextType extends AccessibilitySettings {
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  resetToDefaults: () => void;
  getShortcut: (action: string) => string | null;
  setShortcut: (action: string, keys: string) => void;
}

const defaultSettings: AccessibilitySettings = {
  reducedMotion: false,
  disableAnimations: false,
  simplifiedTransitions: false,
  largerClickableAreas: false,
  stickyKeysEnabled: false,
  doubleClickPrevention: false,
  keyboardShortcutsEnabled: true,
  customShortcuts: {},
  readingModeEnabled: false,
  focusModeEnabled: false,
  readingRulerEnabled: false,
  simplifiedUIMode: false,
  hideNonEssentialElements: false,
  stepByStepGuidance: false,
  extendedTimeEnabled: false,
  extendedTimeMultiplier: 1.5,
  sessionTimeoutWarnings: true,
  sessionTimeoutMinutes: 30,
  breakReminders: true,
  breakIntervalMinutes: 25,
  confirmationDialogs: true,
  undoRedoEnabled: true,
  clearErrorMessages: true,
  contentAccessibilityEnabled: true,
};

// Default keyboard shortcuts
const defaultShortcuts: Record<string, string> = {
  'toggle-tts': 'Ctrl+Shift+T',
  'toggle-voice-control': 'Ctrl+Shift+V',
  'open-home': 'Ctrl+H',
  'open-courses': 'Ctrl+C',
  'open-profile': 'Ctrl+P',
  'open-admin': 'Ctrl+A',
  'search': 'Ctrl+K',
  'skip-to-content': 'Alt+S',
  'open-keyboard-help': 'Ctrl+Shift+?',
  'toggle-theme': 'Ctrl+Shift+D',
  'scroll-up': 'Ctrl+Up',
  'scroll-down': 'Ctrl+Down',
  'go-back': 'Alt+Left',
  'go-forward': 'Alt+Right',
  'close-modal': 'Escape',
  'submit-form': 'Ctrl+Enter',
  'open-accessibility-settings': 'Ctrl+Shift+A',
  'undo': 'Ctrl+Z',
  'redo': 'Ctrl+Y',
  'redo-alt': 'Ctrl+Shift+Z',
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accessibility-settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return { ...defaultSettings, ...parsed };
        } catch (e) {
          console.error('Failed to parse saved accessibility settings:', e);
        }
      }
      
      // Check for prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        return { ...defaultSettings, reducedMotion: true };
      }
    }
    return defaultSettings;
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    }
  }, [settings]);

  // Apply reduced motion CSS class
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (settings.reducedMotion || settings.disableAnimations) {
        root.classList.add('reduce-motion');
      } else {
        root.classList.remove('reduce-motion');
      }
      
      if (settings.disableAnimations) {
        root.classList.add('no-animations');
      } else {
        root.classList.remove('no-animations');
      }
      
      if (settings.simplifiedTransitions) {
        root.classList.add('simplified-transitions');
      } else {
        root.classList.remove('simplified-transitions');
      }
      
      if (settings.largerClickableAreas) {
        root.classList.add('larger-clickable-areas');
      } else {
        root.classList.remove('larger-clickable-areas');
      }
      
      if (settings.readingModeEnabled) {
        root.classList.add('reading-mode');
      } else {
        root.classList.remove('reading-mode');
      }
      
      if (settings.focusModeEnabled) {
        root.classList.add('focus-mode');
      } else {
        root.classList.remove('focus-mode');
      }
      
      if (settings.simplifiedUIMode) {
        root.classList.add('simplified-ui');
      } else {
        root.classList.remove('simplified-ui');
      }
      
      if (settings.hideNonEssentialElements) {
        root.classList.add('hide-non-essential');
      } else {
        root.classList.remove('hide-non-essential');
      }
      
      if (settings.clearErrorMessages) {
        root.classList.add('clear-error-messages');
      } else {
        root.classList.remove('clear-error-messages');
      }
    }
  }, [
    settings.reducedMotion,
    settings.disableAnimations,
    settings.simplifiedTransitions,
    settings.largerClickableAreas,
    settings.readingModeEnabled,
    settings.focusModeEnabled,
    settings.simplifiedUIMode,
    settings.hideNonEssentialElements,
    settings.clearErrorMessages,
  ]);

  // Update reading ruler class on body
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (settings.readingRulerEnabled) {
        document.body.classList.add('reading-ruler-active');
      } else {
        document.body.classList.remove('reading-ruler-active');
      }
    }
  }, [settings.readingRulerEnabled]);

  // Listen for system prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches && !settings.reducedMotion) {
        updateSetting('reducedMotion', true);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.reducedMotion]);

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const getShortcut = useCallback((action: string): string | null => {
    return settings.customShortcuts[action] || defaultShortcuts[action] || null;
  }, [settings.customShortcuts]);

  const setShortcut = useCallback((action: string, keys: string) => {
    setSettings(prev => ({
      ...prev,
      customShortcuts: { ...prev.customShortcuts, [action]: keys },
    }));
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        ...settings,
        updateSetting,
        resetToDefaults,
        getShortcut,
        setShortcut,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

