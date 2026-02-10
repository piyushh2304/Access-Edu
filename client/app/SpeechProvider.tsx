// client/app/SpeechProvider.tsx
'use client'; // This directive is for Next.js App Router to mark it as a Client Component

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import useMurfTTS from './hooks/useMurfTTS';
import { useVoiceNavigation } from './hooks/useVoiceNavigation'; // Import the new hook

interface SpeechContextType {
  isTTSActive: boolean;
  toggleTTS: () => void;
  speak: (text: string, options?: any) => void;
  stop: () => void;
  isLoading: boolean;
  error: string | null;
  isVoiceControlActive: boolean; // New state for voice control
  toggleVoiceControl: () => void; // New function to toggle voice control
  isVoiceListening: boolean; // New state for voice listening status
  isVoiceAuthActive: boolean; // New state for voice authentication
  toggleVoiceAuth: () => void; // New function to toggle voice authentication
  setIsVoiceAuthActive: (active: boolean) => void; // Explicit setter for handoff
}

const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

export const SpeechProvider = ({ children }: { children: ReactNode }) => {
  const [isTTSActive, setIsTTSActive] = useState(true); // Enable TTS by default
  const [isVoiceControlActive, setIsVoiceControlActive] = useState(true); // Enable voice control by default for navigation
  const [isVoiceAuthActive, setIsVoiceAuthActive] = useState(false); // New state for voice authentication
  const { speak, stop, isLoading, error } = useMurfTTS();

  const toggleTTS = useCallback(() => {
    setIsTTSActive(prev => {
      if (prev) {
        stop(); // Stop any ongoing speech when turning off TTS
      }
      return !prev;
    });
  }, [stop]);

  const toggleVoiceControl = useCallback(() => {
    setIsVoiceControlActive(prev => !prev);
  }, []);

  const toggleVoiceAuth = useCallback(() => {
    setIsVoiceAuthActive(prev => !prev);
  }, []);

  const handleCommandRecognized = useCallback((command: string) => {
    console.log("Command recognized in provider:", command);
    // Optionally, you could provide visual feedback or speak a confirmation
  }, []);

  const handleListeningStatusChange = useCallback((listening: boolean) => {
    // console.log("Voice listening status:", listening);
  }, []);

  // Import usePathname to track current page
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  const { isListening: isVoiceListening } = useVoiceNavigation({
    // Pause global navigation on profile page to allow specialized profile voice commands to work without mic conflict
    isActive: isVoiceControlActive && !isVoiceAuthActive && pathname !== '/profile', 
    onCommandRecognized: handleCommandRecognized,
    onListeningStatusChange: handleListeningStatusChange,
    speak, // Pass speak function directly to avoid circular dependency
    isTTSActive, // Pass isTTSActive directly to avoid circular dependency
  });

  // Removed global mouseover handler - speech-on-hover now only works on elements 
  // that explicitly use the useSpeechOnHover hook

  // Listen for voice-open-form events to auto-activate voice auth
  useEffect(() => {
    const handleVoiceOpenForm = (event: CustomEvent) => {
      setIsVoiceAuthActive(true);
      if (!isVoiceControlActive) {
        setIsVoiceControlActive(true);
      }
      console.log('🎤 Voice authentication activated via voice command');
    };

    window.addEventListener('voice-open-form', handleVoiceOpenForm as EventListener);
    return () => {
      window.removeEventListener('voice-open-form', handleVoiceOpenForm as EventListener);
    };
  }, [isVoiceControlActive]);

  return (
    <SpeechContext.Provider value={{
      isTTSActive,
      toggleTTS,
      speak,
      stop,
      isLoading,
      error,
      isVoiceControlActive, // Provide new state
      toggleVoiceControl,   // Provide new function
      isVoiceListening,    // Provide new listening status
      isVoiceAuthActive,   // Provide voice auth state
      toggleVoiceAuth,     // Provide voice auth toggle
      setIsVoiceAuthActive, // Provide setter
    }}>
      {children}
    </SpeechContext.Provider>
  );
};

export const useSpeech = () => {
  const context = useContext(SpeechContext);
  if (context === undefined) {
    throw new Error('useSpeech must be used within a SpeechProvider');
  }
  return context;
};
