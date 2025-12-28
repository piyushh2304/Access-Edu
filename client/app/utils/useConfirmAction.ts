'use client';

import { useState, useCallback, useEffect } from 'react';
import { useConfirmationDialog } from '../hooks/useConfirmationDialog';
import { ConfirmationDialog } from '../components/Accessibility/ConfirmationDialog';
import { useAccessibility } from '../contexts/AccessibilityProvider';

/**
 * Hook to confirm critical actions
 * Usage: const confirm = useConfirmAction();
 * const confirmed = await confirm('Delete Course', 'Are you sure you want to delete this course? This action cannot be undone.', { variant: 'danger' });
 * if (confirmed) { deleteCourse(); }
 */
export const useConfirmAction = () => {
  const { confirmationDialogs } = useAccessibility();
  const { confirm, dialog } = useConfirmationDialog();

  const confirmAction = useCallback(async (
    title: string,
    message: string,
    options?: {
      variant?: 'default' | 'danger' | 'warning';
      confirmText?: string;
      cancelText?: string;
    }
  ): Promise<boolean> => {
    if (!confirmationDialogs) {
      // If confirmation dialogs are disabled, always return true
      return true;
    }

    return confirm({
      title,
      message,
      ...options,
    });
  }, [confirmationDialogs, confirm]);

  return {
    confirmAction,
    dialog: dialog && (
      <ConfirmationDialog
        {...dialog}
      />
    ),
  };
};

