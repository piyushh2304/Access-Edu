
// client/lib/clientTTS.ts

let speechVoice: SpeechSynthesisVoice | null = null;

// Male voice name patterns (common male voices across different browsers)
const MALE_VOICE_PATTERNS = [
  'Alex', 'Daniel', 'Mark', 'David', 'Tom', 'James', 'Michael', 'John',
  'Google UK English Male', 'Microsoft David', 'Microsoft Mark',
  'Male', 'en-GB-male', 'en-US-male'
];

// Function to find a male voice
const getMaleVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
  // Try to find a male voice by name patterns
  for (const pattern of MALE_VOICE_PATTERNS) {
    const voice = voices.find(v =>
      v.name.toLowerCase().includes(pattern.toLowerCase()) &&
      v.lang.startsWith('en')
    );
    if (voice) {
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
    return maleVoice;
  }

  // Last resort: use first English voice
  return voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
};

// Function to initialize the speech synthesis and select a male voice
const initializeSpeech = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Web Speech API not supported in this browser or environment.');
    return;
  }

  if (!speechVoice) {
    const voices = window.speechSynthesis.getVoices();
    // Try to find a male English voice
    speechVoice = getMaleVoice(voices);
  }
};

// Ensure voices are loaded, as they might not be immediately available
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    initializeSpeech();
  };
  initializeSpeech(); // Initial call in case voices are already loaded
}


export const speakText = (text: string) => {
  if (!window.speechSynthesis) {
    console.warn('Speech synthesis not initialized or supported.');
    return;
  }

  // Stop any ongoing speech to prevent overlapping and clear queue
  window.speechSynthesis.cancel();

  // Create a fresh utterance instance every time to avoid audio "stuck" bugs
  const utterance = new SpeechSynthesisUtterance(text);

  if (speechVoice) {
    utterance.voice = speechVoice;
  }

  // Settings for "loud and clear"
  utterance.rate = 1.1; // Slightly faster for snappier feel
  utterance.pitch = 1; // Normal pitch
  utterance.volume = 1; // Max volume

  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// Utility function to attach speech on hover/focus
// isActiveGetter: a function that returns the current active state (to avoid closure issues)
export const attachSpeechEvents = (
  element: HTMLElement,
  textToSpeak: string,
  isActive: boolean | (() => boolean) = true
) => {
  if (!element || !textToSpeak) return null;

  // Normalize isActive to a getter function
  const getIsActive = typeof isActive === 'function' ? isActive : () => isActive;

  const handleSpeak = () => {
    // Always check the current active state (not a captured closure value)
    // This ensures speech-on-hover respects the toggle button state even if it changes
    if (getIsActive()) {
      speakText(textToSpeak);
    }
  };

  const handleStop = () => stopSpeaking();

  // Always attach listeners - they will check isActive dynamically before speaking
  // This way, if isActive changes, the handlers will respect the new state
  element.addEventListener('mouseenter', handleSpeak);
  element.addEventListener('focus', handleSpeak); // For keyboard navigation
  element.addEventListener('mouseleave', handleStop);
  element.addEventListener('blur', handleStop); // For keyboard navigation

  // Return a cleanup function
  return () => {
    element.removeEventListener('mouseenter', handleSpeak);
    element.removeEventListener('focus', handleSpeak);
    element.removeEventListener('mouseleave', handleStop);
    element.removeEventListener('blur', handleStop);
  };
};
