'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSpeech } from '../SpeechProvider';

const CONFIDENCE_THRESHOLD = 0.5;

interface VoiceAuthOptions {
  isActive: boolean;
  onFieldFilled?: (name: string, value: string) => void;
  onSubmit?: () => void;
  onError?: (msg: string) => void;
}

interface Field {
  id: string;
  name: string;
  label: string;
  element: HTMLInputElement;
}

export function useVoiceAuth({
  isActive,
  onFieldFilled,
  onSubmit,
  onError,
}: VoiceAuthOptions) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartingRef = useRef(false);

  const [listening, setListening] = useState(false);
  const [activeField, setActiveField] = useState<Field | null>(null);

  const { speak } = useSpeech();

  /* -------------------- Helpers -------------------- */

  const getFields = useCallback((): Field[] => {
    return Array.from(
      document.querySelectorAll<HTMLInputElement>('input')
    )
      .filter(el => !el.disabled)
      .map(el => ({
        id: el.id || el.name,
        name: el.name,
        label:
          document
            .querySelector(`label[for="${el.id}"]`)
            ?.textContent?.toLowerCase() || el.name,
        element: el,
      }));
  }, []);

  const focusField = (field: Field) => {
    field.element.focus();
    field.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setActiveField(field);
    speak(`Say value for ${field.label}`);
  };

  const fillField = (field: Field, value: string) => {
    field.element.value = value;
    field.element.dispatchEvent(new Event('input', { bubbles: true }));
    field.element.dispatchEvent(new Event('change', { bubbles: true }));
    onFieldFilled?.(field.name, value);
    speak(`${field.label} filled`);
  };

  /* ---------------- Speech Handler ---------------- */

  const handleResult = useCallback(
    (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1][0];
      if (result.confidence < CONFIDENCE_THRESHOLD) return;

      const text = result.transcript.toLowerCase().trim();
      console.log('🎤 Voice:', text);

      if (text.includes('submit')) {
        speak('Submitting form');
        onSubmit?.();
        return;
      }

      if (!activeField) {
        const fields = getFields();
        const field = fields.find(f => text.includes(f.name));
        if (field) focusField(field);
        return;
      }

      fillField(
        activeField,
        text.replace(/\b(at)\b/g, '@').replace(/\b(dot)\b/g, '.')
      );
      setActiveField(null);
    },
    [activeField, getFields, onSubmit]
  );

  /* ---------------- Lifecycle ---------------- */

  useEffect(() => {
    if (!isActive) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setListening(false);
      return;
    }

    const SR =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SR) {
      onError?.('Speech recognition not supported');
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.lang = 'en-US';

    // Track if a fatal error occurred (like permission denied) to prevent restart loop
    let fatalError = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      setListening(false);
      if (isActive && !restartingRef.current && !fatalError) {
        restartingRef.current = true;
        setTimeout(() => {
          // Check isActive again in case it changed during timeout
          if (isActive) {
            try {
              recognition.start();
            } catch (e) {
              console.error("Failed to restart speech recognition", e);
            }
          }
          restartingRef.current = false;
        }, 500);
      }
    };

    recognition.onerror = e => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        fatalError = true;
      }
      if (e.error !== 'no-speech') {
        onError?.(e.error);
      }
    };

    recognition.onresult = handleResult;

    try {
      recognition.start();
    } catch (e) {
      console.error("Speech recognition start failed", e);
    }

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [isActive, handleResult]);

  return {
    listening,
    focusFieldByName: (name: string) => {
      const field = getFields().find(f => f.name === name);
      if (field) focusField(field);
    },
  };
}
