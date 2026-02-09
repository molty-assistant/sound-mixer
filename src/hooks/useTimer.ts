/**
 * useTimer — countdown timer with callback on expiry.
 * Persists the last-used preset via useStorage.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useStorage } from "./useStorage";

export interface TimerState {
  /** Remaining seconds, 0 = not active */
  remainingSeconds: number;
  /** Whether timer is currently counting down */
  isActive: boolean;
  /** Last used preset in minutes */
  lastPreset: number;
}

export function useTimer(onExpire: () => void) {
  const [lastPreset, setLastPreset] = useStorage<number>("timer-last-preset", 30);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);

  // Keep callback ref current
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Countdown effect
  useEffect(() => {
    if (isActive && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            // Fire expiry callback
            onExpireRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [isActive, remainingSeconds > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const startTimer = useCallback(
    (minutes: number) => {
      setLastPreset(minutes);
      setRemainingSeconds(minutes * 60);
      setIsActive(true);
    },
    [setLastPreset]
  );

  const cancelTimer = useCallback(() => {
    setIsActive(false);
    setRemainingSeconds(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const formatTime = useCallback((totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    remainingSeconds,
    isActive,
    lastPreset,
    formattedTime: formatTime(remainingSeconds),
    startTimer,
    cancelTimer,
  };
}
