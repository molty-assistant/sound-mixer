#!/usr/bin/env node
/**
 * generate-ambient.js
 * 
 * Generates 9 ambient sound WAV files using pure Node.js synthesis.
 * No external dependencies (no sox, ffmpeg, npm packages).
 * 
 * Output: 16-bit mono WAV, 44100 Hz, 30 seconds (~2.6 MB each)
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const DURATION = 30; // seconds
const TOTAL_SAMPLES = SAMPLE_RATE * DURATION;
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'sounds');

// ─── WAV Writer ───────────────────────────────────────────────────────────────

function writeWav(filePath, samples) {
  const numSamples = samples.length;
  const byteRate = SAMPLE_RATE * 2; // 16-bit mono = 2 bytes per sample
  const dataSize = numSamples * 2;
  const fileSize = 44 + dataSize;

  const buffer = Buffer.alloc(fileSize);
  let offset = 0;

  // RIFF header
  buffer.write('RIFF', offset); offset += 4;
  buffer.writeUInt32LE(fileSize - 8, offset); offset += 4;
  buffer.write('WAVE', offset); offset += 4;

  // fmt chunk
  buffer.write('fmt ', offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4;         // chunk size
  buffer.writeUInt16LE(1, offset); offset += 2;          // PCM format
  buffer.writeUInt16LE(1, offset); offset += 2;          // mono
  buffer.writeUInt32LE(SAMPLE_RATE, offset); offset += 4;
  buffer.writeUInt32LE(byteRate, offset); offset += 4;
  buffer.writeUInt16LE(2, offset); offset += 2;          // block align
  buffer.writeUInt16LE(16, offset); offset += 2;         // bits per sample

  // data chunk
  buffer.write('data', offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;

  // Write samples as 16-bit signed integers
  for (let i = 0; i < numSamples; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    let val = Math.round(s * 32767);
    buffer.writeInt16LE(val, offset); offset += 2;
  }

  fs.writeFileSync(filePath, buffer);
  const sizeMB = (fileSize / (1024 * 1024)).toFixed(2);
  console.log(`  ✓ ${path.basename(filePath)} — ${sizeMB} MB (${numSamples} samples)`);
}

// ─── Noise Generators ─────────────────────────────────────────────────────────

/** Seeded PRNG for reproducible results */
class SeededRandom {
  constructor(seed = 42) {
    this.state = seed;
  }
  next() {
    // xorshift32
    this.state ^= this.state << 13;
    this.state ^= this.state >> 17;
    this.state ^= this.state << 5;
    return ((this.state >>> 0) / 4294967296);
  }
  // Gaussian approximation via Box-Muller
  gaussian() {
    const u1 = this.next() || 0.0001;
    const u2 = this.next();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
}

/** White noise: flat spectrum */
function whiteNoise(rng) {
  return rng.next() * 2 - 1;
}

/** Pink noise using Voss-McCartney algorithm (16 rows) */
class PinkNoiseGen {
  constructor(rng, rows = 16) {
    this.rng = rng;
    this.rows = rows;
    this.rowValues = new Float64Array(rows);
    this.runningSum = 0;
    this.index = 0;
    this.maxKey = (1 << rows) - 1;
    for (let i = 0; i < rows; i++) {
      const val = rng.next() * 2 - 1;
      this.rowValues[i] = val;
      this.runningSum += val;
    }
  }
  next() {
    this.index = (this.index + 1) & this.maxKey;
    if (this.index !== 0) {
      let numZeros = 0;
      let n = this.index;
      while ((n & 1) === 0) { numZeros++; n >>= 1; }
      const old = this.rowValues[numZeros];
      const newVal = this.rng.next() * 2 - 1;
      this.rowValues[numZeros] = newVal;
      this.runningSum += (newVal - old);
    }
    return this.runningSum / this.rows;
  }
}

/** Brown noise: integrated white noise with leak */
class BrownNoiseGen {
  constructor(rng, leak = 0.998) {
    this.rng = rng;
    this.value = 0;
    this.leak = leak;
  }
  next() {
    this.value = this.value * this.leak + (this.rng.next() * 2 - 1) * 0.1;
    this.value = Math.max(-1, Math.min(1, this.value));
    return this.value;
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Simple one-pole low-pass filter */
class LowPass {
  constructor(cutoffHz, sampleRate = SAMPLE_RATE) {
    const rc = 1.0 / (2 * Math.PI * cutoffHz);
    const dt = 1.0 / sampleRate;
    this.alpha = dt / (rc + dt);
    this.prev = 0;
  }
  process(x) {
    this.prev += this.alpha * (x - this.prev);
    return this.prev;
  }
}

/** Simple one-pole high-pass filter */
class HighPass {
  constructor(cutoffHz, sampleRate = SAMPLE_RATE) {
    const rc = 1.0 / (2 * Math.PI * cutoffHz);
    const dt = 1.0 / sampleRate;
    this.alpha = rc / (rc + dt);
    this.prevX = 0;
    this.prevY = 0;
  }
  process(x) {
    this.prevY = this.alpha * (this.prevY + x - this.prevX);
    this.prevX = x;
    return this.prevY;
  }
}

/** Smooth envelope follower */
class EnvelopeFollower {
  constructor(attackMs, releaseMs) {
    this.attackCoeff = Math.exp(-1 / (SAMPLE_RATE * attackMs / 1000));
    this.releaseCoeff = Math.exp(-1 / (SAMPLE_RATE * releaseMs / 1000));
    this.value = 0;
  }
  process(x) {
    const abs = Math.abs(x);
    if (abs > this.value) {
      this.value = this.attackCoeff * this.value + (1 - this.attackCoeff) * abs;
    } else {
      this.value = this.releaseCoeff * this.value + (1 - this.releaseCoeff) * abs;
    }
    return this.value;
  }
}

/** Apply fade-in and fade-out to avoid clicks */
function applyFades(samples, fadeMs = 500) {
  const fadeSamples = Math.floor(SAMPLE_RATE * fadeMs / 1000);
  for (let i = 0; i < fadeSamples && i < samples.length; i++) {
    samples[i] *= i / fadeSamples;
  }
  for (let i = 0; i < fadeSamples && i < samples.length; i++) {
    samples[samples.length - 1 - i] *= i / fadeSamples;
  }
  return samples;
}

/** Normalize samples to target peak level */
function normalize(samples, targetPeak = 0.85) {
  let max = 0;
  for (let i = 0; i < samples.length; i++) {
    const abs = Math.abs(samples[i]);
    if (abs > max) max = abs;
  }
  if (max > 0) {
    const gain = targetPeak / max;
    for (let i = 0; i < samples.length; i++) {
      samples[i] *= gain;
    }
  }
  return samples;
}

// ─── Sound Generators ─────────────────────────────────────────────────────────

function generateRain() {
  console.log('  Generating rain...');
  const rng = new SeededRandom(101);
  const pink = new PinkNoiseGen(new SeededRandom(102));
  const lp = new LowPass(4000);
  const samples = new Float64Array(TOTAL_SAMPLES);

  // Steady background rain (filtered noise)
  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    // Background: filtered pink noise
    let bg = lp.process(pink.next()) * 0.4;

    // Raindrop transients: random short bursts
    if (rng.next() < 0.003) {
      // Start a raindrop burst
      const dropLen = Math.floor(80 + rng.next() * 200); // 80-280 samples
      const dropVol = 0.2 + rng.next() * 0.5;
      const dropLp = new LowPass(1500 + rng.next() * 4000);
      for (let j = 0; j < dropLen && (i + j) < TOTAL_SAMPLES; j++) {
        const env = Math.exp(-j / (dropLen * 0.2)); // fast decay
        const noise = whiteNoise(rng);
        samples[i + j] += dropLp.process(noise) * env * dropVol;
      }
    }

    // Heavier drops at random intervals
    if (rng.next() < 0.0005) {
      const dropLen = Math.floor(200 + rng.next() * 500);
      const dropVol = 0.4 + rng.next() * 0.4;
      const dropLp = new LowPass(800 + rng.next() * 2000);
      for (let j = 0; j < dropLen && (i + j) < TOTAL_SAMPLES; j++) {
        const env = Math.exp(-j / (dropLen * 0.25));
        const noise = whiteNoise(rng);
        samples[i + j] += dropLp.process(noise) * env * dropVol;
      }
    }

    samples[i] += bg;
  }

  // Add a gentle low-frequency wash
  const brown = new BrownNoiseGen(new SeededRandom(103));
  const washLp = new LowPass(600);
  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    samples[i] += washLp.process(brown.next()) * 0.25;
  }

