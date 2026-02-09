# 🎵 SoundMixer

Mix ambient sounds for sleep, focus, and relaxation — no subscription, no account.

<p align="center">
  🌧️ Rain · ⛈️ Thunder · 🌊 Ocean · 🌲 Forest · 💨 Wind · 🔥 Fire<br/>
  🐦 Birds · 💧 Creek · 📻 White · 🎵 Pink · 🟤 Brown · 🌀 Fan
</p>

## Features

- **12 ambient sounds** — mix and match to create your perfect soundscape
- **Individual volume control** — fine-tune each sound independently
- **Sleep timer** — auto-stop with gentle fade-out (15min, 30min, 1hr, 2hr, custom)
- **Background playback** — keeps playing when you switch apps
- **Persistent settings** — remembers your mix between sessions
- **Dark mode** — full light and dark theme support
- **Privacy-first** — zero data collection, everything local

## Getting Started

```bash
npm install
npx expo start
```

## ⚠️ Audio Files

The audio files in `assets/sounds/` are **silent placeholders**. Replace them with real loopable ambient sound files before shipping. See [HANDOFF.md](./HANDOFF.md) for details.

## Tech Stack

- [Expo](https://expo.dev) (SDK 54)
- [expo-router](https://docs.expo.dev/router/introduction/) — file-based routing
- [expo-av](https://docs.expo.dev/versions/latest/sdk/audio/) — audio playback
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) — persistent state
- TypeScript (strict mode)

## Building

```bash
# Development
eas build --profile development --platform ios

# Production
eas build --profile production --platform all
```

## License

MIT
