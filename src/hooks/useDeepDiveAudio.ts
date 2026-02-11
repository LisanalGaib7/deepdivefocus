import { useRef, useEffect, useCallback, useState } from "react";

// Centralized sound URLs
const SOUND_URLS = {
  rain: "/rain.mp3",
  ocean: "https://cdn.pixabay.com/audio/2022/06/07/audio_b9bd4170e4.mp3",
  whiteNoise: "/whitenoise.mp3",
} as const;

// Default volume levels for each sound
const DEFAULT_VOLUMES = {
  rain: 0.5,
  ocean: 0.4,
  whiteNoise: 0.3,
} as const;

export type SoundType = keyof typeof SOUND_URLS;

export interface SoundState {
  rain: boolean;
  ocean: boolean;
  whiteNoise: boolean;
}

export interface UseDeepDiveAudioReturn {
  sounds: SoundState;
  toggleSound: (soundType: SoundType) => void;
  stopAllSounds: () => void;
  playCompletionSound: () => void;
  activeSoundsCount: number;
}

export const useDeepDiveAudio = (): UseDeepDiveAudioReturn => {
  const [sounds, setSounds] = useState<SoundState>({
    rain: false,
    ocean: false,
    whiteNoise: false,
  });

  const audioRefs = useRef<{ [K in SoundType]?: HTMLAudioElement }>({});
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio elements
  useEffect(() => {
    // Create audio elements for each sound type
    (Object.keys(SOUND_URLS) as SoundType[]).forEach((soundType) => {
      const audio = new Audio(SOUND_URLS[soundType]);
      audio.loop = true;
      audio.volume = DEFAULT_VOLUMES[soundType];
      audioRefs.current[soundType] = audio;
    });

    // Initialize AudioContext for completion sound
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Cleanup on unmount
    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      });
      audioContextRef.current?.close();
    };
  }, []);

  // Toggle a specific sound on/off
  const toggleSound = useCallback((soundType: SoundType) => {
    const audio = audioRefs.current[soundType];
    if (!audio) {
      console.error(`[Audio Debug] No audio element found for: ${soundType}`);
      return;
    }

    console.log(`[Audio Debug] Toggling ${soundType}:`, {
      url: SOUND_URLS[soundType],
      readyState: audio.readyState,
      paused: audio.paused,
    });

    setSounds((prev) => {
      const isCurrentlyPlaying = prev[soundType];

      if (isCurrentlyPlaying) {
        audio.pause();
        audio.currentTime = 0;
        console.log(`[Audio Debug] Paused: ${soundType}`);
      } else {
        audio.play()
          .then(() => console.log(`[Audio Debug] Playing: ${soundType}`))
          .catch((err) => console.error(`[Audio Debug] Play failed for ${soundType}:`, err));
      }

      return { ...prev, [soundType]: !isCurrentlyPlaying };
    });
  }, []);

  // Stop all sounds
  const stopAllSounds = useCallback(() => {
    (Object.keys(audioRefs.current) as SoundType[]).forEach((soundType) => {
      const audio = audioRefs.current[soundType];
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    setSounds({
      rain: false,
      ocean: false,
      whiteNoise: false,
    });
  }, []);

  // Play completion alarm sound using local mp3 file
  const playCompletionSound = useCallback(() => {
    const alarm = new Audio('/alarm.mp3');
    alarm.volume = 1.0;
    alarm.preload = 'auto';
    alarm.play()
      .then(() => console.log('[Audio Debug] Alarm playing'))
      .catch((err) => console.error('[Audio Debug] Alarm play failed:', err));
  }, []);

  // Count of active sounds
  const activeSoundsCount = Object.values(sounds).filter(Boolean).length;

  return {
    sounds,
    toggleSound,
    stopAllSounds,
    playCompletionSound,
    activeSoundsCount,
  };
};