  return applyFades(normalize(samples));
}

function generateThunder() {
  console.log('  Generating thunder...');
  const rng = new SeededRandom(201);
  const brown = new BrownNoiseGen(new SeededRandom(202));
  const lp = new LowPass(200);
  const samples = new Float64Array(TOTAL_SAMPLES);

  // Continuous low rumble
  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    // Slow undulation
    const mod = 0.3 + 0.2 * Math.sin(2 * Math.PI * 0.05 * t) + 0.1 * Math.sin(2 * Math.PI * 0.03 * t);
    samples[i] = lp.process(brown.next()) * mod;
  }

  // Thunder strikes at semi-random intervals
  const strikeTimesMs = [2000, 7500, 12000, 18000, 24000]; // millisecond positions
  for (const strikeMs of strikeTimesMs) {
    const startSample = Math.floor(strikeMs * SAMPLE_RATE / 1000);
    const strikeDuration = Math.floor((1.5 + rng.next() * 2) * SAMPLE_RATE); // 1.5-3.5 seconds
    const strikeVol = 0.5 + rng.next() * 0.5;
    const strikeBrown = new BrownNoiseGen(new SeededRandom(203 + strikeMs));
    const strikeLp = new LowPass(120 + rng.next() * 180);
    const strikeLp2 = new LowPass(400);

    for (let j = 0; j < strikeDuration && (startSample + j) < TOTAL_SAMPLES; j++) {
      // Thunder envelope: sharp attack, long rumbling decay
      const t = j / strikeDuration;
      const env = Math.exp(-t * 3) * (1 - Math.exp(-j / 200)); // fast rise, slow decay
      const rumble = strikeLp.process(strikeBrown.next());
      // Add some mid-frequency crackle
      const crackle = strikeLp2.process(whiteNoise(rng)) * Math.exp(-t * 8) * 0.3;
      samples[startSample + j] += (rumble + crackle) * env * strikeVol;
    }
  }

