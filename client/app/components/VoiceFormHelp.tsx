"use client";
import React, { FC } from 'react';
import { useSpeech } from '../SpeechProvider';
import { Mic } from 'lucide-react';

type Props = {
  formType?: 'login' | 'signup' | 'profile' | 'password';
};

const VoiceFormHelp: FC<Props> = ({ formType = 'login' }) => {
  const { isVoiceControlActive, isFormFillingActive, isListeningForInput, currentFieldId } = useSpeech();

  if (!isVoiceControlActive || !isFormFillingActive) {
    return null;
  }

  const getFieldExamples = () => {
    switch (formType) {
      case 'login':
        return ['fill email', 'fill password', 'go to email', 'go to password'];
      case 'signup':
        return ['fill name', 'fill email', 'fill password'];
      case 'profile':
        return ['fill full name', 'go to full name'];
      case 'password':
        return ['fill old password', 'fill new password', 'fill confirm password'];
      default:
        return ['fill email', 'fill password'];
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-gray-700 max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <Mic className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Voice Form Filling Active
        </h3>
      </div>
      
      {isListeningForInput && currentFieldId && (
        <div className="mb-3 p-2 bg-purple-100 dark:bg-purple-900/30 rounded border border-purple-300 dark:border-purple-700">
          <p className="text-xs text-purple-800 dark:text-purple-200">
            <strong>Listening for:</strong> {currentFieldId}
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            Speak your input now, or say "cancel" to stop
          </p>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Try saying:
        </p>
        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          {getFieldExamples().slice(0, 3).map((example, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="text-purple-600 dark:text-purple-400">•</span>
              <span className="font-mono">"{example}"</span>
            </li>
          ))}
        </ul>
        
        <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Other commands: <strong>"next field"</strong>, <strong>"submit form"</strong>, <strong>"cancel"</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceFormHelp;

