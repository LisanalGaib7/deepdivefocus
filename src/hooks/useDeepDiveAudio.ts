import { useRef, useEffect, useCallback, useState } from "react";
import { AUDIO_PATHS, DEFAULT_VOLUMES } from "@/constants/gameConfig";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { readString, writeString } from "@/lib/storage/safeStorage";


export type SoundType = "rain" | "ocean" | "whiteNoise";

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
  isSoundEnabled: boolean;
  toggleSoundEnabled: () => void;
}

const SOUND_TYPES: SoundType[] = ["rain", "ocean", "whiteNoise"];

export const useDeepDiveAudio = (): UseDeepDiveAudioReturn => {
  const [sounds, setSounds] = useState<SoundState>({
    rain: false,
    ocean: false,
    whiteNoise: false,
  });

  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    const saved = readString(STORAGE_KEYS.soundEnabled);
    return saved !== null ? saved === "true" : true;
  });

  const audioRefs = useRef<{ [K in SoundType]?: HTMLAudioElement }>({});
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  // Persist sound preference
  useEffect(() => {
    writeString(STORAGE_KEYS.soundEnabled, String(isSoundEnabled));
  }, [isSoundEnabled]);


  // Initialize audio elements + preload alarm
  useEffect(() => {
    SOUND_TYPES.forEach((soundType) => {
      const audio = new Audio(AUDIO_PATHS[soundType]);
      audio.loop = true;
      audio.volume = DEFAULT_VOLUMES[soundType];
      audioRefs.current[soundType] = audio;
    });

    // Preload alarm sound into memory
    const alarm = new Audio(AUDIO_PATHS.alarm);
    alarm.preload = 'auto';
    alarm.volume = DEFAULT_VOLUMES.alarm;
    alarm.load();
    alarmRef.current = alarm;

    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      });
      if (alarmRef.current) {
        alarmRef.current.pause();
        alarmRef.current.src = "";
      }
    };
  }, []);

  const toggleSound = useCallback((soundType: SoundType) => {
    const audio = audioRefs.current[soundType];
    if (!audio) return;

    setSounds((prev) => {
      const isCurrentlyPlaying = prev[soundType];
      if (isCurrentlyPlaying) {
        audio.pause();
        audio.currentTime = 0;
      } else {
        audio.play().catch((err) => console.error(`[Audio] Play failed for ${soundType}:`, err));
      }
      return { ...prev, [soundType]: !isCurrentlyPlaying };
    });
  }, []);

  const stopAllSounds = useCallback(() => {
    SOUND_TYPES.forEach((soundType) => {
      const audio = audioRefs.current[soundType];
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    setSounds({ rain: false, ocean: false, whiteNoise: false });
  }, []);

  const playCompletionSound = useCallback(() => {
    if (!isSoundEnabled) return;
    const alarm = alarmRef.current;
    if (alarm) {
      alarm.currentTime = 0;
      alarm.play().catch((err) => console.error('[Audio] Alarm play failed:', err));
    }
  }, [isSoundEnabled]);

  const toggleSoundEnabled = useCallback(() => {
    setIsSoundEnabled((prev) => !prev);
  }, []);

  const activeSoundsCount = Object.values(sounds).filter(Boolean).length;

  return { sounds, toggleSound, stopAllSounds, playCompletionSound, activeSoundsCount, isSoundEnabled, toggleSoundEnabled };
};