  return applyFades(normalize(samples));
}

function generateOcean() {
  console.log('  Generating ocean...');
  const brown = new BrownNoiseGen(new SeededRandom(301), 0.999);
  const pink = new PinkNoiseGen(new SeededRandom(302));
  const lp = new LowPass(800);
  const lp2 = new LowPass(1200);
  const rng = new SeededRandom(303);
  const samples = new Float64Array(TOTAL_SAMPLES);

  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;

    // Slow wave modulation: multiple sine waves for organic feel
    const wave1 = Math.sin(2 * Math.PI * 0.08 * t); // main wave rhythm ~12.5s period
    const wave2 = Math.sin(2 * Math.PI * 0.12 * t + 0.5); // faster overlay
    const wave3 = Math.sin(2 * Math.PI * 0.03 * t + 1.2); // very slow swell
    const waveMod = 0.35 + 0.25 * wave1 + 0.15 * wave2 + 0.1 * wave3;

    // Mix brown and pink noise for body
    const brownSample = lp.process(brown.next());
    const pinkSample = lp2.process(pink.next());
    const body = brownSample * 0.6 + pinkSample * 0.4;

    // Wave crash: when wave modulation is high, add white noise (foam)
    const crashAmount = Math.max(0, waveMod - 0.5) * 2;
    const foam = whiteNoise(rng) * crashAmount * 0.15;

    samples[i] = body * waveMod + foam;
  }

  return applyFades(normalize(samples));
}

