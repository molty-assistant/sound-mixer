/**
 * TimerPicker — modal content for selecting a timer duration.
 * Presets: 15min, 30min, 1hr, 2hr, or custom.
 */

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  useThemeColors,
  spacing,
  borderRadius,
  typography,
} from "@/constants/theme";
import { TIMER_PRESETS } from "@/constants/sounds";

interface TimerPickerProps {
  lastPreset: number;
  timerActive: boolean;
  onStart: (minutes: number) => void;
  onCancel: () => void;
  onDismiss: () => void;
}

const presetLabels: Record<number, string> = {
  15: "15 min",
  30: "30 min",
  60: "1 hour",
  120: "2 hours",
};

export function TimerPicker({
  lastPreset,
  timerActive,
  onStart,
  onCancel,
  onDismiss,
}: TimerPickerProps) {
  const colors = useThemeColors();
  const [customMinutes, setCustomMinutes] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const handlePreset = (minutes: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onStart(minutes);
    onDismiss();
  };

  const handleCustom = () => {
    const mins = parseInt(customMinutes, 10);
    if (mins > 0 && mins <= 720) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onStart(mins);
      onDismiss();
    }
  };

  const handleCancelTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCancel();
    onDismiss();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoid}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Sleep Timer
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Audio will fade out when the timer ends
        </Text>

        {/* Preset buttons */}
        <View style={styles.presets}>
          {TIMER_PRESETS.map((minutes) => (
            <Pressable
              key={minutes}
              onPress={() => handlePreset(minutes)}
              style={({ pressed }) => [
                styles.presetButton,
                {
                  backgroundColor:
                    lastPreset === minutes
                      ? colors.primary
                      : colors.surface,
                  borderColor:
                    lastPreset === minutes
                      ? colors.primary
                      : colors.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.presetText,
                  {
                    color:
                      lastPreset === minutes
                        ? colors.textInverted
                        : colors.text,
                  },
                ]}
              >
                {presetLabels[minutes]}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Custom input toggle */}
        {!showCustom ? (
          <Pressable
            onPress={() => setShowCustom(true)}
            style={({ pressed }) => [
              styles.customToggle,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.customToggleText, { color: colors.primary }]}>
              Custom time...
            </Text>
          </Pressable>
        ) : (
          <View style={styles.customRow}>
            <TextInput
              style={[
                styles.customInput,
                {
                  color: colors.text,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              value={customMinutes}
              onChangeText={setCustomMinutes}
              keyboardType="number-pad"
              placeholder="Minutes"
              placeholderTextColor={colors.textSecondary}
              maxLength={3}
              autoFocus
            />
            <Pressable
              onPress={handleCustom}
              style={({ pressed }) => [
                styles.customStartButton,
                { backgroundColor: colors.primary },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.customStartText, { color: colors.textInverted }]}>
                Start
              </Text>
            </Pressable>
          </View>
        )}

        {/* Cancel timer (if active) */}
        {timerActive && (
          <Pressable
            onPress={handleCancelTimer}
            style={({ pressed }) => [
              styles.cancelButton,
              { backgroundColor: colors.error },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.cancelText, { color: colors.textInverted }]}>
              Cancel Timer
            </Text>
          </Pressable>
        )}

        {/* Dismiss */}
        <Pressable
          onPress={onDismiss}
          style={({ pressed }) => [
            styles.dismissButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.dismissText, { color: colors.textSecondary }]}>
            Close
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    justifyContent: "flex-end",
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  title: {
    ...typography.h2,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  presets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  presetButton: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  presetText: {
    ...typography.h3,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  customToggle: {
    alignItems: "center",
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  customToggleText: {
    ...typography.body,
    fontWeight: "600",
  },
  customRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  customInput: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    ...typography.body,
  },
  customStartButton: {
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  customStartText: {
    ...typography.h3,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  cancelText: {
    ...typography.h3,
  },
  dismissButton: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  dismissText: {
    ...typography.body,
  },
});
