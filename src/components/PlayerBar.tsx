/**
 * PlayerBar — bottom bar with play/pause, active sound count, and timer display.
 */

import { View, Text, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import {
  useThemeColors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from "@/constants/theme";

interface PlayerBarProps {
  isPlaying: boolean;
  activeSoundCount: number;
  timerActive: boolean;
  timerFormatted: string;
  onTogglePlay: () => void;
  onTimerPress: () => void;
}

export function PlayerBar({
  isPlaying,
  activeSoundCount,
  timerActive,
  timerFormatted,
  onTogglePlay,
  onTimerPress,
}: PlayerBarProps) {
  const colors = useThemeColors();

  const handlePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onTogglePlay();
  };

  const handleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTimerPress();
  };

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.separator,
        },
        shadows.md,
      ]}
    >
      {/* Timer button */}
      <Pressable
        onPress={handleTimer}
        style={({ pressed }) => [
          styles.timerButton,
          {
            backgroundColor: timerActive ? colors.primary : colors.surface,
            borderColor: timerActive ? colors.primary : colors.border,
          },
          pressed && styles.pressed,
        ]}
      >
        <Text
          style={[
            styles.timerIcon,
            { color: timerActive ? colors.textInverted : colors.textSecondary },
          ]}
        >
          ⏱️
        </Text>
        {timerActive && (
          <Text
            style={[
              styles.timerText,
              { color: colors.textInverted },
            ]}
          >
            {timerFormatted}
          </Text>
        )}
      </Pressable>

      {/* Play/Pause button */}
      <Pressable
        onPress={handlePlay}
        disabled={activeSoundCount === 0}
        style={({ pressed }) => [
          styles.playButton,
          {
            backgroundColor:
              activeSoundCount === 0 ? colors.border : colors.primary,
          },
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.playIcon}>
          {isPlaying ? "⏸️" : "▶️"}
        </Text>
      </Pressable>

      {/* Active count */}
      <View style={styles.countContainer}>
        <Text
          style={[
            styles.countText,
            { color: colors.textSecondary },
          ]}
        >
          {activeSoundCount} sound{activeSoundCount !== 1 ? "s" : ""}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  timerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    minWidth: 44,
    justifyContent: "center",
  },
  timerIcon: {
    fontSize: 18,
  },
  timerText: {
    ...typography.caption,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    marginLeft: spacing.xs,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    fontSize: 24,
  },
  countContainer: {
    minWidth: 80,
    alignItems: "flex-end",
  },
  countText: {
    ...typography.caption,
    fontWeight: "600",
  },
});
