/**
 * Advanced Voice Synthesis Engine
 * Implements Open JARVIS-style voice with sophisticated prosody and natural speech patterns
 */

export interface VoiceConfig {
  pitch: number; // 0.5 - 2.0
  rate: number; // 0.5 - 2.0
  volume: number; // 0 - 1
  voiceProfile: 'authoritative' | 'friendly' | 'technical' | 'jarvis';
  enableEmphasis: boolean;
  enablePauses: boolean;
  enableStreaming: boolean;
}

export interface SpeechSegment {
  text: string;
  emphasis: boolean;
  pauseAfter: number; // milliseconds
}

/**
 * Parse text into segments with emphasis and pause markers
 */
export function parseTextForSpeech(text: string): SpeechSegment[] {
  // Remove markdown formatting
  let cleanText = text.replace(/[*_`#]/g, '');
  
  // Split on sentence boundaries
  const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
  
  const segments: SpeechSegment[] = [];
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    // Detect emphasis markers (words in ALL CAPS or with special punctuation)
    const words = trimmed.split(/\s+/);
    let currentSegment = '';
    let hasEmphasis = false;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const isEmphasis = word === word.toUpperCase() && word.length > 1;
      
      if (isEmphasis && currentSegment) {
        // Push current segment and start new one with emphasis
        segments.push({
          text: currentSegment.trim(),
          emphasis: hasEmphasis,
          pauseAfter: 100,
        });
        currentSegment = word;
        hasEmphasis = true;
      } else {
        currentSegment += (currentSegment ? ' ' : '') + word;
        if (isEmphasis) hasEmphasis = true;
      }
    }

    if (currentSegment) {
      segments.push({
        text: currentSegment.trim(),
        emphasis: hasEmphasis,
        pauseAfter: 300, // Pause after sentence
      });
    }
  }

  return segments;
}

/**
 * Get voice profile configuration
 */
export function getVoiceProfile(profile: 'authoritative' | 'friendly' | 'technical' | 'jarvis'): Partial<VoiceConfig> {
  const profiles = {
    authoritative: {
      pitch: 0.85,
      rate: 0.95,
      volume: 1,
    },
    friendly: {
      pitch: 0.9,
      rate: 1.0,
      volume: 0.95,
    },
    technical: {
      pitch: 0.88,
      rate: 0.92,
      volume: 1,
    },
    jarvis: {
      pitch: 0.75, // Deep masculine voice
      rate: 0.88,  // Slower, more refined delivery
      volume: 1,
    },
  };

  return profiles[profile];
}

/**
 * Find best available voice for speech synthesis - MALE VOICES ONLY
 */
export function findBestVoice(profile?: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  
  // Filter to ONLY male voices - exclude female voices completely
  const maleVoices = voices.filter(v => {
    const name = v.name.toLowerCase();
    const lang = v.lang.toLowerCase();
    
    // Exclude known female voices
    const femaleIndicators = ['female', 'woman', 'girl', 'victoria', 'samantha', 'karen', 'moira', 'fiona', 'zira', 'susan', 'jennifer'];
    if (femaleIndicators.some(indicator => name.includes(indicator))) {
      return false;
    }
    
    // Include only male voices
    const maleIndicators = ['male', 'man', 'boy', 'david', 'mark', 'george', 'google uk english male', 'microsoft david'];
    return maleIndicators.some(indicator => name.includes(indicator)) || lang.includes('male');
  });
  
  // For JARVIS profile, prioritize British and deep male voices
  if (profile === 'jarvis' && maleVoices.length > 0) {
    const jarvisPriorities = [
      (v: SpeechSynthesisVoice) => v.name.includes('Google UK English Male'),
      (v: SpeechSynthesisVoice) => v.name.includes('Microsoft David'),
      (v: SpeechSynthesisVoice) => v.name.includes('David') && v.lang.includes('en'),
      (v: SpeechSynthesisVoice) => v.lang === 'en-GB' && !v.name.toLowerCase().includes('female'),
      (v: SpeechSynthesisVoice) => v.lang === 'en-US' && v.name.includes('Male'),
      (v: SpeechSynthesisVoice) => v.lang === 'en-IN' && v.name.includes('Male'),
      (v: SpeechSynthesisVoice) => v.lang.startsWith('en-') && !v.name.toLowerCase().includes('female'),
    ];
    
    for (const predicate of jarvisPriorities) {
      const voice = maleVoices.find(predicate);
      if (voice) return voice;
    }
  }
  
  // Default priority order - MALE VOICES ONLY
  const priorities = [
    (v: SpeechSynthesisVoice) => v.name.includes('Google UK English Male'),
    (v: SpeechSynthesisVoice) => v.name.includes('Google US English Male'),
    (v: SpeechSynthesisVoice) => v.name.includes('Microsoft David'),
    (v: SpeechSynthesisVoice) => v.name.includes('David') && v.lang.includes('en'),
    (v: SpeechSynthesisVoice) => v.lang === 'en-US' && v.name.includes('Male'),
    (v: SpeechSynthesisVoice) => v.lang === 'en-IN' && v.name.includes('Male'),
    (v: SpeechSynthesisVoice) => v.lang === 'en-GB' && !v.name.toLowerCase().includes('female'),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en-') && !v.name.toLowerCase().includes('female'),
  ];

  for (const predicate of priorities) {
    const voice = maleVoices.find(predicate);
    if (voice) return voice;
  }

  // Fallback to any male voice if available
  return maleVoices[0] || voices[0] || null;
}

/**
 * Advanced speech synthesis with prosody and natural patterns
 */
export async function speakWithProsody(
  text: string,
  config: VoiceConfig,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const segments = parseTextForSpeech(text);
    const voice = findBestVoice(config.voiceProfile);

    if (!voice) {
      reject(new Error('No voice available'));
      return;
    }

    let currentSegmentIndex = 0;
    let totalSegments = segments.length;

    const speakSegment = (index: number) => {
      if (index >= segments.length) {
        resolve();
        return;
      }

      const segment = segments[index];
      const utterance = new SpeechSynthesisUtterance(segment.text);

      utterance.voice = voice;
      utterance.pitch = config.pitch;
      utterance.rate = config.rate;
      utterance.volume = config.volume;

      // Adjust pitch for emphasis (less dramatic for JARVIS)
      if (segment.emphasis && config.enableEmphasis) {
        const emphasisBoost = config.voiceProfile === 'jarvis' ? 0.08 : 0.15;
        utterance.pitch = Math.min(2, config.pitch + emphasisBoost);
      }

      utterance.onend = () => {
        currentSegmentIndex++;
        onProgress?.(Math.round((currentSegmentIndex / totalSegments) * 100));

        // Natural pause between segments
        if (config.enablePauses && segment.pauseAfter > 0) {
          setTimeout(() => speakSegment(index + 1), segment.pauseAfter);
        } else {
          speakSegment(index + 1);
        }
      };

      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      window.speechSynthesis.speak(utterance);
    };

    speakSegment(0);
  });
}

/**
 * Stop current speech
 */
export function stopSpeech(): void {
  window.speechSynthesis.cancel();
}

/**
 * Check if speech is currently playing
 */
export function isSpeaking(): boolean {
  return window.speechSynthesis.speaking;
}

/**
 * Pause speech
 */
export function pauseSpeech(): void {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
  }
}

/**
 * Resume speech
 */
export function resumeSpeech(): void {
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

/**
 * Create audio visualization data from speech
 */
export function generateAudioVisualization(duration: number, segments: number = 40): number[] {
  const visualization: number[] = [];
  
  for (let i = 0; i < segments; i++) {
    // Create smooth wave pattern
    const value = Math.sin((i / segments) * Math.PI * 2) * 0.5 + 0.5;
    // Add some randomness for natural feel
    const noise = Math.random() * 0.2;
    visualization.push(Math.min(1, value + noise));
  }

  return visualization;
}

/**
 * Apply voice effects (reverb simulation)
 */
export function applyVoiceEffects(
  config: VoiceConfig
): { reverb: number; clarity: number } {
  // Adjust effects based on voice profile
  const baseReverb = 0.15;
  const baseclarity = 0.85;

  if (config.voiceProfile === 'authoritative') {
    return {
      reverb: baseReverb + 0.05,
      clarity: baseclarity + 0.1,
    };
  } else if (config.voiceProfile === 'friendly') {
    return {
      reverb: baseReverb + 0.1,
      clarity: baseclarity,
    };
  } else {
    return {
      reverb: baseReverb,
      clarity: baseclarity + 0.15,
    };
  }
}

/**
 * Initialize voice synthesis system
 */
export function initializeVoiceSynthesis(): void {
  // Ensure voices are loaded
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      // Voices loaded
    };
  }
}
