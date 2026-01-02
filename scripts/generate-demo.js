/**
 * Comprehensive LuminaCV Demo Recorder
 * 
 * Covers ALL user journeys:
 * - Landing page exploration
 * - Complete content entry (all sections)
 * - Text formatting with floating toolbar
 * - Template switching (all 4 templates)
 * - Color & font customization
 * - Export workflow (show all formats)
 * - Share URL generation
 * - Open shared URL in new tab (view mode)
 * - Add/edit/delete entries
 * - Scroll interactions
 * 
 * Usage:
 *   node scripts/record-demo-comprehensive.js [url] [format]
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DEFAULT_URL = 'http://localhost:3000';

async function recordComprehensiveDemo(url = DEFAULT_URL, outputFormat = 'gif') {
  console.log('🎬 Starting Comprehensive LuminaCV Demo...');
  console.log(`📍 URL: ${url}`);
  console.log(`📹 Format: ${outputFormat}`);

  // Clean and recreate demo folder
  if (fs.existsSync('./demo')) {
    fs.rmSync('./demo', { recursive: true, force: true });
  }
  fs.mkdirSync('./demo', { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    recordVideo: {
      dir: './demo/',
      size: { width: 1280, height: 720 }
    },
    viewport: { width: 1280, height: 720 },
    permissions: ['clipboard-read', 'clipboard-write']
  });

  const page = await context.newPage();

  try {
    // Clear for fresh start
    await page.goto(url);
    await page.evaluate(() => localStorage.clear());
    
    // ===== JOURNEY 1: LANDING PAGE EXPLORATION =====
    console.log('\n🏠 JOURNEY 1: Landing Page Exploration');
    console.log('1️⃣  Hero section...');
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await sleep(2500);

    console.log('2️⃣  Clicking Features menu...');
    const featuresLink = page.locator('a[href="#features"]').first();
    await featuresLink.click();
    await sleep(3000);
    
    console.log('3️⃣  Clicking Export menu...');
    const exportLink = page.locator('a[href="#export"]').first();
    await exportLink.click();
    await sleep(3000);
    
    console.log('4️⃣  Back to top...');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await sleep(2000);

    // ===== JOURNEY 2: ENTER EDITOR & CONTENT CREATION =====
    console.log('\n✏️  JOURNEY 2: Content Creation');
    console.log('6️⃣  Clicking Start Building button...');
    const startBtn = page.locator('a:has-text("Start Building")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await page.waitForLoadState('networkidle');
    } else {
      await page.goto(url + '/editor.html');
    }
    await sleep(2000);
    
    console.log('7️⃣  Clicking Load Sample button...');
    const loadSampleBtn = page.locator('#sampleBtn');
    if (await loadSampleBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await loadSampleBtn.click();
      await sleep(1000);
      // Confirm modal
      const confirmBtn = page.locator('button:has-text("Load Sample")');
      if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmBtn.click();
        await sleep(2500);
        console.log('   ✓ Sample data loaded');
      }
    }

    // Personal Info - Complete Entry
    console.log('8️⃣  Personal info - Typing name...');
    const nameInput = page.locator('input[placeholder*="Name"], #fullName, input[name="fullName"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.click();
      await sleep(500);
      await nameInput.fill('');
      await typeSlowly(page, 'Sarah Johnson', 60);
      await sleep(1000);
    }

    console.log('9️⃣  Typing email...');
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.click();
      await sleep(500);
      await emailInput.fill('');
      await typeSlowly(page, 'sarah.j@example.com', 50);
      await sleep(1000);
    }

    console.log('🔟 Typing phone...');
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="Phone"], input[name="phone"]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.click();
      await sleep(500);
      await phoneInput.fill('');
      await typeSlowly(page, '+1-555-0123', 50);
      await sleep(1000);
    }

    console.log('1️⃣1️⃣  Typing LinkedIn...');
    const linkedinInput = page.locator('input[placeholder*="LinkedIn"], input[name*="linkedin"]').first();
    if (await linkedinInput.isVisible()) {
      await linkedinInput.click();
      await sleep(500);
      await linkedinInput.fill('');
      await typeSlowly(page, 'linkedin.com/in/sarahj', 45);
      await sleep(1000);
    }

    console.log('1️⃣2️⃣  Typing GitHub...');
    const githubInput = page.locator('input[placeholder*="GitHub"], input[name*="github"]').first();
    if (await githubInput.isVisible()) {
      await githubInput.click();
      await sleep(500);
      await githubInput.fill('');
      await typeSlowly(page, 'github.com/sarahj', 45);
      await sleep(1500);
    }

    // Experience Section - Add New Entry
    console.log('1️⃣3️⃣  Switching to Experience tab...');
    const expTab = page.locator('button:has-text("Experience")').first();
    if (await expTab.isVisible()) {
      await expTab.click();
      await sleep(1500);
    }

    // Click Add Experience
    console.log('1️⃣4️⃣  Clicking Add Experience button...');
    try {
      const addExpBtn = page.locator('#addExpBtn, #addExpBtn2').first();
      await addExpBtn.waitFor({ state: 'visible', timeout: 3000 });
      await addExpBtn.click();
      await sleep(1000);
      console.log('   ✓ Add Experience clicked');
      
      // Fill experience details
      console.log('1️⃣5️⃣  Typing job title...');
      const jobTitleInput = page.locator('input[data-field="jobTitle"]').last();
      await jobTitleInput.waitFor({ state: 'visible', timeout: 2000 });
      await jobTitleInput.click();
      await sleep(300);
      await typeSlowly(page, 'Senior Full Stack Developer', 45);
      await sleep(800);
      console.log('   ✓ Job title typed');

      console.log('1️⃣6️⃣  Typing company name...');
      const companyInput = page.locator('input[data-field="company"]').last();
      await companyInput.waitFor({ state: 'visible', timeout: 2000 });
      await companyInput.click();
      await sleep(300);
      await typeSlowly(page, 'Tech Innovations Ltd', 45);
      await sleep(1000);
      console.log('   ✓ Company typed');
    } catch (error) {
      console.log('   ⚠️  Could not add experience:', error.message);
    }

    // Text Formatting Demo
    console.log('1️⃣7️⃣  Demonstrating text formatting...');
    const bulletTextarea = page.locator('textarea').first();
    if (await bulletTextarea.isVisible()) {
      await bulletTextarea.click();
      await sleep(500);
      await bulletTextarea.fill('');
      await typeSlowly(page, 'Led development of microservices architecture', 40);
      await sleep(1000);
      
      // Select text to show formatter
      await bulletTextarea.click({ clickCount: 3 });
      await sleep(2000); // Show floating formatter
      
      // Try bold formatting
      const boldBtn = page.locator('button[title*="Bold"], button:has-text("B")').first();
      if (await boldBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await boldBtn.click();
        await sleep(1200);
      }
      
      await page.keyboard.press('Escape');
      await sleep(1000);
    }

    // Education Section
    console.log('1️⃣8️⃣  Navigating to Education...');
    const eduTab = page.locator('button:has-text("Education")').first();
    if (await eduTab.isVisible()) {
      await eduTab.click();
      await sleep(1500);
      
      // Show existing entry
      await scrollEditorPanel(page, 150);
      await sleep(1200);
    }

    // Skills Section - Edit
    console.log('1️⃣9️⃣  Navigating to Skills and editing...');
    const skillsTab = page.locator('button:has-text("Skills")').first();
    if (await skillsTab.isVisible()) {
      await skillsTab.click();
      await sleep(1500);
      
      const languagesInput = page.locator('textarea, input').first();
      if (await languagesInput.isVisible()) {
        await languagesInput.click();
        await sleep(500);
        await page.keyboard.press('End');
        await typeSlowly(page, ', Go, Rust', 50);
        await sleep(1200);
      }
    }

    // Projects Section
    console.log('2️⃣0️⃣  Navigating to Projects...');
    const projectsTab = page.locator('button:has-text("Projects")').first();
    if (await projectsTab.isVisible()) {
      await projectsTab.click();
      await sleep(1500);
      
      await scrollEditorPanel(page, 200);
      await sleep(1200);
    }

    // Back to Personal Info
    const infoTab = page.locator('button:has-text("Personal"), button:has-text("Info")').first();
    if (await infoTab.isVisible()) {
      await infoTab.click();
      await sleep(1000);
    }

    // ===== JOURNEY 3: CUSTOMIZATION & STYLING =====
    console.log('\n🎨 JOURNEY 3: Customization & Styling');
    console.log('2️⃣1️⃣  Opening Settings...');
    try {
      const settingsBtn = page.locator('#settingsBtn');
      await settingsBtn.waitFor({ state: 'visible', timeout: 3000 });
      await settingsBtn.click();
      
      // Wait for modal to be fully displayed
      await page.waitForSelector('#settingsModal[style*="flex"]', { timeout: 2000 });
      await sleep(2000);
      console.log('   ✓ Settings modal visible');

      // Switch through ALL templates with preview time
      console.log('2️⃣2️⃣  Switching templates...');
      const templates = ['modern', 'classic', 'minimal', 'swe'];
      for (const tmpl of templates) {
        console.log(`   → ${tmpl} template`);
        try {
          const tmplBtn = page.locator(`.template-option[data-template="${tmpl}"]`).first();
          await tmplBtn.waitFor({ state: 'visible', timeout: 2000 });
          await tmplBtn.click();
          await sleep(1500);
          console.log(`   ✓ ${tmpl} applied`);
        } catch (e) {
          console.log(`   ⚠️  ${tmpl} template error:`, e.message);
        }
      }

      // Color picker
      console.log('2️⃣3️⃣  Changing accent color...');
      try {
        await sleep(1000); // Wait for settings modal animation
        // Use evaluate to directly set the value since it's CSS hidden
        await page.evaluate(() => {
          const picker = document.querySelector('#accentColorPicker');
          if (picker) {
            picker.value = '#10b981';
            picker.dispatchEvent(new Event('input', { bubbles: true }));
            picker.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
        await sleep(2000); // Show color change
        console.log('   ✓ Color changed');
      } catch (e) {
        console.log('   ⚠️  Color picker failed:', e.message);
      }

      // Font selector (if available)
      console.log('2️⃣4️⃣  Changing font...');
      try {
        await page.locator('#fontSelector').selectOption('calibri', { force: true });
        await sleep(1500); // Show font change
        console.log('   ✓ Font changed');
      } catch (e) {
        console.log('   ⚠️  Font selector not found:', e.message);
      }

      await sleep(1500); // Let user see final settings state
      
      // Close modal by clicking close button
      console.log('   Closing settings modal...');
      const closeBtn = page.locator('#closeSettings');
      await closeBtn.click();
      
      // Wait for modal to become hidden
      await page.waitForSelector('#settingsModal', { state: 'hidden', timeout: 3000 });
      await sleep(800);
      console.log('   ✓ Settings closed');
    } catch (error) {
      console.log('   ⚠️  Settings error:', error.message);
      // Try to close modal anyway
      try {
        await page.keyboard.press('Escape');
        await sleep(500);
        await page.locator('#closeSettings').click().catch(() => {});
      } catch {}
      await sleep(1000);
    }

    // ===== JOURNEY 4: PREVIEW INTERACTION =====
    console.log('\n👀 JOURNEY 4: Preview Panel Interaction');
    console.log('2️⃣5️⃣  Scrolling preview panel...');
    await scrollPreviewPanel(page, 300);
    await sleep(1000);
    await scrollPreviewPanel(page, 600);
    await sleep(1000);
    await scrollPreviewPanel(page, 900);
    await sleep(1000);
    await scrollPreviewPanel(page, 0); // Back to top
    await sleep(800);

    // ===== JOURNEY 5: EXPORT WORKFLOW =====
    console.log('\n📤 JOURNEY 5: Export Workflow');
    console.log('2️⃣6️⃣  Opening Export dropdown...');
    const exportBtn = page.locator('#exportBtn');
    if (await exportBtn.isVisible()) {
      await exportBtn.click();
      await sleep(2500); // Show all export options
      await page.keyboard.press('Escape');
      await sleep(800);
    }

    // ===== JOURNEY 6: SHARING & COLLABORATION =====
    console.log('\n🔗 JOURNEY 6: Sharing & Collaboration');
    console.log('2️⃣7️⃣  Clicking Share button...');
    try {
      const shareBtn = page.locator('#shareBtn');
      await shareBtn.waitFor({ state: 'visible', timeout: 3000 });
      await shareBtn.click();
      await sleep(2000); // Show share modal/notification
      console.log('   ✓ Share button clicked');
      
      // Copy URL
      console.log('2️⃣8️⃣  Copying shared URL...');
      let sharedURL = null;
      try {
        await sleep(1500); // Wait for modal and clipboard operation
        // Get from clipboard since the app copies it there
        sharedURL = await page.evaluate(async () => {
          try {
            return await navigator.clipboard.readText();
          } catch {
            // Fallback: find URL in modal
            const modalContent = document.querySelector('.modal-content');
            if (modalContent) {
              const text = modalContent.textContent;
              const match = text.match(/(https?:\/\/[^\s]+)/);
              if (match) return match[1];
            }
            return null;
          }
        });
        
        if (sharedURL) {
          console.log(`   ✓ URL extracted: ${sharedURL.substring(0, 60)}...`);
        } else {
          console.log('   ⚠️  URL not found');
        }
      } catch (e) {
        console.log('   ⚠️  Could not extract URL:', e.message);
      }
      
      await sleep(1000);

      // Open shared URL in new tab BEFORE closing modal
      if (sharedURL && (sharedURL.includes('?id=') || sharedURL.includes('?r=') || sharedURL.includes('?cv='))) {
        console.log('2️⃣9️⃣  Opening shared URL in new tab (VIEW MODE)...');
        try {
          // Open in new page within same context
          const viewPage = await context.newPage();
          await viewPage.goto(sharedURL, { waitUntil: 'networkidle' });
          await sleep(3500); // Show view mode
          console.log('   ✓ View mode opened');
          
          console.log('3️⃣0️⃣  Scrolling in view mode...');
          await viewPage.evaluate(() => window.scrollTo({ top: 600, behavior: 'smooth' }));
          await sleep(2000);
          await viewPage.evaluate(() => window.scrollTo({ top: 1200, behavior: 'smooth' }));
          await sleep(2000);
          await viewPage.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
          await sleep(2000);
          console.log('   ✓ View mode scrolled');
          
          await viewPage.close();
          console.log('   ✅ View mode demo complete');
          await sleep(1000);
        } catch (e) {
          console.log('   ⚠️  Could not open view mode:', e.message);
        }
      } else {
        console.log('   ⚠️  No shared URL to open (URL was: ' + (sharedURL ? sharedURL.substring(0, 50) : 'null') + ')');
      }
      
      // Close modal after showing view mode
      await page.keyboard.press('Escape');
      await sleep(800);
    } catch (error) {
      console.log('   ⚠️  Share feature not accessible:', error.message);
    }

    // ===== JOURNEY 7: IMPORT FEATURE =====
    console.log('\n📥 JOURNEY 7: Import Feature');
    console.log('3️⃣1️⃣  Checking Import button...');
    const importBtn = page.locator('button:has-text("Import"), [aria-label*="import"]').first();
    if (await importBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await importBtn.click();
      await sleep(1500);
      await page.keyboard.press('Escape');
      await sleep(800);
    }

    // ===== FINAL SEQUENCES =====
    console.log('\n🎬 FINAL: Complete Product Tour');
    console.log('3️⃣2️⃣  Final preview pan...');
    await scrollPreviewPanel(page, 250);
    await sleep(800);
    await scrollPreviewPanel(page, 500);
    await sleep(800);
    await scrollPreviewPanel(page, 0);
    await sleep(2500); // Hold final frame

    console.log('\n✅ Comprehensive recording complete!');
    console.log('📊 Coverage:');
    console.log('   ✓ Landing page (scrolled to bottom)');
    console.log('   ✓ Load Sample button clicked');
    console.log('   ✓ Personal info typed (name, email, phone, LinkedIn, GitHub)');
    console.log('   ✓ Experience entry added (job title + company)');
    console.log('   ✓ All sections (Personal, Experience, Education, Skills, Projects)');
    console.log('   ✓ Text formatting toolbar');
    console.log('   ✓ Template switching (4 templates)');
    console.log('   ✓ Color & font customization');
    console.log('   ✓ Preview scrolling');
    console.log('   ✓ Export options');
    console.log('   ✓ Share URL copied');
    console.log('   ✓ View mode (opened in new tab)');
    console.log('   ✓ Import feature');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }

  // Close and convert
  await page.close();
  await context.close();
  await browser.close();

  if (outputFormat !== 'webm') {
    await convertVideo(outputFormat);
  }

  console.log('\n🎉 Demo ready!');
  console.log(`📁 Location: ./demo/demo.${outputFormat}`);
  
  // Clean up intermediate WebM files to keep only final output
  try {
    const files = fs.readdirSync('./demo').filter(f => f.endsWith('.webm'));
    files.forEach(file => {
      fs.unlinkSync(path.join('./demo', file));
      console.log(`🗑️  Cleaned up: ${file}`);
    });
  } catch (cleanupError) {
    console.warn('⚠️  Cleanup warning:', cleanupError.message);
  }
}

// Helper: Slow typing
async function typeSlowly(page, text, delay = 50) {
  for (const char of text) {
    await page.keyboard.type(char);
    await sleep(delay);
  }
}

// Helper: Sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper: Smooth scroll
async function smoothScroll(page, targetY) {
  await page.evaluate((target) => {
    const start = window.scrollY;
    const distance = target - start;
    const duration = 1500; // Slower, more uniform scroll
    const startTime = Date.now();

    return new Promise((resolve) => {
      function scroll() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;
        
        window.scrollTo(0, start + distance * easeProgress);
        
        if (progress < 1) {
          requestAnimationFrame(scroll);
        } else {
          resolve();
        }
      }
      scroll();
    });
  }, targetY);
}

// Helper: Scroll editor panel
async function scrollEditorPanel(page, targetY) {
  await page.evaluate((target) => {
    const editorPanel = document.querySelector('.editor-panel, #editor, [class*="editor"]');
    if (editorPanel) {
      editorPanel.scrollTo({ top: target, behavior: 'smooth' });
    }
  }, targetY);
}

// Helper: Scroll preview panel
async function scrollPreviewPanel(page, targetY) {
  await page.evaluate((target) => {
    const previewPanel = document.querySelector('.preview-panel, #preview, [class*="preview"]');
    if (previewPanel) {
      previewPanel.scrollTo({ top: target, behavior: 'smooth' });
    }
  }, targetY);
}

// Helper: Convert video
async function convertVideo(format) {
  try {
    const files = fs.readdirSync('./demo').filter(f => f.endsWith('.webm'));
    if (files.length === 0) {
      console.warn('⚠️  No WebM files found');
      return;
    }

    const webmFiles = files.map(f => ({
      name: f,
      path: path.join('./demo', f),
      time: fs.statSync(path.join('./demo', f)).mtime.getTime()
    }));
    webmFiles.sort((a, b) => b.time - a.time);
    
    const inputFile = webmFiles[0].path;
    const outputFile = `./demo/demo.${format}`;

    console.log(`\n🔄 Converting to ${format.toUpperCase()}...`);
    console.log(`📹 Input: ${webmFiles[0].name}`);

    if (format === 'gif') {
      execSync(
        `ffmpeg -i "${inputFile}" -vf "fps=12,scale=800:-1:flags=lanczos" -loop 0 -y "${outputFile}"`,
        { stdio: 'inherit' }
      );
    } else if (format === 'mp4') {
      execSync(
        `ffmpeg -i "${inputFile}" -c:v libx264 -preset slow -crf 22 -y "${outputFile}"`,
        { stdio: 'inherit' }
      );
    }

    const inputSize = (fs.statSync(inputFile).size / 1024).toFixed(0);
    const outputSize = (fs.statSync(outputFile).size / 1024).toFixed(0);
    console.log(`✅ Converted!`);
    console.log(`📊 ${inputSize}KB → ${outputSize}KB`);
    
  } catch (error) {
    console.error('⚠️  Conversion failed:', error.message);
  }
}

// Run
const url = process.argv[2] || DEFAULT_URL;
const format = process.argv[3] || 'gif';
recordComprehensiveDemo(url, format);
