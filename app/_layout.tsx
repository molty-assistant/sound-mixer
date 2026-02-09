import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MixerProvider } from "@/contexts/MixerContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <MixerProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: true,
            headerBackButtonDisplayMode: "minimal",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen
            name="timer"
            options={{
              presentation: "modal",
              headerShown: false,
            }}
          />
        </Stack>
      </MixerProvider>
    </SafeAreaProvider>
  );
}
