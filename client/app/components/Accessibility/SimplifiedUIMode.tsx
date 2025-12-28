'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { HelpCircle, X, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAccessibility } from '../../contexts/AccessibilityProvider';

interface Step {
  id: string;
  title: string;
  description: string;
  selector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const defaultSteps: Step[] = [
  {
    id: 'welcome',
    title: 'Welcome to AccessEdu',
    description: 'This step-by-step guide will help you navigate the platform. Click next to continue.',
  },
  {
    id: 'navigation',
    title: 'Navigation',
    description: 'Use the header navigation to access different sections: Home, Courses, Profile, and more.',
    selector: 'header nav',
    position: 'bottom',
  },
  {
    id: 'search',
    title: 'Search Courses',
    description: 'Use the search bar to find courses by title, topic, or instructor.',
    selector: 'input[type="search"]',
    position: 'bottom',
  },
  {
    id: 'accessibility',
    title: 'Accessibility Settings',
    description: 'Click the settings button to customize accessibility features for your needs.',
    selector: '[aria-label*="accessibility" i]',
    position: 'left',
  },
];

export const StepByStepGuidance: React.FC = () => {
  const { stepByStepGuidance, updateSetting } = useAccessibility();
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const toastIdRef = useRef<string | null>(null);

  if (!stepByStepGuidance) {
    return null;
  }

  const step = defaultSteps[currentStep];
  const canGoNext = currentStep < defaultSteps.length - 1;
  const canGoPrev = currentStep > 0;

  const handleNext = useCallback(() => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
    
    if (currentStep < defaultSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsActive(false);
      updateSetting('stepByStepGuidance', false);
      toast.success('Step-by-step guide completed!', {
        icon: '✅',
        duration: 3000,
      });
    }
  }, [currentStep, updateSetting]);

  const handlePrev = useCallback(() => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
    setIsActive(false);
    updateSetting('stepByStepGuidance', false);
  }, [updateSetting]);

  if (!isActive) {
    return (
      <button
        onClick={() => setIsActive(true)}
        className="fixed bottom-20 right-4 z-50 p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Start step-by-step guidance"
        title="Start Step-by-Step Guide"
      >
        <HelpCircle className="w-6 h-6" />
      </button>
    );
  }

  // Show toast notification for current step
  useEffect(() => {
    if (!isActive || !step) {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      return;
    }

    // Dismiss previous toast
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
    }

    // Scroll element into view if it has a selector
    if (step.selector) {
      const element = document.querySelector(step.selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Show toast with step information
    const toastId = toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-bold text-base text-white mb-1">
                {step.title}
              </h3>
              <p className="text-sm text-gray-200 leading-relaxed">
                {step.description}
              </p>
            </div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleSkip();
              }}
              className="p-1 rounded hover:bg-white/20 transition-colors flex-shrink-0"
              aria-label="Close guidance"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/20">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  handlePrev();
                }}
                disabled={!canGoPrev}
                className="p-2 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous step"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <span className="text-xs text-white/80">
                Step {currentStep + 1} of {defaultSteps.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  handleSkip();
                }}
                className="px-3 py-1.5 text-xs rounded bg-white/10 hover:bg-white/20 transition-colors text-white"
              >
                Skip
              </button>
              <button
                onClick={() => {
                  handleNext();
                }}
                className="px-3 py-1.5 text-xs rounded bg-white hover:bg-gray-100 transition-colors text-purple-600 font-medium"
              >
                {canGoNext ? (
                  <>
                    Next <ChevronRight className="w-4 h-4 inline ml-1" />
                  </>
                ) : (
                  'Finish'
                )}
              </button>
            </div>
          </div>
        </div>
      ),
      {
        duration: Infinity, // Keep open until user interacts
        icon: '📚',
        style: {
          background: '#9333ea',
          color: '#fff',
          maxWidth: '450px',
          padding: '16px',
        },
      }
    );
    
    toastIdRef.current = toastId;
  }, [isActive, currentStep, step, canGoNext, canGoPrev, handleNext, handlePrev, handleSkip]);

  return (
    <>
      {/* Highlight element if it has a selector */}
      {isActive && step?.selector && (
        <EffectHighlighter 
          selector={step.selector}
          onCleanup={() => {
            const existingHighlight = document.querySelector('.step-highlight');
            if (existingHighlight) {
              existingHighlight.remove();
            }
          }}
        />
      )}
    </>
  );
};

// Helper component to handle element highlighting
const EffectHighlighter: React.FC<{ selector: string; onCleanup: () => void }> = ({ selector, onCleanup }) => {
  useEffect(() => {
    const element = document.querySelector(selector);
    if (!element) {
      onCleanup();
      return;
    }

    const rect = element.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // Highlight element
    const highlight = document.createElement('div');
    highlight.className = 'step-highlight';
    highlight.style.cssText = `
      position: absolute;
      top: ${rect.top + scrollY}px;
      left: ${rect.left + scrollX}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border: 3px solid #9333ea;
      border-radius: 8px;
      pointer-events: none;
      z-index: 9996;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
    `;
    document.body.appendChild(highlight);

    return () => {
      onCleanup();
    };
  }, [selector, onCleanup]);

  return null;
};

