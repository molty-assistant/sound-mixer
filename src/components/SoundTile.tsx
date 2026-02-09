/**
 * SoundTile — individual tile for a sound in the mixer grid.
 * Shows emoji, name, active state, and volume slider.
 */

import { Pressable, Text, StyleSheet, View, useColorScheme } from "react-native";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import {
  useThemeColors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from "@/constants/theme";
import type { SoundDefinition } from "@/constants/sounds";

interface SoundTileProps {
  sound: SoundDefinition;
  active: boolean;
  volume: number;
  onToggle: () => void;
  onVolumeChange: (volume: number) => void;
}

export function SoundTile({
  sound,
  active,
  volume,
  onToggle,
  onVolumeChange,
}: SoundTileProps) {
  const colors = useThemeColors();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const accentColor = isDark ? sound.colorDark : sound.color;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: active ? accentColor : colors.card,
          borderColor: active ? colors.primary : colors.separator,
        },
        active && shadows.sm,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.emoji}>{sound.emoji}</Text>
      <Text
        style={[
          styles.name,
          {
            color: active ? colors.text : colors.textSecondary,
          },
        ]}
        numberOfLines={1}
      >
        {sound.name}
      </Text>
      {active && (
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            step={0.05}
            value={volume}
            onValueChange={onVolumeChange}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
    flex: 1,
    margin: spacing.xs,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  emoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.caption,
    fontWeight: "600",
    textAlign: "center",
  },
  sliderContainer: {
    width: "100%",
    marginTop: spacing.xs,
  },
  slider: {
    width: "100%",
    height: 24,
  },
});
