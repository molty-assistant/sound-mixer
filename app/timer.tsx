/**
 * Timer Modal Screen
 * Presented as a modal from the home screen.
 */

import { View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/constants/theme";
import { useMixer } from "@/contexts/MixerContext";
import { TimerPicker } from "@/components/TimerPicker";

export default function TimerScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { timerIsActive, timerLastPreset, startTimer, cancelTimer } = useMixer();

  const dismiss = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.overlay }]}>
      <Pressable style={styles.backdrop} onPress={dismiss} />
      <TimerPicker
        lastPreset={timerLastPreset}
        timerActive={timerIsActive}
        onStart={startTimer}
        onCancel={cancelTimer}
        onDismiss={dismiss}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
});
