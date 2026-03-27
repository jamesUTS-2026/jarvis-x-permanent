/**
 * Text-to-Speech using Manus Forge API
 * Provides reliable TTS with deep male voice (JARVIS style)
 */

import axios from 'axios';
import { ENV } from './env';

const TTS_ENDPOINT = `${ENV.forgeApiUrl}/v1/audio/speech`;

export interface TTSOptions {
  text: string;
  voice?: 'onyx' | 'echo' | 'alloy' | 'fable' | 'nova' | 'shimmer';
  model?: 'tts-1' | 'tts-1-hd';
  speed?: number;
}

/**
 * Generate speech audio from text using Manus Forge API
 * Returns audio buffer (MP3)
 */
export async function generateSpeech(options: TTSOptions): Promise<Buffer> {
  try {
    const response = await axios.post(
      TTS_ENDPOINT,
      {
        model: options.model || 'tts-1',
        input: options.text,
        voice: options.voice || 'onyx', // onyx = deep male voice
        speed: options.speed || 1.0,
      },
      {
        headers: {
          'Authorization': `Bearer ${ENV.forgeApiKey}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    return Buffer.from(response.data);
  } catch (error) {
    console.error('[TTS] Error generating speech:', error);
    throw new Error(`TTS generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate speech and return as data URL for browser playback
 */
export async function generateSpeechDataUrl(options: TTSOptions): Promise<string> {
  const audioBuffer = await generateSpeech(options);
  const base64 = audioBuffer.toString('base64');
  return `data:audio/mpeg;base64,${base64}`;
}
