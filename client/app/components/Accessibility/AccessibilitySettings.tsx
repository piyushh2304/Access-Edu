'use client';

import React, { useState } from 'react';
import { Settings, X, RotateCcw, Keyboard, Eye, MousePointer, Zap, BookOpen, Layout, Clock, Shield, FileText } from 'lucide-react';
import { useAccessibility } from '../../contexts/AccessibilityProvider';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({ isOpen, onClose }) => {
  const {
    reducedMotion,
    disableAnimations,
    simplifiedTransitions,
    largerClickableAreas,
    stickyKeysEnabled,
    doubleClickPrevention,
    keyboardShortcutsEnabled,
    readingModeEnabled,
    focusModeEnabled,
    readingRulerEnabled,
    simplifiedUIMode,
    hideNonEssentialElements,
    stepByStepGuidance,
    extendedTimeEnabled,
    extendedTimeMultiplier,
    sessionTimeoutWarnings,
    sessionTimeoutMinutes,
    breakReminders,
    breakIntervalMinutes,
    confirmationDialogs,
    undoRedoEnabled,
    clearErrorMessages,
    contentAccessibilityEnabled,
    updateSetting,
    resetToDefaults,
  } = useAccessibility();

  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="accessibility-settings-title"
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 id="accessibility-settings-title" className="text-2xl font-bold text-gray-900 dark:text-white">
                Accessibility Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close accessibility settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Motion Settings */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Motion & Animations</h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Respect Reduced Motion</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Automatically respect system preference for reduced motion
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Disable All Animations</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Remove all animations and transitions
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={disableAnimations}
                    onChange={(e) => updateSetting('disableAnimations', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Simplified Transitions</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use simpler, less distracting transitions
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={simplifiedTransitions}
                    onChange={(e) => updateSetting('simplifiedTransitions', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>
              </div>
            </section>

            {/* Click/Tap Assistance */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <MousePointer className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Click & Tap Assistance</h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Larger Clickable Areas</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Increase minimum size of clickable elements
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={largerClickableAreas}
                    onChange={(e) => updateSetting('largerClickableAreas', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Sticky Keys</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Allow modifier keys (Ctrl, Shift, Alt) to be pressed separately
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={stickyKeysEnabled}
                    onChange={(e) => updateSetting('stickyKeysEnabled', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Prevent Double-Clicks</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ignore accidental double-clicks within 500ms
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={doubleClickPrevention}
                    onChange={(e) => updateSetting('doubleClickPrevention', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>
              </div>
            </section>

            {/* Keyboard Shortcuts */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Keyboard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Keyboard Shortcuts</h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Enable Keyboard Shortcuts</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Allow keyboard shortcuts for navigation and actions
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={keyboardShortcutsEnabled}
                    onChange={(e) => updateSetting('keyboardShortcutsEnabled', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>

                <button
                  onClick={() => setShowKeyboardHelp(true)}
                  className="w-full p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 border border-purple-300 dark:border-purple-700 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-purple-900 dark:text-purple-100">View Keyboard Shortcuts</p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        See all available shortcuts and customize them
                      </p>
                    </div>
                    <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </button>
              </div>
            </section>

            {/* Reading Mode */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reading Mode</h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Enable Reading Mode</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Distraction-free reading view with focus options
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={readingModeEnabled}
                    onChange={(e) => updateSetting('readingModeEnabled', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Focus Mode</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Hide sidebars and navigation for focused reading
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={focusModeEnabled}
                    onChange={(e) => updateSetting('focusModeEnabled', e.target.checked)}
                    disabled={!readingModeEnabled}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 disabled:opacity-50"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Reading Ruler</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Show a line guide to help track reading position
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={readingRulerEnabled}
                    onChange={(e) => updateSetting('readingRulerEnabled', e.target.checked)}
                    disabled={!readingModeEnabled}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 disabled:opacity-50"
                  />
                </label>
              </div>
            </section>

            {/* Simplified UI */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Layout className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Simplified UI</h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Simplified UI Mode</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Minimal interface with reduced clutter
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={simplifiedUIMode}
                    onChange={(e) => updateSetting('simplifiedUIMode', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Hide Non-Essential Elements</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Hide decorative and non-functional elements
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={hideNonEssentialElements}
                    onChange={(e) => updateSetting('hideNonEssentialElements', e.target.checked)}
                    disabled={!simplifiedUIMode}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 disabled:opacity-50"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Step-by-Step Guidance</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Guide users through interface elements one at a time
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={stepByStepGuidance}
                    onChange={(e) => updateSetting('stepByStepGuidance', e.target.checked)}
                    disabled={!simplifiedUIMode}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 disabled:opacity-50"
                  />
                </label>
              </div>
            </section>

            {/* Time Management */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Time Management</h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Extended Time for Assessments</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Automatically extend time limits for tests and quizzes
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={extendedTimeEnabled}
                    onChange={(e) => updateSetting('extendedTimeEnabled', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>

                {extendedTimeEnabled && (
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Time Multiplier</span>
                      <select
                        value={extendedTimeMultiplier}
                        onChange={(e) => updateSetting('extendedTimeMultiplier', parseFloat(e.target.value))}
                        className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      >
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                        <option value="2.5">2.5x</option>
                        <option value="3">3x</option>
                      </select>
                    </label>
                  </div>
                )}

                <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Session Timeout Warnings</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Warn before session timeout
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={sessionTimeoutWarnings}
                    onChange={(e) => updateSetting('sessionTimeoutWarnings', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Break Reminders</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Remind to take breaks at regular intervals
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={breakReminders}
                    onChange={(e) => updateSetting('breakReminders', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>

                {breakReminders && (
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Break Interval (minutes)</span>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        step="5"
                        value={breakIntervalMinutes}
                        onChange={(e) => updateSetting('breakIntervalMinutes', parseInt(e.target.value) || 25)}
                        className="w-20 px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      />
                    </label>
                  </div>
                )}

                {sessionTimeoutWarnings && (
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Session Timeout (minutes)</span>
                      <input
                        type="number"
                        min="5"
                        max="480"
                        step="5"
                        value={sessionTimeoutMinutes}
                        onChange={(e) => updateSetting('sessionTimeoutMinutes', parseInt(e.target.value) || 30)}
                        className="w-20 px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      />
                    </label>
                  </div>
                )}
              </div>
            </section>

            {/* Error Prevention */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Error Prevention</h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Confirmation Dialogs</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Show confirmation for critical actions (delete, logout, etc.)
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={confirmationDialogs}
                    onChange={(e) => updateSetting('confirmationDialogs', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Undo/Redo Functionality</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enable undo and redo for actions (Ctrl+Z / Ctrl+Y)
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={undoRedoEnabled}
                    onChange={(e) => updateSetting('undoRedoEnabled', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Clear Error Messages</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Display detailed, accessible error messages
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={clearErrorMessages}
                    onChange={(e) => updateSetting('clearErrorMessages', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>
              </div>
            </section>

            {/* Content Accessibility */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Content Accessibility</h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Enable Content Accessibility</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enhanced content accessibility features (alt text, captions, etc.)
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={contentAccessibilityEnabled}
                    onChange={(e) => updateSetting('contentAccessibilityEnabled', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
            <button
              onClick={resetToDefaults}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {showKeyboardHelp && (
        <KeyboardShortcutsHelp
          isOpen={showKeyboardHelp}
          onClose={() => setShowKeyboardHelp(false)}
        />
      )}
    </>
  );
};

