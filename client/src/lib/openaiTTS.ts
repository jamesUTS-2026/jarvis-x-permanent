/**
 * OpenAI TTS Integration via FastAPI Backend
 * Calls the Python backend /tts endpoint for voice synthesis with onyx voice
 */

const TTS_ENDPOINT = 'http://localhost:8000/tts';

export interface TTSOptions {
  text: string;
  voice?: string; // Default: 'onyx' (deep male voice)
  speed?: number; // Default: 0.95 (slightly slower for authority)
  model?: string; // Default: 'tts-1-hd' (HD quality)
}

/**
 * Generate speech from text using OpenAI TTS via FastAPI backend
 * Returns audio blob that can be played directly
 */
export async function generateSpeech(options: TTSOptions): Promise<Blob> {
  const {
    text,
    voice = 'onyx',
    speed = 0.95,
    model = 'tts-1-hd',
  } = options;

  try {
    const response = await fetch(TTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice,
        speed,
        model,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `TTS generation failed: ${response.statusText}`);
    }

    // Get audio blob from response
    const audioBlob = await response.blob();
    return audioBlob;
  } catch (error) {
    console.error('[TTS] Error generating speech:', error);
    throw error;
  }
}

/**
 * Play audio blob using Web Audio API
 */
export async function playAudio(audioBlob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        reject(new Error('Audio playback failed'));
      };

      audio.play().catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate and play speech in one call
 */
export async function speakText(options: TTSOptions): Promise<void> {
  try {
    const audioBlob = await generateSpeech(options);
    await playAudio(audioBlob);
  } catch (error) {
    console.error('[TTS] Error during speech synthesis:', error);
    throw error;
  }
}

/**
 * Stop current audio playback
 */
export function stopAudio(): void {
  const audioElements = document.querySelectorAll('audio');
  audioElements.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
}

/**
 * Check if audio is currently playing
 */
export function isAudioPlaying(): boolean {
  const audioElements = document.querySelectorAll('audio');
  return Array.from(audioElements).some(audio => !audio.paused);
}
