#!/usr/bin/env node
/**
 * Sound Mixer — Audio Download & Processing Tool
 * 
 * Downloads ambient sound files from URLs and saves them to assets/sounds/
 * Converts to appropriate format for expo-av playback.
 * 
 * Usage:
 *   node tools/download-sounds.js
 * 
 * Edit the SOUNDS array below with URLs from Pixabay, Freesound, etc.
 * Then run the script to download all sounds.
 * 
 * License: Only use CC0 / Pixabay Content License sounds (no attribution required)
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOUNDS_DIR = join(__dirname, '..', 'assets', 'sounds');

// ============================================================
// EDIT THESE URLs — paste download links from Pixabay/Freesound
// ============================================================
const SOUNDS = [
  // { name: 'rain',      url: 'https://cdn.pixabay.com/audio/...' },
  // { name: 'thunder',   url: 'https://cdn.pixabay.com/audio/...' },
  // { name: 'ocean',     url: 'https://cdn.pixabay.com/audio/...' },
  // { name: 'forest',    url: 'https://cdn.pixabay.com/audio/...' },
  // { name: 'wind',      url: 'https://cdn.pixabay.com/audio/...' },
  // { name: 'fireplace', url: 'https://cdn.pixabay.com/audio/...' },
  // { name: 'birds',     url: 'https://cdn.pixabay.com/audio/...' },
  // { name: 'creek',     url: 'https://cdn.pixabay.com/audio/...' },
  // { name: 'fan',       url: 'https://cdn.pixabay.com/audio/...' },
];

async function downloadSound(name, url) {
  console.log(`⬇️  Downloading ${name}...`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    
    // Determine extension from URL or content-type
    const contentType = response.headers.get('content-type') || '';
    let ext = '.mp3';
    if (url.endsWith('.wav') || contentType.includes('wav')) ext = '.wav';
    if (url.endsWith('.ogg') || contentType.includes('ogg')) ext = '.ogg';
    if (url.endsWith('.m4a') || contentType.includes('m4a')) ext = '.m4a';
    
    const filePath = join(SOUNDS_DIR, `${name}${ext}`);
    writeFileSync(filePath, buffer);
    
    const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
    console.log(`   ✅ ${name}${ext} (${sizeMB} MB)`);
    
    return { name, ext, size: buffer.length, success: true };
  } catch (error) {
    console.log(`   ❌ ${name}: ${error.message}`);
    return { name, success: false, error: error.message };
  }
}

async function main() {
  console.log('🎵 Sound Mixer — Audio Downloader\n');
  
  if (!existsSync(SOUNDS_DIR)) {
    mkdirSync(SOUNDS_DIR, { recursive: true });
  }
  
  const activeSounds = SOUNDS.filter(s => s.url);
  
  if (activeSounds.length === 0) {
    console.log('No URLs configured yet!\n');
    console.log('How to use:');
    console.log('1. Go to https://pixabay.com/sound-effects/');
    console.log('2. Search for each sound (e.g. "rain loop", "ocean waves")');
    console.log('3. Click a sound → Download → Copy the download URL');
    console.log('4. Paste the URL into the SOUNDS array in this file');
    console.log('5. Run this script again\n');
    console.log('Sounds needed:');
    console.log('  rain, thunder, ocean, forest, wind, fireplace, birds, creek, fan\n');
    console.log('Note: white-noise, pink-noise, brown-noise are already generated as WAV files.');
    return;
  }
  
  console.log(`Downloading ${activeSounds.length} sounds...\n`);
  
  const results = [];
  for (const sound of activeSounds) {
    const result = await downloadSound(sound.name, sound.url);
    results.push(result);
  }
  
  console.log('\n--- Summary ---');
  const success = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  console.log(`✅ Downloaded: ${success.length}`);
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}`);
    failed.forEach(f => console.log(`   - ${f.name}: ${f.error}`));
  }
  
  if (success.length > 0) {
    console.log('\n⚠️  Next steps:');
    console.log('1. Update src/constants/sounds.ts to match file extensions');
    console.log('2. Test each sound in the app (expo start)');
    console.log('3. Check loop quality — sounds should be seamless');
    console.log('4. If a sound doesn\'t loop well, try a different source');
  }
}

main().catch(console.error);
