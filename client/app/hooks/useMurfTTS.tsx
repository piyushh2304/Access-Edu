// client/app/hooks/useMurfTTS.tsx
import { useState, useCallback, useRef } from 'react';

const MURF_API_KEY = process.env.NEXT_PUBLIC_MURF_API_KEY; // Assuming NEXT_PUBLIC_ prefix for client-side env vars
const MURF_API_URL = 'https://global.api.murf.ai/v1/speech/stream'; // Using global endpoint

interface MurfTTSOptions {
  voiceId?: string; // Optional: specify a voice ID if needed
  // Add other MURF API parameters as needed, e.g., speed, pitch
}

// Cache for the selected male voice to ensure consistency
let cachedMaleVoice: SpeechSynthesisVoice | null = null;

// Male voice name patterns (common male voices across different browsers)
const MALE_VOICE_PATTERNS = [
  'Alex', 'Daniel', 'Mark', 'David', 'Tom', 'James', 'Michael', 'John',
  'Google UK English Male', 'Microsoft David', 'Microsoft Mark',
  'Male', 'en-GB-male', 'en-US-male'
];

// Function to find and cache a male voice
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

// Fallback to browser's built-in SpeechSynthesis API
const speakWithBrowserTTS = (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Browser SpeechSynthesis API not available.');
    return;
  }

  try {
    // Always stop any ongoing speech first to prevent overlapping
    window.speechSynthesis.cancel();
    
    // Wait a brief moment to ensure cancellation is complete
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get or find the male voice
      const getVoicesAndSpeak = () => {
        const maleVoice = getMaleVoice();
        if (maleVoice) {
          utterance.voice = maleVoice;
        }
        
        utterance.rate = 1; // Normal speed
        utterance.pitch = 1; // Normal pitch
        utterance.volume = 1; // Max volume

        window.speechSynthesis.speak(utterance);
        console.log('Speaking with browser TTS (male voice):', text);
      };

      // Try to get voices immediately
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Refresh cache if voices are available
        cachedMaleVoice = null;
        getVoicesAndSpeak();
      } else {
        // Wait for voices to load
        const onVoicesChanged = () => {
          // Refresh cache when voices load
          cachedMaleVoice = null;
          getVoicesAndSpeak();
          window.speechSynthesis.onvoiceschanged = null; // Remove listener after first use
        };
        
        window.speechSynthesis.onvoiceschanged = onVoicesChanged;
        
        // Fallback: speak anyway after a short delay even if voices aren't loaded
        setTimeout(() => {
          if (!window.speechSynthesis.speaking) {
            cachedMaleVoice = null;
            const maleVoice = getMaleVoice();
            if (maleVoice) {
              utterance.voice = maleVoice;
            }
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 1;
            window.speechSynthesis.speak(utterance);
            console.log('Speaking with browser TTS (fallback, male voice):', text);
          }
        }, 100);
      }
    }, 50); // Small delay to ensure previous speech is cancelled
  } catch (error) {
    console.error('Error with browser TTS:', error);
  }
};

const useMurfTTS = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(async (text: string, options?: MurfTTSOptions) => {
    if (!text.trim()) {
      console.log("Attempted to speak empty text.");
      return; // Don't speak empty text
    }
    
    console.log("Attempting to speak:", text);

    // Always stop any currently playing audio first
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }

    // Always stop any browser TTS to prevent overlapping
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      currentUtteranceRef.current = null;
    }

    // If no Murf API key, use browser TTS as fallback
    if (!MURF_API_KEY) {
      console.log("MURF API Key not set. Using browser TTS fallback.");
      speakWithBrowserTTS(text);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(MURF_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MURF_API_KEY}`,
        },
        body: JSON.stringify({
          text: text,
          voice_id: options?.voiceId || 'en-US-marcus', 
        }),
      });

      console.log("MURF API Response Status:", response.status);

      if (!response.ok) {
        // If Murf API fails, fallback to browser TTS
        console.warn("MURF API failed. Falling back to browser TTS.");
        const errorData = await response.json().catch(() => ({}));
        console.error("MURF API Error Data:", errorData);
        speakWithBrowserTTS(text);
        setIsLoading(false);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.play();
      console.log("Audio playback started with Murf TTS.");

      audio.onended = () => {
        console.log("Audio playback ended.");
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        setIsLoading(false);
      };

      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        // Fallback to browser TTS on audio error
        console.warn("Audio playback failed. Falling back to browser TTS.");
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        speakWithBrowserTTS(text);
        setIsLoading(false);
      };

    } catch (err: any) {
      console.error("Error speaking with MURF TTS:", err);
      // Fallback to browser TTS on error
      console.warn("Murf TTS error. Falling back to browser TTS.");
      speakWithBrowserTTS(text);
      setIsLoading(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      currentUtteranceRef.current = null;
    }
  }, []);

  return { speak, stop, isLoading, error };
};

export default useMurfTTS;
