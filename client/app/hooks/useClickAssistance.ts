'use client';

import { useEffect, useRef } from 'react';
import { useAccessibility } from '../contexts/AccessibilityProvider';

export const useClickAssistance = () => {
  const { largerClickableAreas, doubleClickPrevention } = useAccessibility();
  const lastClickRef = useRef<{ element: HTMLElement; time: number } | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!largerClickableAreas && !doubleClickPrevention) return;

    const handleClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;
      
      // Double-click prevention
      if (doubleClickPrevention) {
        const now = Date.now();
        const lastClick = lastClickRef.current;

        if (
          lastClick &&
          lastClick.element === target &&
          now - lastClick.time < 500 // 500ms threshold
        ) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        }

        lastClickRef.current = { element: target, time: now };

        // Clear after threshold
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
        }
        clickTimeoutRef.current = setTimeout(() => {
          lastClickRef.current = null;
        }, 500);
      }
    };

    // Use capture phase to prevent double-clicks early
    document.addEventListener('click', handleClick, true);
    document.addEventListener('touchstart', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('touchstart', handleClick, true);
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, [largerClickableAreas, doubleClickPrevention]);
};

