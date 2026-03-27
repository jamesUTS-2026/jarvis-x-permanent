/**
 * OpenAI Text-to-Speech Engine
 * Replaces Web Speech API with server-side TTS for guaranteed consistent male voice
 * Voice: "onyx" = deep male (Iron Man JARVIS style)
 */

export interface TTSConfig {
  voice: 'onyx' | 'echo'; // onyx = deep male, echo = lighter male
  speed: number; // 0.25 - 4.0
}

let currentAudio: HTMLAudioElement | null = null;
let isPlaying = false;

/**
 * Convert text to speech using OpenAI TTS backend
 * @param text - Text to speak
 * @param config - TTS configuration
 * @param onProgress - Progress callback (0-100)
 */
export async function speak(
  text: string,
  config: TTSConfig = { voice: 'onyx', speed: 1.0 },
  onProgress?: (progress: number) => void
): Promise<void> {
  if (!text || text.trim().length === 0) {
    return;
  }

  // Stop any existing speech
  stopSpeech();

  try {
    onProgress?.(10); // Starting

    // Call backend TTS endpoint
    const response = await fetch('http://localhost:8000/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        voice: config.voice,
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS error: ${response.statusText}`);
    }

    onProgress?.(50); // Downloaded

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Create and play audio
    currentAudio = new Audio(audioUrl);
    currentAudio.playbackRate = config.speed;

    // Track playback progress
    currentAudio.addEventListener('timeupdate', () => {
      if (currentAudio && currentAudio.duration) {
        const progress = 50 + (currentAudio.currentTime / currentAudio.duration) * 50;
        onProgress?.(Math.min(100, progress));
      }
    });

    currentAudio.addEventListener('ended', () => {
      isPlaying = false;
      onProgress?.(100);
      URL.revokeObjectURL(audioUrl);
    });

    currentAudio.addEventListener('error', (err) => {
      console.error('[TTS] Playback error:', err);
      isPlaying = false;
      URL.revokeObjectURL(audioUrl);
    });

    isPlaying = true;
    await currentAudio.play();
  } catch (error) {
    console.error('[TTS] Error:', error);
    isPlaying = false;
    throw error;
  }
}

/**
 * Stop current speech
 */
export function stopSpeech(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    isPlaying = false;
  }
}

/**
 * Check if speech is currently playing
 */
export function isSpeaking(): boolean {
  return isPlaying && currentAudio !== null && !currentAudio.paused;
}

/**
 * Pause speech
 */
export function pauseSpeech(): void {
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause();
    isPlaying = false;
  }
}

/**
 * Resume speech
 */
export function resumeSpeech(): void {
  if (currentAudio && currentAudio.paused && isPlaying) {
    currentAudio.play();
  }
}

/**
 * Break text into natural chunks for better speech flow
 */
export function chunkText(text: string, maxLength: number = 500): string[] {
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Speak multiple chunks sequentially
 */
export async function speakChunked(
  text: string,
  config: TTSConfig = { voice: 'onyx', speed: 1.0 },
  onProgress?: (progress: number) => void
): Promise<void> {
  const chunks = chunkText(text);

  for (let i = 0; i < chunks.length; i++) {
    const chunkProgress = (i / chunks.length) * 100;
    onProgress?.(chunkProgress);

    await speak(chunks[i], config, (p) => {
      onProgress?.(chunkProgress + (p / chunks.length));
    });

    // Add natural pause between chunks
    if (i < chunks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  onProgress?.(100);
}
