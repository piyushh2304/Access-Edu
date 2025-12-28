'use client';

import { useState, useCallback } from 'react';
import { useAccessibility } from '../contexts/AccessibilityProvider';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'warning';
}

export const useConfirmationDialog = () => {
  const { confirmationDialogs } = useAccessibility();
  const [dialog, setDialog] = useState<ConfirmOptions & { isOpen: boolean; onConfirm: () => void; onCancel: () => void } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    if (!confirmationDialogs) {
      // If confirmation dialogs are disabled, always return true
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      setDialog({
        ...options,
        isOpen: true,
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setDialog(null);
          resolve(false);
        },
      });
    });
  }, [confirmationDialogs]);

  return {
    confirm,
    dialog,
  };
};

