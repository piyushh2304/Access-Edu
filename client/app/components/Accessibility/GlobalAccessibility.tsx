'use client';

import React from 'react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useClickAssistance } from '../../hooks/useClickAssistance';
import { useAccessibility } from '../../contexts/AccessibilityProvider';
import { ReadingMode } from './ReadingMode';
import { StepByStepGuidance } from './SimplifiedUIMode';
import { TimeManagementWarnings } from './TimeManagement';
import { ContentAccessibility } from './ContentAccessibility';
import { useConfirmationDialog } from '../../hooks/useConfirmationDialog';
import { ConfirmationDialog } from './ConfirmationDialog';

/**
 * Global component that initializes accessibility features
 * This should be included once in the app layout
 */
export const GlobalAccessibility: React.FC = () => {
  const { keyboardShortcutsEnabled } = useAccessibility();

  // Initialize global keyboard shortcuts
  useKeyboardShortcuts({
    enabled: keyboardShortcutsEnabled,
  });

  // Apply click assistance features globally
  useClickAssistance();

  // Global confirmation dialog
  const { dialog } = useConfirmationDialog();

  return (
    <>
      <ReadingMode />
      <StepByStepGuidance />
      <TimeManagementWarnings />
      <ContentAccessibility />
      {dialog && (
        <ConfirmationDialog
          isOpen={dialog.isOpen}
          title={dialog.title}
          message={dialog.message}
          confirmText={dialog.confirmText}
          cancelText={dialog.cancelText}
          variant={dialog.variant}
          onConfirm={dialog.onConfirm}
          onCancel={dialog.onCancel}
        />
      )}
    </>
  );
};

