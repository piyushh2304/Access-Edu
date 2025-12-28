import { useEffect, useRef } from 'react';
import { useSpeech } from '../SpeechProvider';

// Male voice name patterns
const MALE_VOICE_PATTERNS = [
  'Alex', 'Daniel', 'Mark', 'David', 'Tom', 'James', 'Michael', 'John',
  'Google UK English Male', 'Microsoft David', 'Microsoft Mark',
  'Male', 'en-GB-male', 'en-US-male'
];

// Cache for the selected male voice
let cachedMaleVoice: SpeechSynthesisVoice | null = null;

// Function to find a male voice
const getMaleVoice = (): SpeechSynthesisVoice | null => {
  if (cachedMaleVoice) {
    return cachedMaleVoice;
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  
  // Try to find a male voice by name patterns
  for (const pattern of MALE_VOICE_PATTERNS) {
    const voice = voices.find(v => 
      v.name.toLowerCase().includes(pattern.toLowerCase()) && 
      v.lang.startsWith('en')
    );
    if (voice) {
      cachedMaleVoice = voice;
      return voice;
    }
  }

  // Fallback: Try to find any English male-sounding voice (avoiding common female names)
  const femaleNames = ['Samantha', 'Karen', 'Victoria', 'Zira', 'Hazel', 'Susan', 'Linda'];
  const maleVoice = voices.find(v => 
    v.lang.startsWith('en') && 
    !femaleNames.some(name => v.name.includes(name))
  );

  if (maleVoice) {
    cachedMaleVoice = maleVoice;
    return maleVoice;
  }

  // Last resort: use first English voice
  const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
  if (englishVoice) {
    cachedMaleVoice = englishVoice;
    return englishVoice;
  }

  return null;
};

const useSpeechOnHover = <T extends HTMLElement>(textToSpeak: string) => {
  const ref = useRef<T>(null);
  const { isTTSActive } = useSpeech();
  // Use a ref to track isTTSActive to avoid closure issues
  const isTTSActiveRef = useRef(isTTSActive);

  // Update ref whenever isTTSActive changes
  useEffect(() => {
    isTTSActiveRef.current = isTTSActive;
  }, [isTTSActive]);

  useEffect(() => {
    // Don't activate if TTS is not active
    if (!isTTSActive) {
      // If TTS is disabled, remove event listeners if they exist
      if (ref.current) {
        // Cleanup will be handled by the return function
      }
      return;
    }

    if (!ref.current || typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    const element = ref.current;
    let utterance: SpeechSynthesisUtterance | null = null;

    const handleMouseEnter = () => {
      // Always check the current value from ref (not closure)
      if (!isTTSActiveRef.current) {
        return;
      }

      // Stop any ongoing speech to prevent overlapping
      window.speechSynthesis.cancel();

      if (textToSpeak) {
        utterance = new SpeechSynthesisUtterance(textToSpeak);
        const maleVoice = getMaleVoice();
        if (maleVoice) {
          utterance.voice = maleVoice;
        }
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        window.speechSynthesis.speak(utterance);
      } else if (element.textContent) {
        utterance = new SpeechSynthesisUtterance(element.textContent);
        const maleVoice = getMaleVoice();
        if (maleVoice) {
          utterance.voice = maleVoice;
        }
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        window.speechSynthesis.speak(utterance);
      }
    };

    const handleMouseLeave = () => {
      if (utterance && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };

    const handleFocus = () => {
      // Also handle focus for keyboard navigation
      handleMouseEnter();
    };

    const handleBlur = () => {
      handleMouseLeave();
    };

    // Only attach listeners if TTS is active
    if (isTTSActive) {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('focus', handleFocus);
      element.addEventListener('mouseleave', handleMouseLeave);
      element.addEventListener('blur', handleBlur);
    }

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('blur', handleBlur);
      if (utterance && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [textToSpeak, isTTSActive]);

  return ref;
};

export default useSpeechOnHover;
export { useSpeechOnHover };