function generateForest() {
  console.log('  Generating forest...');
  const pink = new PinkNoiseGen(new SeededRandom(401));
  const rng = new SeededRandom(402);
  const lp = new LowPass(3000);
  const samples = new Float64Array(TOTAL_SAMPLES);

  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;

    // Very gentle background: filtered pink noise with subtle modulation
    const mod1 = 0.5 + 0.15 * Math.sin(2 * Math.PI * 0.2 * t);
    const mod2 = 0.5 + 0.1 * Math.sin(2 * Math.PI * 0.07 * t + 0.3);
    const rustleMod = mod1 * mod2;

    const noise = lp.process(pink.next());
    samples[i] = noise * rustleMod * 0.3;
  }

  // Occasional gentle rustling bursts (like a breeze through leaves)
  for (let b = 0; b < 15; b++) {
    const startSec = rng.next() * (DURATION - 3);
    const startSample = Math.floor(startSec * SAMPLE_RATE);
    const burstDuration = Math.floor((0.5 + rng.next() * 2) * SAMPLE_RATE);
    const burstVol = 0.1 + rng.next() * 0.2;
    const burstPink = new PinkNoiseGen(new SeededRandom(410 + b));
    const burstHp = new HighPass(1000);

    for (let j = 0; j < burstDuration && (startSample + j) < TOTAL_SAMPLES; j++) {
      const t = j / burstDuration;
      const env = Math.sin(Math.PI * t); // smooth bell curve
      samples[startSample + j] += burstHp.process(burstPink.next()) * env * burstVol;
    }
  }

  return applyFades(normalize(samples, 0.7));
}

function generateWind() {
  console.log('  Generating wind...');
  const brown = new BrownNoiseGen(new SeededRandom(501), 0.999);
  const rng = new SeededRandom(502);
  const lp = new LowPass(600);
  const hp = new HighPass(40);
  const samples = new Float64Array(TOTAL_SAMPLES);

  // Generate a slow-moving modulation curve (gusting)
  const gustEnv = new Float64Array(TOTAL_SAMPLES);
  let gustVal = 0.5;
  const gustSmooth = new LowPass(0.3); // very slow
  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    gustVal += (rng.next() - 0.5) * 0.002;
    gustVal = Math.max(0.15, Math.min(1.0, gustVal));
    gustEnv[i] = gustSmooth.process(gustVal);
  }

  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const noise = hp.process(lp.process(brown.next()));
    samples[i] = noise * gustEnv[i];
  }

  // Add some higher-frequency wind whistle during gusts
  const whistlePink = new PinkNoiseGen(new SeededRandom(503));
  const whistleHp = new HighPass(800);
  const whistleLp = new LowPass(2500);
  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const whistle = whistleLp.process(whistleHp.process(whistlePink.next()));
    const gustStrength = Math.max(0, gustEnv[i] - 0.5) * 2; // only during strong gusts
    samples[i] += whistle * gustStrength * 0.25;
  }

  return applyFades(normalize(samples));
}

