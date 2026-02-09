/**
 * Sound definitions — the 12 bundled ambient sounds.
 * Each has an id, display name, emoji, tile accent color, and audio asset reference.
 */

import { AVPlaybackSource } from "expo-av";

export interface SoundDefinition {
  id: string;
  name: string;
  emoji: string;
  /** Subtle accent color for the tile background when active */
  color: string;
  /** Dark-mode accent color */
  colorDark: string;
  /** Audio asset require() */
  audio: AVPlaybackSource;
}

/**
 * NOTE: These audio files are silent placeholders.
 * Replace with real ambient sound loops before shipping.
 * See HANDOFF.md for details.
 */
export const SOUNDS: SoundDefinition[] = [
  {
    id: "rain",
    name: "Rain",
    emoji: "🌧️",
    color: "#E3F2FD",
    colorDark: "#1A3A5C",
    audio: require("../../../assets/sounds/rain.mp3"),
  },
  {
    id: "thunder",
    name: "Thunder",
    emoji: "⛈️",
    color: "#EDE7F6",
    colorDark: "#2D1F4E",
    audio: require("../../../assets/sounds/thunder.mp3"),
  },
  {
    id: "ocean",
    name: "Ocean Waves",
    emoji: "🌊",
    color: "#E0F7FA",
    colorDark: "#1A3C4A",
    audio: require("../../../assets/sounds/ocean.mp3"),
  },
  {
    id: "forest",
    name: "Forest",
    emoji: "🌲",
    color: "#E8F5E9",
    colorDark: "#1B3A1F",
    audio: require("../../../assets/sounds/forest.mp3"),
  },
  {
    id: "wind",
    name: "Wind",
    emoji: "💨",
    color: "#F3E5F5",
    colorDark: "#3A1D42",
    audio: require("../../../assets/sounds/wind.mp3"),
  },
  {
    id: "fireplace",
    name: "Fireplace",
    emoji: "🔥",
    color: "#FBE9E7",
    colorDark: "#4A1E14",
    audio: require("../../../assets/sounds/fireplace.mp3"),
  },
  {
    id: "birds",
    name: "Birds",
    emoji: "🐦",
    color: "#FFF3E0",
    colorDark: "#3D2E14",
    audio: require("../../../assets/sounds/birds.mp3"),
  },
  {
    id: "creek",
    name: "Creek",
    emoji: "💧",
    color: "#E1F5FE",
    colorDark: "#133345",
    audio: require("../../../assets/sounds/creek.mp3"),
  },
  {
    id: "white-noise",
    name: "White Noise",
    emoji: "📻",
    color: "#F5F5F5",
    colorDark: "#2C2C2E",
    audio: require("../../../assets/sounds/white-noise.mp3"),
  },
  {
    id: "pink-noise",
    name: "Pink Noise",
    emoji: "🎵",
    color: "#FCE4EC",
    colorDark: "#3D1525",
    audio: require("../../../assets/sounds/pink-noise.mp3"),
  },
  {
    id: "brown-noise",
    name: "Brown Noise",
    emoji: "🟤",
    color: "#EFEBE9",
    colorDark: "#3E2C23",
    audio: require("../../../assets/sounds/brown-noise.mp3"),
  },
  {
    id: "fan",
    name: "Fan",
    emoji: "🌀",
    color: "#E8EAF6",
    colorDark: "#1A1F4E",
    audio: require("../../../assets/sounds/fan.mp3"),
  },
];

/** Default volume for a newly-activated sound */
export const DEFAULT_VOLUME = 0.5;

/** Timer presets in minutes */
export const TIMER_PRESETS = [15, 30, 60, 120] as const;

/** Fade-out duration in milliseconds when timer expires */
export const FADE_OUT_DURATION_MS = 5000;
