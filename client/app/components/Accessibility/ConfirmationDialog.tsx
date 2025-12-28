'use client';

import React from 'react';
import { AlertTriangle, X, Check, Info } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    default: {
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-700',
      border: 'border-blue-500',
    },
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-600 dark:text-red-400',
      button: 'bg-red-600 hover:bg-red-700',
      border: 'border-red-500',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      button: 'bg-yellow-600 hover:bg-yellow-700',
      border: 'border-yellow-500',
    },
  };

  const style = variantStyles[variant];
  const Icon = style.icon;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 border-2 ${style.border}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <Icon className={`w-6 h-6 ${style.iconColor} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <h3 id="confirmation-title" className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {message}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg ${style.button} text-white transition-colors flex items-center gap-2`}
            >
              <Check className="w-4 h-4" />
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

