/**
 * Home / Mixer Screen
 * - Grid of 12 sound tiles
 * - Bottom player bar with play/pause, timer, sound count
 */

import { View, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useThemeColors } from "@/constants/theme";
import { useMixer } from "@/contexts/MixerContext";
import { SoundGrid } from "@/components/SoundGrid";
import { PlayerBar } from "@/components/PlayerBar";

export default function HomeScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const {
    mixerState,
    isGlobalPlaying,
    activeSoundCount,
    toggleSound,
    setVolume,
    toggleGlobalPlayback,
    timerIsActive,
    timerFormattedTime,
  } = useMixer();

  return (
    <>
      <Stack.Screen
        options={{
          title: "SoundMixer",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SoundGrid
          mixerState={mixerState}
          onToggle={toggleSound}
          onVolumeChange={setVolume}
        />
        <PlayerBar
          isPlaying={isGlobalPlaying}
          activeSoundCount={activeSoundCount}
          timerActive={timerIsActive}
          timerFormatted={timerFormattedTime}
          onTogglePlay={toggleGlobalPlayback}
          onTimerPress={() => router.push("/timer")}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