function generateFireplace() {
  console.log('  Generating fireplace...');
  const brown = new BrownNoiseGen(new SeededRandom(601), 0.998);
  const rng = new SeededRandom(602);
  const lp = new LowPass(500);
  const samples = new Float64Array(TOTAL_SAMPLES);

  // Base: warm brown noise (the body of the fire)
  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    // Gentle undulation
    const mod = 0.5 + 0.15 * Math.sin(2 * Math.PI * 0.15 * t) + 0.1 * Math.sin(2 * Math.PI * 0.23 * t);
    samples[i] = lp.process(brown.next()) * mod;
  }

  // Crackling transients
  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    // Random crackles
    if (rng.next() < 0.001) {
      const crackLen = Math.floor(20 + rng.next() * 150); // very short bursts
      const crackVol = 0.3 + rng.next() * 0.6;
      const crackHp = new HighPass(2000 + rng.next() * 3000);
      for (let j = 0; j < crackLen && (i + j) < TOTAL_SAMPLES; j++) {
        const env = Math.exp(-j / (crackLen * 0.15)); // very fast decay
        const noise = whiteNoise(rng);
        samples[i + j] += crackHp.process(noise) * env * crackVol;
      }
    }

    // Occasional bigger pops
    if (rng.next() < 0.0001) {
      const popLen = Math.floor(100 + rng.next() * 400);
      const popVol = 0.5 + rng.next() * 0.4;
      for (let j = 0; j < popLen && (i + j) < TOTAL_SAMPLES; j++) {
        const env = Math.exp(-j / (popLen * 0.1));
        samples[i + j] += whiteNoise(rng) * env * popVol;
      }
    }
  }

  return applyFades(normalize(samples));
}

function generateBirds() {
  console.log('  Generating birds...');
  const pink = new PinkNoiseGen(new SeededRandom(701));
  const rng = new SeededRandom(702);
  const bgLp = new LowPass(2000);
  const samples = new Float64Array(TOTAL_SAMPLES);

  // Gentle forest background
  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const mod = 0.3 + 0.05 * Math.sin(2 * Math.PI * 0.1 * t);
    samples[i] = bgLp.process(pink.next()) * mod * 0.2;
  }

  // Synthetic bird chirps
  const numBirds = 40 + Math.floor(rng.next() * 30); // 40-70 chirps
  for (let b = 0; b < numBirds; b++) {
    const startSec = 0.5 + rng.next() * (DURATION - 1);
    const startSample = Math.floor(startSec * SAMPLE_RATE);

    // Each "chirp" is a series of 1-4 short notes
    const numNotes = 1 + Math.floor(rng.next() * 4);
    let noteOffset = 0;

    for (let n = 0; n < numNotes; n++) {
      const noteLen = Math.floor(SAMPLE_RATE * (0.03 + rng.next() * 0.08)); // 30-110ms
      const startFreq = 2000 + rng.next() * 3000; // 2000-5000 Hz
      const endFreq = startFreq + (rng.next() - 0.5) * 2000; // sweep up or down
      const noteVol = 0.15 + rng.next() * 0.35;

      for (let j = 0; j < noteLen; j++) {
        const pos = startSample + noteOffset + j;
        if (pos >= TOTAL_SAMPLES) break;

        const t = j / noteLen;
        const freq = startFreq + (endFreq - startFreq) * t;
        const phase = 2 * Math.PI * freq * j / SAMPLE_RATE;
        // Bell-shaped envelope
        const env = Math.sin(Math.PI * t);
        // Mix sine with a bit of harmonics for realism
        const tone = Math.sin(phase) * 0.7 + Math.sin(phase * 2) * 0.2 + Math.sin(phase * 3) * 0.1;
        samples[pos] += tone * env * noteVol;
      }

      // Gap between notes in a chirp
      noteOffset += noteLen + Math.floor(SAMPLE_RATE * (0.02 + rng.next() * 0.05));
    }
  }

  return applyFades(normalize(samples, 0.75));
}

