#!/usr/bin/env node
/**
 * Convert Playwright webm video to animated GIF
 * Requires ffmpeg to be installed
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function videoToGif() {
  try {
    // Check if ffmpeg is available
    execSync('which ffmpeg', { stdio: 'ignore' });
  } catch {
    console.log('⚠️  ffmpeg not found. Installing via Homebrew...');
    try {
      execSync('brew install ffmpeg', { stdio: 'inherit' });
    } catch {
      console.error('❌ Failed to install ffmpeg');
      console.error('Please install manually: brew install ffmpeg');
      process.exit(1);
    }
  }

  const videosDir = './videos';
  const outputDir = './public';

  if (!fs.existsSync(videosDir)) {
    console.error('❌ No videos directory found. Run: npm run record-demo');
    process.exit(1);
  }

  const webmFile = fs.readdirSync(videosDir).find(f => f.endsWith('.webm'));
  if (!webmFile) {
    console.error('❌ No .webm video found in videos directory');
    process.exit(1);
  }

  const inputPath = path.join(videosDir, webmFile);
  const outputPath = path.join(outputDir, 'demo.gif');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🎬 Converting video to GIF...');
  console.log(`📁 Input: ${inputPath}`);
  console.log(`📁 Output: ${outputPath}`);

  try {
    // Convert webm to gif with palette optimization
    execSync(
      `ffmpeg -i ${inputPath} -vf "fps=10,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 ${outputPath}`,
      { stdio: 'inherit' }
    );

    const gifSize = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);
    console.log(`\n✅ GIF created successfully!`);
    console.log(`📊 Size: ${gifSize} MB`);
    console.log(`📍 Location: ${outputPath}`);

  } catch (error) {
    console.error('❌ FFmpeg conversion failed:', error.message);
    process.exit(1);
  }
}

videoToGif();
