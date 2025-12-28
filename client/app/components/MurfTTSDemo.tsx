
'use client';

import React, { useState } from 'react';
import { generateSpeech } from '../../lib/murfApi';

const MurfTTSDemo: React.FC = () => {
  const [text, setText] = useState<string>('Hello, this is a test of Murf.ai text-to-speech.');
  const [voiceId, setVoiceId] = useState<string>('en-US-natalie'); // Example voice ID
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSpeech = async () => {
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    try {
      const response = await generateSpeech(text, voiceId);
      setAudioUrl(response.audioFile);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '600px', margin: '20px auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Murf.ai Text-to-Speech Demo</h2>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="text-input" style={{ display: 'block', marginBottom: '5px' }}>Text to speak:</label>
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="voice-id-input" style={{ display: 'block', marginBottom: '5px' }}>Voice ID (e.g., en-US-natalie):</label>
        <input
          id="voice-id-input"
          type="text"
          value={voiceId}
          onChange={(e) => setVoiceId(e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>
      <button
        onClick={handleGenerateSpeech}
        disabled={loading || !text || !voiceId}
        style={{
          width: '100%',
          padding: '10px 15px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        {loading ? 'Generating...' : 'Generate Speech'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '15px' }}>Error: {error}</p>}

      {audioUrl && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <h3>Generated Audio:</h3>
          <audio controls src={audioUrl} style={{ width: '100%' }}>
            Your browser does not support the audio element.
          </audio>
          <p><a href={audioUrl} target="_blank" rel="noopener noreferrer">Download Audio</a></p>
        </div>
      )}
    </div>
  );
};

export default MurfTTSDemo;
