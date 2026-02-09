/**
 * useAudioMixer — manages multiple simultaneous audio instances via expo-av.
 *
 * Responsibilities:
 * - Load/unload Audio.Sound instances per sound ID
 * - Play, pause, toggle individual sounds
 * - Adjust individual volume
 * - Global play/pause (all active sounds)
 * - Fade out all sounds (for timer expiry)
 * - Persist active sounds + volumes via useStorage
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Audio, AVPlaybackStatus } from "expo-av";
import { SOUNDS, DEFAULT_VOLUME, FADE_OUT_DURATION_MS } from "@/constants/sounds";
import { useStorage } from "./useStorage";

export interface SoundState {
  active: boolean;
  volume: number;
}

export type MixerState = Record<string, SoundState>;

const defaultMixerState: MixerState = Object.fromEntries(
  SOUNDS.map((s) => [s.id, { active: false, volume: DEFAULT_VOLUME }])
);

export function useAudioMixer() {
  const [mixerState, setMixerState, loading] = useStorage<MixerState>(
    "mixer-state",
    defaultMixerState
  );
  const [isGlobalPlaying, setIsGlobalPlaying] = useState(false);
  const soundRefs = useRef<Record<string, Audio.Sound>>({});
  const isMounted = useRef(true);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Configure audio mode for background playback
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch(console.warn);

    return () => {
      isMounted.current = false;
      // Unload all sounds on unmount
      Object.values(soundRefs.current).forEach((sound) => {
        sound.unloadAsync().catch(() => {});
      });
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  // Sync audio state when mixer state changes
  useEffect(() => {
    if (loading) return;

    const syncAudio = async () => {
      for (const soundDef of SOUNDS) {
        const state = mixerState[soundDef.id];
        if (!state) continue;

        const existingSound = soundRefs.current[soundDef.id];

        if (state.active && isGlobalPlaying) {
          if (!existingSound) {
            try {
              const { sound } = await Audio.Sound.createAsync(soundDef.audio, {
                isLooping: true,
                volume: state.volume,
                shouldPlay: true,
              });
              if (isMounted.current) {
                soundRefs.current[soundDef.id] = sound;
              } else {
                sound.unloadAsync().catch(() => {});
              }
            } catch (err) {
              console.warn(`Failed to load sound ${soundDef.id}:`, err);
            }
          } else {
            existingSound.setVolumeAsync(state.volume).catch(() => {});
            existingSound.getStatusAsync().then((status: AVPlaybackStatus) => {
              if (status.isLoaded && !status.isPlaying) {
                existingSound.playAsync().catch(() => {});
              }
            }).catch(() => {});
          }
        } else if (existingSound) {
          existingSound.getStatusAsync().then((status: AVPlaybackStatus) => {
            if (status.isLoaded && status.isPlaying) {
              existingSound.pauseAsync().catch(() => {});
            }
          }).catch(() => {});
        }
      }
    };

    syncAudio();
  }, [mixerState, isGlobalPlaying, loading]);

  const toggleSound = useCallback(
    (soundId: string) => {
      setMixerState((prev) => {
        const current = prev[soundId] ?? { active: false, volume: DEFAULT_VOLUME };
        const newActive = !current.active;
        const updated = {
          ...prev,
          [soundId]: { ...current, active: newActive },
        };

        // If we're toggling off and the sound is loaded, stop & unload it
        if (!newActive && soundRefs.current[soundId]) {
          const ref = soundRefs.current[soundId];
          ref.stopAsync().then(() => ref.unloadAsync()).catch(() => {});
          delete soundRefs.current[soundId];
        }

        return updated;
      });

      // Auto-start global playback if not already playing
      setIsGlobalPlaying(true);
    },
    [setMixerState]
  );

  const setVolume = useCallback(
    (soundId: string, volume: number) => {
      setMixerState((prev) => ({
        ...prev,
        [soundId]: { ...prev[soundId], volume },
      }));
    },
    [setMixerState]
  );

  const toggleGlobalPlayback = useCallback(() => {
    setIsGlobalPlaying((prev) => !prev);
  }, []);

  const pauseAll = useCallback(() => {
    setIsGlobalPlaying(false);
  }, []);

  const playAll = useCallback(() => {
    setIsGlobalPlaying(true);
  }, []);

  /** Fade out all sounds over FADE_OUT_DURATION_MS, then pause */
  const fadeOutAndStop = useCallback(() => {
    return new Promise<void>((resolve) => {
      const steps = 20;
      const stepMs = FADE_OUT_DURATION_MS / steps;
      let currentStep = 0;

      // Capture current volumes
      const originalVolumes: Record<string, number> = {};
      for (const soundDef of SOUNDS) {
        const state = mixerState[soundDef.id];
        if (state?.active) {
          originalVolumes[soundDef.id] = state.volume;
        }
      }

      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        const factor = 1 - currentStep / steps;

        // Set volume on each playing sound
        for (const [id, origVol] of Object.entries(originalVolumes)) {
          const ref = soundRefs.current[id];
          if (ref) {
            ref.setVolumeAsync(Math.max(0, origVol * factor)).catch(() => {});
          }
        }

        if (currentStep >= steps) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }

          // Pause all and restore original volumes in state
          setIsGlobalPlaying(false);

          // Restore volumes in state so next play uses original levels
          setMixerState((prev) => {
            const updated = { ...prev };
            for (const [id, origVol] of Object.entries(originalVolumes)) {
              if (updated[id]) {
                updated[id] = { ...updated[id], volume: origVol };
              }
            }
            return updated;
          });

          // Also restore volumes on the actual sound objects
          for (const [id, origVol] of Object.entries(originalVolumes)) {
            const ref = soundRefs.current[id];
            if (ref) {
              ref.setVolumeAsync(origVol).catch(() => {});
            }
          }

          resolve();
        }
      }, stepMs);
    });
  }, [mixerState, setMixerState]);

  const activeSoundCount = Object.values(mixerState).filter((s) => s.active).length;

  return {
    mixerState,
    isGlobalPlaying,
    activeSoundCount,
    toggleSound,
    setVolume,
    toggleGlobalPlayback,
    playAll,
    pauseAll,
    fadeOutAndStop,
  };
}
