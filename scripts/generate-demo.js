#!/usr/bin/env node
/**
 * Generate demo GIF from Playwright recording
 * Records a quick demo of LuminaCV functionality
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function generateDemo() {
  console.log('🎬 Starting demo recording...\n');

  let browser;
  try {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      recordVideo: { dir: './videos' },
      viewport: { width: 1280, height: 720 }
    });

    const page = await context.newPage();

    console.log('📄 Loading application...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log('✍️  Filling personal info...');
    await page.fill('#fullName', 'Sarah Johnson');
    await page.waitForTimeout(500);
    await page.fill('#email', 'sarah@example.com');
    await page.waitForTimeout(500);
    await page.fill('#phone', '(555) 123-4567');
    await page.waitForTimeout(1000);

    console.log('💼 Adding experience...');
    await page.click('button.btn-add');
    await page.waitForTimeout(500);
    const expInputs = page.locator('.entry-card input');
    await expInputs.first().fill('Senior Software Engineer');
    await page.waitForTimeout(300);
    await page.locator('.entry-card textarea').first().fill('Led team of 5, shipped 10+ features');
    await page.waitForTimeout(1000);

    console.log('⚙️  Opening settings...');
    await page.click('[aria-label="Open settings for customization"]');
    await page.waitForTimeout(500);
    
    console.log('🎨 Changing template...');
    const templateSelect = page.locator('select').first();
    await templateSelect.selectOption('modern');
    await page.waitForTimeout(1000);

    console.log('🔗 Generating share URL...');
    await page.click('[aria-label="Generate shareable URL"]');
    await page.waitForTimeout(1500);

    console.log('📥 Exporting PDF...');
    await page.click('[aria-label="Export resume as PDF"]');
    await page.waitForTimeout(1000);

    await context.close();

    console.log('\n✅ Demo recording complete!');
    console.log('📁 Video saved to: ./videos/');

    // List video files
    const videosDir = './videos';
    if (fs.existsSync(videosDir)) {
      const files = fs.readdirSync(videosDir);
      console.log('📊 Video files:', files);
      
      if (files.length > 0) {
        const videoPath = path.join(videosDir, files[0]);
        console.log(`\n🎬 Video file: ${videoPath}`);
        console.log('Size:', (fs.statSync(videoPath).size / 1024 / 1024).toFixed(2), 'MB');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

generateDemo();
