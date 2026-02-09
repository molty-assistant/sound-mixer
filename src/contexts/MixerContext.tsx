/**
 * MixerContext — provides shared audio mixer and timer state to all screens.
 */

import React, { createContext, useContext } from "react";
import { useAudioMixer, type MixerState } from "@/hooks/useAudioMixer";
import { useTimer } from "@/hooks/useTimer";

interface MixerContextValue {
  // Audio mixer
  mixerState: MixerState;
  isGlobalPlaying: boolean;
  activeSoundCount: number;
  toggleSound: (soundId: string) => void;
  setVolume: (soundId: string, volume: number) => void;
  toggleGlobalPlayback: () => void;
  playAll: () => void;
  pauseAll: () => void;
  fadeOutAndStop: () => Promise<void>;
  // Timer
  timerRemainingSeconds: number;
  timerIsActive: boolean;
  timerLastPreset: number;
  timerFormattedTime: string;
  startTimer: (minutes: number) => void;
  cancelTimer: () => void;
}

const MixerContext = createContext<MixerContextValue | null>(null);

export function MixerProvider({ children }: { children: React.ReactNode }) {
  const mixer = useAudioMixer();
  const timer = useTimer(() => {
    mixer.fadeOutAndStop();
  });

  const value: MixerContextValue = {
    mixerState: mixer.mixerState,
    isGlobalPlaying: mixer.isGlobalPlaying,
    activeSoundCount: mixer.activeSoundCount,
    toggleSound: mixer.toggleSound,
    setVolume: mixer.setVolume,
    toggleGlobalPlayback: mixer.toggleGlobalPlayback,
    playAll: mixer.playAll,
    pauseAll: mixer.pauseAll,
    fadeOutAndStop: mixer.fadeOutAndStop,
    timerRemainingSeconds: timer.remainingSeconds,
    timerIsActive: timer.isActive,
    timerLastPreset: timer.lastPreset,
    timerFormattedTime: timer.formattedTime,
    startTimer: timer.startTimer,
    cancelTimer: timer.cancelTimer,
  };

  return (
    <MixerContext.Provider value={value}>{children}</MixerContext.Provider>
  );
}

export function useMixer(): MixerContextValue {
  const ctx = useContext(MixerContext);
  if (!ctx) {
    throw new Error("useMixer must be used within a MixerProvider");
  }
  return ctx;
}
