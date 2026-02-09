# Handoff — SoundMixer

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

## ⚠️ IMPORTANT: Placeholder Audio Files

**The audio files in `assets/sounds/` are silent placeholders.** They are minimal valid-ish MP3 files that won't produce any sound.

### Before shipping, you MUST:

1. Source 12 loopable ambient sound files (MP3, ~30-60 seconds each, seamless loops)
2. Replace the placeholder files in `assets/sounds/`:
   - `rain.mp3`
   - `thunder.mp3`
   - `ocean.mp3`
   - `forest.mp3`
   - `wind.mp3`
   - `fireplace.mp3`
   - `birds.mp3`
   - `creek.mp3`
   - `white-noise.mp3`
   - `pink-noise.mp3`
   - `brown-noise.mp3`
   - `fan.mp3`

### Recommended sources for royalty-free sounds:
- [Freesound.org](https://freesound.org) (CC0 / CC-BY)
- [Pixabay](https://pixabay.com/sound-effects/) (Pixabay License)
- [BBC Sound Effects](https://sound-effects.bbcrewind.co.uk/) (personal/education use)
- Generate white/pink/brown noise programmatically using Audacity

### Audio file requirements:
- Format: MP3 (128kbps or higher)
- Duration: 30-60 seconds (they loop automatically)
- Must loop seamlessly (use crossfade in Audacity)
- File size: Keep under 1MB each for reasonable app bundle size

## Building for Production

### Prerequisites
```bash
npm install -g eas-cli
eas login
```

### Configure EAS
Update `eas.json` with your Apple Team ID and App Store Connect App ID:
- `submit.production.ios.appleTeamId`
- `submit.production.ios.ascAppId`

For Android, create a Google Play Service Account and add the key file as `google-services.json`.

### Build Commands

```bash
# Development build (simulator)
eas build --profile development --platform ios

# Preview build (TestFlight / internal)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all
```

### Submit

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

## App Configuration

Key settings in `app.json`:
- **Bundle ID (iOS):** `com.tommurton.soundmixer`
- **Package (Android):** `com.tommurton.soundmixer`
- **Background audio:** Enabled via `UIBackgroundModes: ["audio"]`
- **Theme:** Automatic (follows system light/dark)

## Architecture

```
app/
  _layout.tsx      → Root layout with MixerProvider context
  index.tsx        → Home/Mixer screen
  timer.tsx        → Timer modal

src/
  contexts/
    MixerContext.tsx → Shared audio + timer state
  constants/
    sounds.ts      → Sound definitions
    theme.ts       → Design tokens
  hooks/
    useAudioMixer.ts → Audio playback engine
    useTimer.ts      → Countdown timer
    useStorage.ts    → Persistent state (AsyncStorage)
  components/
    SoundTile.tsx  → Individual sound tile
    SoundGrid.tsx  → Grid layout
    PlayerBar.tsx  → Bottom control bar
    TimerPicker.tsx → Timer selection UI
```

## State Management

- **Audio state** (active sounds, volumes) persisted via `useStorage` → AsyncStorage
- **Timer state** (last preset) persisted via `useStorage` → AsyncStorage
- **Playback state** (isPlaying) is ephemeral — resets on app restart
- **All state** shared via React Context (`MixerContext`)

## Known Limitations

1. **Placeholder audio** — must be replaced before shipping
2. **No app icon** — uses template placeholder; design a proper icon before submission
3. **No splash screen customisation** — update `assets/splash-icon.png`
4. **No onboarding** — could add a first-launch tutorial
5. **No sound preview** — could add haptic feedback per sound type

## TypeScript

Strict mode enabled. Zero errors as of initial build:
```bash
npx tsc --noEmit  # Should report no errors
```