function generateCreek() {
  console.log('  Generating creek...');
  const pink = new PinkNoiseGen(new SeededRandom(801));
  const rng = new SeededRandom(802);
  const hp = new HighPass(500);
  const lp = new LowPass(6000);
  const samples = new Float64Array(TOTAL_SAMPLES);

  // Fast random amplitude modulation for babbling effect
  const babbleMod = new Float64Array(TOTAL_SAMPLES);
  let babbleVal = 0.5;
  const babbleSmooth = new LowPass(15); // moderately fast
  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    babbleVal += (rng.next() - 0.5) * 0.15;
    babbleVal = Math.max(0.1, Math.min(1.0, babbleVal));
    babbleMod[i] = babbleSmooth.process(babbleVal);
  }

  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    // Filtered pink noise (higher frequencies for water)
    const noise = lp.process(hp.process(pink.next()));

    // Layer with slower modulation for stream flow
    const flowMod = 0.5 + 0.2 * Math.sin(2 * Math.PI * 0.3 * t) + 0.1 * Math.sin(2 * Math.PI * 0.17 * t);

    samples[i] = noise * babbleMod[i] * flowMod;
  }

  // Add some quiet trickle transients
  const tricklePink = new PinkNoiseGen(new SeededRandom(803));
  const trickleHp = new HighPass(2000);
  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    if (rng.next() < 0.002) {
      const len = Math.floor(50 + rng.next() * 200);
      const vol = 0.1 + rng.next() * 0.2;
      for (let j = 0; j < len && (i + j) < TOTAL_SAMPLES; j++) {
        const env = Math.exp(-j / (len * 0.3));
        samples[i + j] += trickleHp.process(tricklePink.next()) * env * vol;
      }
    }
  }

  return applyFades(normalize(samples));
}

function generateFan() {
  console.log('  Generating fan...');
  const brown = new BrownNoiseGen(new SeededRandom(901), 0.999);
  const pink = new PinkNoiseGen(new SeededRandom(902));
  const rng = new SeededRandom(903);
  const lp = new LowPass(1500);
  const lp2 = new LowPass(2000);
  const samples = new Float64Array(TOTAL_SAMPLES);

  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;

    // Blend of brown and pink noise for that fan tone
    const brownSample = lp.process(brown.next());
    const pinkSample = lp2.process(pink.next());
    const body = brownSample * 0.55 + pinkSample * 0.45;

    // Very subtle modulation (fan blade rotation effect)
    // ~5 Hz for a typical fan with slight wobble
    const bladeMod = 1.0 + 0.02 * Math.sin(2 * Math.PI * 4.8 * t) + 0.01 * Math.sin(2 * Math.PI * 9.6 * t);

    // Extremely minimal volume variation (consistent hum)
    const drift = 1.0 + 0.015 * Math.sin(2 * Math.PI * 0.02 * t);

    samples[i] = body * bladeMod * drift;
  }

  return applyFades(normalize(samples));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log('🔊 Generating 9 ambient sound files...');
  console.log(`   Sample rate: ${SAMPLE_RATE} Hz | Duration: ${DURATION}s | Format: 16-bit mono WAV\n`);

  const generators = [
    { name: 'rain', fn: generateRain },
    { name: 'thunder', fn: generateThunder },
    { name: 'ocean', fn: generateOcean },
    { name: 'forest', fn: generateForest },
    { name: 'wind', fn: generateWind },
    { name: 'fireplace', fn: generateFireplace },
    { name: 'birds', fn: generateBirds },
    { name: 'creek', fn: generateCreek },
    { name: 'fan', fn: generateFan },
  ];

  for (const { name, fn } of generators) {
    const samples = fn();
    const outPath = path.join(OUTPUT_DIR, `${name}.wav`);
    writeWav(outPath, samples);
  }

  // Remove old .mp3 placeholders
  console.log('\n🗑️  Removing old .mp3 placeholders...');
  for (const { name } of generators) {
    const mp3Path = path.join(OUTPUT_DIR, `${name}.mp3`);
    if (fs.existsSync(mp3Path)) {
      fs.unlinkSync(mp3Path);
      console.log(`  ✓ Removed ${name}.mp3`);
    }
  }

  console.log('\n✅ All 9 ambient sounds generated successfully!');
}

main();
