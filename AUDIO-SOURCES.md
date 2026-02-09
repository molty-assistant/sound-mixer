# Sound Mixer — Audio Sources Guide

## Required Sounds (12 total)

Each sound needs to be a seamless loop, ~30-60 seconds, MP3 format.

| Sound | File | Source suggestion |
|-------|------|-------------------|
| Rain | `rain.mp3` | Pixabay "rain loop" or Freesound CC0 |
| Thunder | `thunder.mp3` | Pixabay "thunder ambient" |
| Ocean | `ocean.mp3` | Pixabay "ocean waves loop" |
| Forest | `forest.mp3` | Pixabay "forest ambient" |
| Wind | `wind.mp3` | Pixabay "wind loop" |
| Fireplace | `fireplace.mp3` | Pixabay "fireplace crackling" |
| Birds | `birds.mp3` | Pixabay "birdsong loop" |
| Creek | `creek.mp3` | Pixabay "stream creek water" |
| White Noise | `white-noise.mp3` | Generate programmatically (Audacity) |
| Pink Noise | `pink-noise.mp3` | Generate programmatically (Audacity) |
| Brown Noise | `brown-noise.mp3` | Generate programmatically (Audacity) |
| Fan | `fan.mp3` | Pixabay "fan noise loop" |

## Recommended Sources (CC0 / Free for commercial use)

### Pixabay Sound Effects
- **URL:** https://pixabay.com/sound-effects/
- **License:** Pixabay Content License — free for commercial use, no attribution required
- **Best for:** Nature sounds (rain, ocean, forest, birds)
- **Download:** Direct MP3 download after sign-up (free)

### Freesound.org
- **URL:** https://freesound.org
- **License:** Filter by CC0 (Creative Commons Zero) — no attribution required
- **Best for:** Specific ambient textures, loops
- **Note:** Must create free account to download

### Generate Noise Sounds
White, pink, and brown noise can be generated perfectly with:
```bash
# Using sox (install: brew install sox)
# White noise - 30 second loop
sox -n white-noise.mp3 synth 30 whitenoise

# Pink noise
sox -n pink-noise.mp3 synth 30 pinknoise

# Brown noise  
sox -n brown-noise.mp3 synth 30 brownnoise
```

Or use Audacity: Generate → Noise → select type → 30 seconds → Export as MP3.

## Audio Processing Requirements

1. **Duration:** 30-60 seconds (will loop in-app)
2. **Format:** MP3, 128kbps (balance quality vs size)
3. **Seamless loop:** Fade edges or use crossfade for seamless looping
4. **Volume normalization:** All sounds should peak at roughly the same level (-3dB to -1dB)
5. **File size:** Keep each under 1MB for fast app loading

## Processing with ffmpeg

```bash
# Convert and normalize
ffmpeg -i input.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11" -b:a 128k output.mp3

# Trim to 30 seconds
ffmpeg -i input.mp3 -t 30 -af "afade=in:st=0:d=0.5,afade=out:st=29.5:d=0.5" output.mp3

# Crossfade loop (makes seamless)
ffmpeg -i input.mp3 -af "acrossfade=d=2:c1=tri:c2=tri" output.mp3
```

## Status

- [ ] Rain — placeholder (silent)
- [ ] Thunder — placeholder (silent)
- [ ] Ocean — placeholder (silent)
- [ ] Forest — placeholder (silent)
- [ ] Wind — placeholder (silent)
- [ ] Fireplace — placeholder (silent)
- [ ] Birds — placeholder (silent)
- [ ] Creek — placeholder (silent)
- [ ] White Noise — placeholder (can generate with sox)
- [ ] Pink Noise — placeholder (can generate with sox)
- [ ] Brown Noise — placeholder (can generate with sox)
- [ ] Fan — placeholder (silent)
