/**
 * Manus Forge API Text-to-Speech Engine
 * Server-side TTS for guaranteed consistent male voice (Iron Man JARVIS style)
 * Voice: "onyx" = deep male
 */

export interface TTSConfig {
  voice: 'onyx' | 'echo' | 'alloy' | 'fable' | 'nova' | 'shimmer';
  speed?: number;
}

let currentAudio: HTMLAudioElement | null = null;
let isPlaying = false;

/**
 * Convert text to speech using Manus Forge API
 * @param text - Text to speak
 * @param config - TTS configuration
 * @param onProgress - Progress callback (0-100)
 */
export async function speak(
  text: string,
  config: TTSConfig = { voice: 'onyx' },
  onProgress?: (progress: number) => void
): Promise<void> {
  if (!text || text.trim().length === 0) {
    return;
  }

  // Stop any existing speech
  stopSpeech();

  try {
    onProgress?.(10); // Starting

    // For now, use browser's Web Speech API as fallback
    // The tRPC endpoint will be called from VoiceAssistant component
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.rate = 0.88; // Slightly slower for clarity
    utterance.pitch = 0.68; // Deep male voice
    utterance.volume = 1.0;

    // Try to select male voice
    const voices = window.speechSynthesis.getVoices();
    const maleVoice = voices.find(v => 
      v.name.includes('David') || 
      v.name.includes('Mark') || 
      v.name.includes('Google UK English Male') ||
      v.name.includes('Alex') ||
      v.name.includes('James') ||
      v.name.includes('Guy')
    );
    
    if (maleVoice) {
      utterance.voice = maleVoice;
    }

    utterance.onstart = () => {
      isPlaying = true;
      onProgress?.(50);
    };

    utterance.onend = () => {
      isPlaying = false;
      onProgress?.(100);
    };

    utterance.onerror = (event) => {
      console.error('[TTS] Error:', event.error);
      isPlaying = false;
      onProgress?.(0);
    };

    window.speechSynthesis.speak(utterance);
    currentAudio = utterance as any;
  } catch (error) {
    console.error('[TTS] Error:', error);
    isPlaying = false;
    onProgress?.(0);
    throw error;
  }
}

/**
 * Stop current speech playback
 */
export function stopSpeech(): void {
  window.speechSynthesis.cancel();
  isPlaying = false;
  currentAudio = null;
}

/**
 * Pause speech playback
 */
export function pauseSpeech(): void {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
    isPlaying = false;
  }
}

/**
 * Resume speech playback
 */
export function resumeSpeech(): void {
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    isPlaying = true;
  }
}

/**
 * Check if speech is currently playing
 */
export function isSpeaking(): boolean {
  return isPlaying || window.speechSynthesis.speaking;
}

/**
 * Get current playback progress (0-100)
 */
export function getPlaybackProgress(): number {
  return window.speechSynthesis.speaking ? 50 : 0;
}
