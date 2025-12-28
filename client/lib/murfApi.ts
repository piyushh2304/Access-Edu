
import { GenerateSpeechRequest, GenerateSpeechResponse } from './types'; // Assuming types are defined or will be generated

const MURF_API_BASE_URL = 'https://api.murf.ai/v1/speech/generate';
const MURF_API_KEY = process.env.NEXT_PUBLIC_MURF_API_KEY;

export const generateSpeech = async (
  text: string,
  voiceId: string,
  options?: Partial<GenerateSpeechRequest>
): Promise<GenerateSpeechResponse> => {
  if (!MURF_API_KEY) {
    throw new Error('Murf.ai API key is not configured.');
  }

  const requestBody: GenerateSpeechRequest = {
    text,
    voiceId,
    ...options,
  };

  const response = await fetch(MURF_API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': MURF_API_KEY,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to generate speech');
  }

  return response.json();
};

// Define basic types for Murf.ai API based on the OpenAPI spec
// This should ideally be generated from the OpenAPI spec for full accuracy
export interface GenerateSpeechRequest {
  text: string;
  voiceId: string;
  audioDuration?: number;
  channelType?: string;
  encodeAsBase64?: boolean;
  format?: string;
  modelVersion?: 'GEN2';
  multiNativeLocale?: string;
  pitch?: number;
  pronunciationDictionary?: {
    [key: string]: {
      pronunciation: string;
      type: 'IPA' | 'SAY_AS';
    };
  };
  rate?: number;
  sampleRate?: number;
  style?: string;
  variation?: number;
  wordDurationsAsOriginalText?: boolean;
}

export interface WordDurationResponse {
  endMs: number;
  pitchScaleMaximum: number;
  pitchScaleMinimum: number;
  sourceWordIndex: number;
  startMs: number;
  word: string;
}

export interface GenerateSpeechResponse {
  audioFile: string;
  audioLengthInSeconds: number;
  consumedCharacterCount?: number;
  encodedAudio?: string;
  remainingCharacterCount: number;
  warning?: string;
  wordDurations: WordDurationResponse[];
}
