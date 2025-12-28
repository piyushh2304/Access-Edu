'use client';

import React, { useEffect, useState } from 'react';
import { useAccessibility } from '../../contexts/AccessibilityProvider';

export const SimplifiedUI: React.FC = () => {
  const { simplifiedUIMode, hideNonEssentialElements, stepByStepGuidance, updateSetting } = useAccessibility();
  
  // Listen for keyboard shortcut
  React.useEffect(() => {
    const handleToggle = () => {
      updateSetting('simplifiedUIMode', !simplifiedUIMode);
    };
    window.addEventListener('toggle-simplified-ui', handleToggle);
    return () => window.removeEventListener('toggle-simplified-ui', handleToggle);
  }, [simplifiedUIMode, updateSetting]);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [steps, setSteps] = useState<string[]>([]);

  useEffect(() => {
    if (!simplifiedUIMode) {
      setCurrentStep(null);
      setSteps([]);
      return;
    }

    // Identify interactive elements as steps
    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [tabindex="0"]'
    );
    const stepList: string[] = [];
    interactiveElements.forEach((el, index) => {
      const label = el.getAttribute('aria-label') || 
                   el.textContent?.trim() || 
                   (el as HTMLElement).title ||
                   `Step ${index + 1}`;
      stepList.push(label);
    });
    setSteps(stepList);

    if (stepByStepGuidance && stepList.length > 0) {
      setCurrentStep(0);
    }
  }, [simplifiedUIMode, stepByStepGuidance]);

  useEffect(() => {
    if (!stepByStepGuidance || currentStep === null) return;

    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [tabindex="0"]'
    );

    interactiveElements.forEach((el, index) => {
      const element = el as HTMLElement;
      if (index === currentStep) {
        element.style.outline = '3px solid #9333ea';
        element.style.outlineOffset = '2px';
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        element.style.outline = '';
      }
    });
  }, [stepByStepGuidance, currentStep]);

  if (!simplifiedUIMode) return null;

  return (
    <div className="fixed bottom-20 right-4 z-[9997] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-xs">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Simplified UI Mode</h3>
      
      {stepByStepGuidance && steps.length > 0 && (
        <div className="space-y-2 mb-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Step {currentStep !== null ? currentStep + 1 : 0} of {steps.length}
          </p>
          {currentStep !== null && (
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
              {steps[currentStep]}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => currentStep !== null && setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => currentStep !== null && setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
              className="px-3 py-1 text-sm bg-purple-600 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

