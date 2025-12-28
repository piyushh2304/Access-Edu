'use client';

import React, { useEffect, useState, useRef } from 'react';
import { BookOpen, Eye, EyeOff, Move } from 'lucide-react';
import { useAccessibility } from '../../contexts/AccessibilityProvider';

export const ReadingMode: React.FC = () => {
  const { readingModeEnabled, focusModeEnabled, readingRulerEnabled, updateSetting } = useAccessibility();
  const [rulerPosition, setRulerPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const rulerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!readingRulerEnabled) {
      setRulerPosition(0);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const position = (e.clientY / window.innerHeight) * 100;
        setRulerPosition(Math.max(0, Math.min(100, position)));
      } else {
        const position = (e.clientY / window.innerHeight) * 100;
        setRulerPosition(Math.max(0, Math.min(100, position)));
      }
    };

    const handleMouseDown = () => {
      setIsDragging(true);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [readingRulerEnabled, isDragging]);

  if (!readingModeEnabled && !focusModeEnabled && !readingRulerEnabled) {
    return null;
  }

  return (
    <>
      {/* Reading Ruler */}
      {readingRulerEnabled && (
        <div
          ref={rulerRef}
          className="fixed left-0 right-0 pointer-events-none z-[9997] transition-opacity"
          style={{
            top: `${rulerPosition}vh`,
            height: '3px',
            background: 'rgba(147, 51, 234, 0.6)',
            boxShadow: '0 0 10px rgba(147, 51, 234, 0.8)',
            cursor: 'move',
            pointerEvents: isDragging ? 'auto' : 'none',
          }}
        >
          <div
            className="absolute -left-6 top-1/2 -translate-y-1/2 pointer-events-auto cursor-move p-1 rounded bg-purple-600 text-white opacity-70 hover:opacity-100 transition-opacity"
            style={{ pointerEvents: 'auto' }}
            aria-label="Reading ruler - drag to move"
          >
            <Move className="w-3 h-3" />
          </div>
        </div>
      )}

      {/* Focus Mode Overlay - hides sidebars and navigation */}
      {focusModeEnabled && (
        <style>{`
          .focus-mode header,
          .focus-mode nav,
          .focus-mode aside,
          .focus-mode footer {
            display: none !important;
          }
          
          .focus-mode main {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
          }
        `}</style>
      )}

      {/* Reading Mode Styles */}
      {readingModeEnabled && (
        <style>{`
          .reading-mode {
            font-size: 1.25rem;
            line-height: 1.8;
            max-width: 65ch;
            margin: 0 auto;
          }
          
          .reading-mode article,
          .reading-mode main > div,
          .reading-mode .course-content {
            max-width: 65ch;
            margin: 0 auto;
            padding: 2rem;
            background: var(--background);
          }
          
          .reading-mode img,
          .reading-mode video,
          .reading-mode iframe {
            max-width: 100%;
            height: auto;
          }
          
          .reading-mode h1,
          .reading-mode h2,
          .reading-mode h3,
          .reading-mode h4,
          .reading-mode h5,
          .reading-mode h6 {
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-weight: 600;
          }
          
          .reading-mode p {
            margin-bottom: 1.5rem;
          }
        `}</style>
      )}
    </>
  );
};
