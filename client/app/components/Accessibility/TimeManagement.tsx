'use client';

import React, { useEffect, useState } from 'react';
import { Clock, X, RefreshCw, Coffee } from 'lucide-react';
import { useTimeManagement } from '../../hooks/useTimeManagement';
import { useAccessibility } from '../../contexts/AccessibilityProvider';

export const TimeManagementWarnings: React.FC = () => {
  const { warnings, nextBreak, dismissWarning, extendSession, skipBreak } = useTimeManagement();
  const { breakReminders, sessionTimeoutWarnings } = useAccessibility();
  const [timeUntilBreak, setTimeUntilBreak] = useState<number | null>(null);

  useEffect(() => {
    if (!nextBreak) {
      setTimeUntilBreak(null);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((nextBreak - Date.now()) / 60000));
      setTimeUntilBreak(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [nextBreak]);

  if (!sessionTimeoutWarnings && !breakReminders) {
    return null;
  }

  return (
    <>
      {/* Warnings */}
      {warnings.map((warning, index) => (
        <div
          key={index}
          className="fixed top-4 right-4 z-[9999] bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-700 rounded-lg shadow-2xl p-4 max-w-sm animate-slide-in"
        >
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                {warning.minutes > 0 ? 'Session Timeout Warning' : 'Break Reminder'}
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                {warning.message}
              </p>
              <div className="flex items-center gap-2">
                {warning.minutes > 0 && (
                  <button
                    onClick={extendSession}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-yellow-600 hover:bg-yellow-700 text-white transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Extend Session
                  </button>
                )}
                {warning.minutes === 0 && (
                  <button
                    onClick={skipBreak}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-yellow-600 hover:bg-yellow-700 text-white transition-colors"
                  >
                    <Coffee className="w-3 h-3" />
                    Skip Break
                  </button>
                )}
                <button
                  onClick={() => dismissWarning(index)}
                  className="p-1.5 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                  aria-label="Dismiss warning"
                >
                  <X className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Break Timer Indicator */}
      {breakReminders && timeUntilBreak !== null && timeUntilBreak <= 5 && (
        <div className="fixed bottom-20 right-4 z-[9998] bg-blue-100 dark:bg-blue-900/30 border border-blue-400 dark:border-blue-700 rounded-lg shadow-lg p-3 max-w-xs">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div className="flex-1">
              <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                Break in {timeUntilBreak} min
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
