'use client';

import React, { useState } from 'react';
import { Info, X, Zap, MousePointer, Keyboard, BookOpen, Layout, Clock, Shield, FileText, Eye, Volume2 } from 'lucide-react';
import { useSpeech } from '../../SpeechProvider';

interface AccessibilityFeaturesDescriptionProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityFeaturesDescription: React.FC<AccessibilityFeaturesDescriptionProps> = ({ isOpen, onClose }) => {
  const { speak, isTTSActive } = useSpeech();

  const features = [
    {
      icon: Volume2,
      category: 'Speech & Voice',
      items: [
        {
          title: 'Speech on Hover',
          description: 'Automatically reads aloud the text when you hover over elements. Toggle on/off using the button in the top-right corner.'
        },
        {
          title: 'Voice Control',
          description: 'Control navigation, scrolling, and actions using voice commands. Say "open courses", "scroll down", "open profile", etc.'
        },
        {
          title: 'Voice Authentication',
          description: 'Complete login and signup forms using only voice commands. Say "login" to start, then provide your email and password verbally.'
        },
        {
          title: 'Audio Feedback',
          description: 'Get spoken confirmations for all voice commands. The app announces actions before they execute for better awareness.'
        }
      ]
    },
    {
      icon: Keyboard,
      category: 'Keyboard Shortcuts',
      items: [
        {
          title: 'Full Keyboard Navigation',
          description: 'Navigate the entire application using only the keyboard. Tab through elements, press Enter to activate, Escape to close.'
        },
        {
          title: 'Customizable Shortcuts',
          description: 'Customize keyboard shortcuts for any action. Open accessibility settings to view and modify available shortcuts.'
        },
        {
          title: 'Sticky Keys Support',
          description: 'Press modifier keys (Ctrl, Shift, Alt) sequentially instead of simultaneously. Useful for users with limited dexterity.'
        },
        {
          title: 'Keyboard Shortcuts Help',
          description: 'View a complete list of all available keyboard shortcuts in the accessibility settings panel.'
        }
      ]
    },
    {
      icon: Zap,
      category: 'Motion & Animations',
      items: [
        {
          title: 'Reduced Motion',
          description: 'Automatically respects your system preferences for reduced motion. Disables or reduces animations for users sensitive to motion.'
        },
        {
          title: 'Disable Animations',
          description: 'Option to completely disable all animations and transitions throughout the application.'
        },
        {
          title: 'Simplified Transitions',
          description: 'Use simpler, less distracting transitions between screens and states.'
        }
      ]
    },
    {
      icon: MousePointer,
      category: 'Click & Tap Assistance',
      items: [
        {
          title: 'Larger Clickable Areas',
          description: 'Increases the minimum size of clickable elements, making them easier to tap or click for users with motor impairments.'
        },
        {
          title: 'Sticky Keys',
          description: 'Allows modifier keys to be pressed one at a time instead of simultaneously for keyboard shortcuts.'
        },
        {
          title: 'Double-Click Prevention',
          description: 'Prevents accidental double-clicks by ignoring rapid successive clicks within 500 milliseconds.'
        }
      ]
    },
    {
      icon: BookOpen,
      category: 'Reading Mode',
      items: [
        {
          title: 'Distraction-Free Reading',
          description: 'Removes sidebars, navigation, and other distractions to provide a clean reading experience.'
        },
        {
          title: 'Focus Mode',
          description: 'Hides non-essential elements and highlights the content you\'re reading. Can be combined with reading mode.'
        },
        {
          title: 'Reading Ruler',
          description: 'Draggable ruler or line guide to help you track text while reading, reducing eye strain and improving focus.'
        }
      ]
    },
    {
      icon: Layout,
      category: 'Simplified UI',
      items: [
        {
          title: 'Minimal Interface',
          description: 'Switch to a simplified, minimal interface with only essential elements visible.'
        },
        {
          title: 'Hide Non-Essential Elements',
          description: 'Hide decorative elements, advertisements, and other non-critical content to reduce visual clutter.'
        },
        {
          title: 'Step-by-Step Guidance',
          description: 'Get interactive, step-by-step guidance for complex tasks. Highlights elements and provides instructions.'
        }
      ]
    },
    {
      icon: Clock,
      category: 'Time Management',
      items: [
        {
          title: 'Extended Time',
          description: 'Extend time limits for assessments and activities (1.5x, 2x, or custom multiplier).'
        },
        {
          title: 'Session Timeout Warnings',
          description: 'Get notifications before your session times out, giving you time to save your work or extend the session.'
        },
        {
          title: 'Break Reminders',
          description: 'Receive periodic reminders to take breaks, helping prevent fatigue during long study sessions.'
        }
      ]
    },
    {
      icon: Shield,
      category: 'Error Prevention',
      items: [
        {
          title: 'Confirmation Dialogs',
          description: 'Require confirmation for critical actions like deleting content, preventing accidental data loss.'
        },
        {
          title: 'Undo/Redo',
          description: 'Undo and redo your actions throughout the application. Access via keyboard shortcuts (Ctrl+Z, Ctrl+Y).'
        },
        {
          title: 'Clear Error Messages',
          description: 'Display clear, descriptive error messages that explain what went wrong and how to fix it.'
        }
      ]
    },
    {
      icon: FileText,
      category: 'Content Accessibility',
      items: [
        {
          title: 'Content Enhancements',
          description: 'Automatic content accessibility enhancements including proper heading structure, alt text support, and semantic markup.'
        }
      ]
    }
  ];

  if (!isOpen) return null;

  const handleDescriptionHover = (text: string) => {
    if (isTTSActive) {
      speak(text);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="accessibility-features-title"
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Info className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 id="accessibility-features-title" className="text-2xl font-bold text-gray-900 dark:text-white">
                Accessibility Features
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close accessibility features description"
              onMouseEnter={() => handleDescriptionHover('Close button')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              AccessEdu provides comprehensive accessibility features to ensure everyone can learn effectively. 
              All features can be configured in the Accessibility Settings panel.
            </p>

            {features.map((category, categoryIndex) => {
              const IconComponent = category.icon;
              return (
                <section key={categoryIndex} className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IconComponent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category.category}</h3>
                  </div>
                  <div className="space-y-3 pl-7">
                    {category.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                        onMouseEnter={() => handleDescriptionHover(`${item.title}. ${item.description}`)}
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Access the Accessibility Settings panel (Ctrl+Shift+A) to enable or customize these features.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

