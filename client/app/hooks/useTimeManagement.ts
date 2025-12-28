'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAccessibility } from '../contexts/AccessibilityProvider';

interface TimeoutWarning {
  minutes: number;
  message: string;
  shown: boolean;
}

export const useTimeManagement = () => {
  const {
    sessionTimeoutWarnings,
    sessionTimeoutMinutes,
    breakReminders,
    breakIntervalMinutes,
    extendedTimeEnabled,
    extendedTimeMultiplier,
  } = useAccessibility();

  const [warnings, setWarnings] = useState<TimeoutWarning[]>([]);
  const [nextBreak, setNextBreak] = useState<number | null>(null);
  const sessionStartRef = useRef<number>(Date.now());
  const lastBreakRef = useRef<number>(Date.now());
  const warningShownRef = useRef<Set<number>>(new Set());
  const breakTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Show session timeout warnings
  useEffect(() => {
    if (!sessionTimeoutWarnings) {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      return;
    }

    const timeoutMs = sessionTimeoutMinutes * 60 * 1000;
    const warningTimes = [5, 3, 1]; // minutes before timeout

    const setupWarnings = () => {
      warningTimes.forEach((minutes) => {
        const warningMs = timeoutMs - minutes * 60 * 1000;
        if (warningMs > 0 && !warningShownRef.current.has(minutes)) {
          const timeout = setTimeout(() => {
            const remaining = Math.ceil((timeoutMs - (Date.now() - sessionStartRef.current)) / 60000);
            const warning: TimeoutWarning = {
              minutes: remaining,
              message: `Your session will timeout in ${remaining} minute${remaining !== 1 ? 's' : ''}. Please save your work.`,
              shown: false,
            };
            setWarnings((prev) => [...prev, warning]);
            warningShownRef.current.add(minutes);
            
            // Show notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('Session Timeout Warning', {
                body: warning.message,
                icon: '/favicon.ico',
              });
            }
          }, warningMs);
          
          warningTimeoutRef.current = timeout as any;
        }
      });
    };

    setupWarnings();
    sessionStartRef.current = Date.now();

    return () => {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      warningShownRef.current.clear();
    };
  }, [sessionTimeoutWarnings, sessionTimeoutMinutes]);

  // Break reminders
  useEffect(() => {
    if (!breakReminders) {
      if (breakTimeoutRef.current) {
        clearTimeout(breakTimeoutRef.current);
      }
      setNextBreak(null);
      return;
    }

    const intervalMs = breakIntervalMinutes * 60 * 1000;
    const scheduleNextBreak = () => {
      const timeUntilBreak = intervalMs - (Date.now() - lastBreakRef.current);
      
      if (timeUntilBreak > 0) {
        setNextBreak(Date.now() + timeUntilBreak);
        breakTimeoutRef.current = setTimeout(() => {
          const breakWarning: TimeoutWarning = {
            minutes: 0,
            message: `You've been active for ${breakIntervalMinutes} minutes. Consider taking a break!`,
            shown: false,
          };
          setWarnings((prev) => [...prev, breakWarning]);
          lastBreakRef.current = Date.now();
          
          // Show notification
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Break Reminder', {
              body: breakWarning.message,
              icon: '/favicon.ico',
            });
          }
          
          scheduleNextBreak();
        }, timeUntilBreak) as any;
      } else {
        lastBreakRef.current = Date.now();
        scheduleNextBreak();
      }
    };

    scheduleNextBreak();
    lastBreakRef.current = Date.now();

    return () => {
      if (breakTimeoutRef.current) {
        clearTimeout(breakTimeoutRef.current);
      }
    };
  }, [breakReminders, breakIntervalMinutes]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const dismissWarning = useCallback((index: number) => {
    setWarnings((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const extendSession = useCallback(() => {
    sessionStartRef.current = Date.now();
    warningShownRef.current.clear();
    setWarnings([]);
  }, []);

  const skipBreak = useCallback(() => {
    lastBreakRef.current = Date.now();
    if (breakTimeoutRef.current) {
      clearTimeout(breakTimeoutRef.current);
    }
    const intervalMs = breakIntervalMinutes * 60 * 1000;
    setNextBreak(Date.now() + intervalMs);
  }, [breakIntervalMinutes]);

  return {
    warnings,
    nextBreak,
    dismissWarning,
    extendSession,
    skipBreak,
    extendedTimeEnabled,
    extendedTimeMultiplier,
  };
};

