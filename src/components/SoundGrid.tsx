/**
 * SoundGrid — 4-column grid of SoundTile components.
 */

import { View, StyleSheet, ScrollView } from "react-native";
import { SOUNDS } from "@/constants/sounds";
import { spacing } from "@/constants/theme";
import type { MixerState } from "@/hooks/useAudioMixer";
import { SoundTile } from "./SoundTile";

interface SoundGridProps {
  mixerState: MixerState;
  onToggle: (soundId: string) => void;
  onVolumeChange: (soundId: string, volume: number) => void;
}

export function SoundGrid({
  mixerState,
  onToggle,
  onVolumeChange,
}: SoundGridProps) {
  // Split sounds into rows of 4
  const rows: (typeof SOUNDS)[] = [];
  for (let i = 0; i < SOUNDS.length; i += 4) {
    rows.push(SOUNDS.slice(i, i + 4));
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((sound) => {
            const state = mixerState[sound.id] ?? {
              active: false,
              volume: 0.5,
            };
            return (
              <SoundTile
                key={sound.id}
                sound={sound}
                active={state.active}
                volume={state.volume}
                onToggle={() => onToggle(sound.id)}
                onVolumeChange={(vol) => onVolumeChange(sound.id, vol)}
              />
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    padding: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  row: {
    flexDirection: "row",
    marginBottom: spacing.xs,
  },
});
