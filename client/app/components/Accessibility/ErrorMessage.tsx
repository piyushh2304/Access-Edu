'use client';

import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useAccessibility } from '../../contexts/AccessibilityProvider';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onClose,
  variant = 'error',
}) => {
  const { clearErrorMessages } = useAccessibility();

  if (!clearErrorMessages) {
    // If clear error messages is disabled, use simple display
    return (
      <div className="text-red-500 text-sm">
        {message}
      </div>
    );
  }

  const variantStyles = {
    error: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      border: 'border-red-400 dark:border-red-700',
      text: 'text-red-900 dark:text-red-100',
      icon: 'text-red-600 dark:text-red-400',
    },
    warning: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      border: 'border-yellow-400 dark:border-yellow-700',
      text: 'text-yellow-900 dark:text-yellow-100',
      icon: 'text-yellow-600 dark:text-yellow-400',
    },
    info: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      border: 'border-blue-400 dark:border-blue-700',
      text: 'text-blue-900 dark:text-blue-100',
      icon: 'text-blue-600 dark:text-blue-400',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      role="alert"
      className={`${style.bg} ${style.border} border-l-4 rounded-lg p-4 mb-4 flex items-start gap-3`}
    >
      <AlertCircle className={`w-5 h-5 ${style.icon} flex-shrink-0 mt-0.5`} aria-hidden="true" />
      <div className="flex-1">
        <p className={`${style.text} font-medium`}>
          {message}
        </p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`p-1 rounded hover:${style.bg} transition-colors ${style.icon}`}
          aria-label="Close error message"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

