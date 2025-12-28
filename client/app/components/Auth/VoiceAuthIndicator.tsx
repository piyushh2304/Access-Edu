'use client';

import React, { useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';
import toast from 'react-hot-toast';
import { useVoiceAuth } from '../../hooks/useVoiceAuth';
import { useSpeech } from '../../SpeechProvider';

interface VoiceAuthIndicatorProps {
  isActive: boolean;
}

export const VoiceAuthIndicator: React.FC<VoiceAuthIndicatorProps> = ({ isActive }) => {
  const { isListening, currentField, isFilling } = useVoiceAuth({
    isActive,
    onFieldFilled: (fieldName, value) => {
      console.log(`✅ Filled ${fieldName} with: ${value}`);
      toast.success(`Filled ${fieldName}`, {
        icon: '✅',
        duration: 2000,
      });
    },
    onFormSubmit: () => {
      console.log('✅ Form submitted via voice');
      toast.success('Form submitted via voice', {
        icon: '✅',
        duration: 3000,
      });
    },
    onError: (error) => {
      // Don't show error toasts for "aborted" errors as they're normal when stopping
      if (error && !error.includes('aborted')) {
        console.error('❌ Voice auth error:', error);
        toast.error(error, {
          icon: '❌',
          duration: 4000,
        });
      }
    },
  });

  const { isTTSActive, speak } = useSpeech();
  const toastIdRef = useRef<string | null>(null);

  // Show initial toast when voice auth activates
  useEffect(() => {
    if (isActive && isListening && !toastIdRef.current) {
      const toastId = toast(
        (t) => (
          <div className="flex items-start gap-3">
            <Mic className="w-5 h-5 text-purple-400 animate-pulse flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1 text-white">Voice Authentication Active</h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-2">
                Say "login" or "sign up" to start
              </p>
              <div className="mt-2 pt-2 border-t border-white/20">
                <p className="text-xs font-medium text-white mb-1">Try saying:</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• "Login" or "Sign up"</li>
                  <li>• "Fill email [your email]"</li>
                  <li>• "Fill password [your password]"</li>
                  <li>• "Submit" or "Done"</li>
                </ul>
              </div>
            </div>
          </div>
        ),
        {
          duration: 6000,
          icon: '🎤',
          style: {
            background: '#7c3aed',
            color: '#fff',
            maxWidth: '400px',
            padding: '16px',
          },
        }
      );
      toastIdRef.current = toastId;
    } else if (!isActive && toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
  }, [isActive, isListening]);

  // Update toast when field changes
  useEffect(() => {
    if (isFilling && currentField) {
      const fields = document.querySelectorAll('form input, form select');
      const currentFieldElement = Array.from(fields).find((el: any) => 
        el.id === currentField || el.name === currentField
      );
      const label = currentFieldElement?.closest('form')?.querySelector(`label[for="${currentField}"]`);
      const fieldLabel = label?.textContent || currentField || 'field';

      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }

      const toastId = toast(
        (t) => (
          <div className="flex items-start gap-3">
            <Mic className="w-5 h-5 text-purple-400 animate-pulse flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1 text-white">Listening for Input</h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-2">
                Current field: <strong>{fieldLabel}</strong>
              </p>
              <p className="text-xs text-gray-300">
                Speak your input, or say "next" to skip, "submit" to finish
              </p>
            </div>
          </div>
        ),
        {
          duration: Infinity, // Keep open while filling
          icon: '🎤',
          style: {
            background: '#7c3aed',
            color: '#fff',
            maxWidth: '400px',
            padding: '16px',
          },
        }
      );
      toastIdRef.current = toastId;
    }
  }, [isFilling, currentField]);

  // Provide audio feedback when field changes
  useEffect(() => {
    if (isFilling && currentField && isTTSActive) {
      const fields = document.querySelectorAll('form input, form select');
      const currentFieldElement = Array.from(fields).find((el: any) => 
        el.id === currentField || el.name === currentField
      );
      const label = currentFieldElement?.closest('form')?.querySelector(`label[for="${currentField}"]`);
      const fieldLabel = label?.textContent || currentField || 'field';
      speak(`Please provide ${fieldLabel}`);
    }
  }, [currentField, isFilling, isTTSActive, speak]);

  return null; // Component doesn't render anything, uses toasts
};

