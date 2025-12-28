
'use client';

import React, { useEffect, useRef } from 'react';
import { attachSpeechEvents } from '../../lib/clientTTS';
import { useSpeech } from '../../SpeechProvider';

const ClientTTSDemo: React.FC = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { isTTSActive } = useSpeech();

  // Use ref to track isTTSActive to avoid closure issues
  const isTTSActiveRef = useRef(isTTSActive);
  useEffect(() => {
    isTTSActiveRef.current = isTTSActive;
  }, [isTTSActive]);

  useEffect(() => {
    let cleanupButton: (() => void) | undefined;
    let cleanupText: (() => void) | undefined;
    let cleanupHeading: (() => void) | undefined;

    // Create getter function that reads from ref to always get current value
    const getIsActive = () => isTTSActiveRef.current;

    if (buttonRef.current) {
      cleanupButton = attachSpeechEvents(buttonRef.current, 'This is a demo button. Click me to see an action.', getIsActive);
    }
    if (textRef.current) {
      cleanupText = attachSpeechEvents(textRef.current, 'This is a paragraph of text that will be read aloud on hover or focus.', getIsActive);
    }
    if (headingRef.current) {
      cleanupHeading = attachSpeechEvents(headingRef.current, 'Welcome to the Client Text to Speech Demo.', getIsActive);
    }

    return () => {
      cleanupButton?.();
      cleanupText?.();
      cleanupHeading?.();
    };
  }, [isTTSActive]);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '600px', margin: '20px auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <h2 ref={headingRef} tabIndex={0} style={{ textAlign: 'center', marginBottom: '10px', cursor: 'pointer' }}>
        Client Text to Speech Demo
      </h2>
      <p ref={textRef} tabIndex={0} style={{ cursor: 'pointer' }}>
        This component demonstrates client-side text-to-speech using the Web Speech API.
        Hover over or focus on elements with speech events attached to hear their descriptions.
      </p>
      <button
        ref={buttonRef}
        tabIndex={0}
        onClick={() => alert('Button clicked!')}
        style={{
          padding: '10px 15px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          alignSelf: 'center',
          width: 'fit-content',
        }}
      >
        Hover or Focus Me
      </button>
      <p>
        **Note:** For a real application, you would attach these events to all relevant interactive elements,
        using their `aria-label`, `alt` text, or `textContent` as the `textToSpeak`.
        Ensure proper `tabIndex` for keyboard accessibility.
      </p>
    </div>
  );
};

export default ClientTTSDemo;
